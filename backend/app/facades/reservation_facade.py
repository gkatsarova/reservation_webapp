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
                return False, "Venue not found", 404

            if user.user_type.value == 'owner':
                return False, "Only customers can make reservations", 403

            required_fields = ['reservation_time', 'party_size']
            if not all(field in data for field in required_fields):
                return False, "Missing required fields", 400

            try:
                reservation_time = datetime.strptime(data['reservation_time'], "%Y-%m-%d %H:%M")
                if reservation_time < datetime.utcnow():
                    return False, "Reservation time must be in the future", 400
            except ValueError:
                return False, "Invalid datetime format", 400

            existing_reservation = Reservation.query.filter_by(
                venue_id=venue_id,
                reservation_time=reservation_time
            ).first()
            if existing_reservation:
                return False, "This time slot is already taken", 400

            reservation = Reservation(
                venue_id=venue_id,
                customer_id=user.id,
                reservation_time=reservation_time,
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
            }, 201
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Database error creating reservation: {str(e)}")
            return False, "Database error occurred", 500
        except Exception as e:
            print(f"Error creating reservation: {str(e)}")
            return False, str(e), 500

    def update_reservation(self, reservation_id, user, data):
        try:
            reservation = Reservation.query.get(reservation_id)
            if not reservation:
                return False, "Reservation not found"

            is_customer = reservation.customer_id == user.id
            venue = Venue.query.get(reservation.venue_id)
            is_owner = venue and venue.owner_id == user.id

            if not (is_customer or is_owner):
                return False, "No permission to update this reservation"

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
                return False, "Reservation not found", 404

            venue = Venue.query.get(reservation.venue_id)
            if not venue:
                return False, "Venue not found", 404

            if reservation.customer_id != user.id:
                return False, "No permission to delete this reservation", 403

            db.session.delete(reservation)
            db.session.commit()
            return True, "Reservation deleted successfully", 200
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Database error deleting reservation: {str(e)}")
            return False, "Database error occurred", 500
        except Exception as e:
            print(f"Error deleting reservation: {str(e)}")
            return False, str(e), 500

    def get_venue_reservations(self, venue_id, user):
        try:
            venue = Venue.query.get(venue_id)
            if not venue:
                return False, "Venue not found"

            if venue.owner_id != user.id:
                return False, "No permission to view these reservations"

            reservations = Reservation.query.filter_by(venue_id=venue_id).all()
            return True, [{
                'id': reservation.id,
                'venue_id': reservation.venue_id,
                'venue_name': venue.name,
                'reservation_time': reservation.reservation_time.isoformat(),
                'party_size': reservation.party_size,
                'notes': reservation.notes,
                'status': reservation.status.value,
                'customer_name': User.query.get(reservation.customer_id).username,
                'customer_id': reservation.customer_id
            } for reservation in reservations]
        except Exception as e:
            print(f"Error getting venue reservations: {str(e)}")
            return False, str(e) 