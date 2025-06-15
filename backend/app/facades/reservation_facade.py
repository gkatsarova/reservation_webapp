from ..models import Reservation, Venue, User, ReservationStatus
from ..extensions import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

class ReservationFacade:
    def __init__(self):
        pass

    def get_reservations_for_user(self, user):
        try:
            if user.user_type.value == 'owner':
                venues = Venue.query.filter_by(owner_id=user.id).all()
                venue_ids = [venue.id for venue in venues]
                reservations = Reservation.query.filter(Reservation.venue_id.in_(venue_ids)).all()
            else:
                reservations = Reservation.query.filter_by(customer_id=user.id).all()
            
            return [{
                'id': reservation.id,
                'venue_id': reservation.venue_id,
                'venue_name': Venue.query.get(reservation.venue_id).name,
                'reservation_time': reservation.reservation_time.isoformat(),
                'party_size': reservation.party_size,
                'notes': reservation.notes,
                'status': reservation.status.value,
                'customer_name': User.query.get(reservation.customer_id).username,
                'customer_id': reservation.customer_id
            } for reservation in reservations]
        except Exception as e:
            print(f"Error getting reservations: {str(e)}")
            return []

    def create_reservation(self, user, venue_id, data):
        try:
            venue = Venue.query.get(venue_id)
            if not venue:
                return False, "Venue not found"

            required_fields = ['start_time', 'party_size']
            if not all(field in data for field in required_fields):
                return False, "Missing required fields"

            try:
                start_time = datetime.fromisoformat(data['start_time'])
            except ValueError:
                return False, "Invalid datetime format"

            reservation = Reservation(
                venue_id=venue_id,
                customer_id=user.id,
                reservation_time=start_time,
                party_size=data['party_size'],
                status='PENDING',
                notes=data.get('notes', '')
            )

            db.session.add(reservation)
            db.session.commit()

            return True, {
                'id': reservation.id,
                'venue_id': reservation.venue_id,
                'customer_id': reservation.customer_id,
                'reservation_time': reservation.reservation_time.isoformat(),
                'party_size': reservation.party_size,
                'status': reservation.status.value,
                'notes': reservation.notes
            }
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Database error creating reservation: {str(e)}")
            return False, "Database error occurred"
        except Exception as e:
            print(f"Error creating reservation: {str(e)}")
            return False, str(e)

    def update_reservation(self, reservation_id, user, data):
        try:
            reservation = Reservation.query.get(reservation_id)
            if not reservation:
                return False, "Reservation not found"

            # Check if user is the customer or the venue owner
            is_customer = reservation.customer_id == user.id
            venue = Venue.query.get(reservation.venue_id)
            is_owner = venue and venue.owner_id == user.id

            if not (is_customer or is_owner):
                return False, "No permission to update this reservation"

            # Only owner can update status
            if 'status' in data and not is_owner:
                return False, "Only venue owner can update reservation status"

            if 'start_time' in data:
                reservation.reservation_time = datetime.fromisoformat(data['start_time'])
            if 'party_size' in data:
                reservation.party_size = data['party_size']
            if 'status' in data:
                try:
                    reservation.status = ReservationStatus[data['status'].upper()]
                except KeyError:
                    return False, f"Invalid status: {data['status']}"
            if 'notes' in data:
                reservation.notes = data['notes']

            db.session.commit()

            return True, {
                'id': reservation.id,
                'venue_id': reservation.venue_id,
                'customer_id': reservation.customer_id,
                'reservation_time': reservation.reservation_time.isoformat(),
                'party_size': reservation.party_size,
                'status': reservation.status.value,
                'notes': reservation.notes
            }
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Database error updating reservation: {str(e)}")
            return False, "Database error occurred"
        except Exception as e:
            print(f"Error updating reservation: {str(e)}")
            return False, str(e)

    def delete_reservation(self, reservation_id, user):
        try:
            reservation = Reservation.query.get(reservation_id)
            if not reservation:
                return False, "Reservation not found"

            if reservation.customer_id != user.id:
                venue = Venue.query.get(reservation.venue_id)
                if not venue or venue.owner_id != user.id:
                    return False, "No permission to delete this reservation"

            db.session.delete(reservation)
            db.session.commit()
            return True, "Reservation deleted successfully"
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Database error deleting reservation: {str(e)}")
            return False, "Database error occurred"
        except Exception as e:
            print(f"Error deleting reservation: {str(e)}")
            return False, str(e) 