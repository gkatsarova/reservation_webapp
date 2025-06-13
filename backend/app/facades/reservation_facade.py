from ..models import Reservation, Venue, User
from ..extensions import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

class ReservationFacade:
    def __init__(self):
        pass

    def get_reservations_for_user(self, user):
        try:
            if user.user_type == 'OWNER':
                venues = Venue.query.filter_by(owner_id=user.id).all()
                venue_ids = [venue.id for venue in venues]
                reservations = Reservation.query.filter(Reservation.venue_id.in_(venue_ids)).all()
            else:
                reservations = Reservation.query.filter_by(user_id=user.id).all()
            
            return [{
                'id': reservation.id,
                'venue_id': reservation.venue_id,
                'user_id': reservation.user_id,
                'start_time': reservation.start_time.isoformat(),
                'end_time': reservation.end_time.isoformat(),
                'party_size': reservation.party_size,
                'status': reservation.status,
                'price': reservation.price
            } for reservation in reservations]
        except Exception as e:
            print(f"Error getting reservations: {str(e)}")
            return []

    def create_reservation(self, user, venue_id, data):
        try:
            venue = Venue.query.get(venue_id)
            if not venue:
                return False, "Venue not found"

            required_fields = ['start_time', 'end_time', 'party_size']
            if not all(field in data for field in required_fields):
                return False, "Missing required fields"

            try:
                start_time = datetime.fromisoformat(data['start_time'])
                end_time = datetime.fromisoformat(data['end_time'])
            except ValueError:
                return False, "Invalid datetime format"

            reservation = Reservation(
                venue_id=venue_id,
                user_id=user.id,
                start_time=start_time,
                end_time=end_time,
                party_size=data['party_size'],
                status='PENDING',
                price=data.get('price', 0.0)
            )

            db.session.add(reservation)
            db.session.commit()

            return True, {
                'id': reservation.id,
                'venue_id': reservation.venue_id,
                'user_id': reservation.user_id,
                'start_time': reservation.start_time.isoformat(),
                'end_time': reservation.end_time.isoformat(),
                'party_size': reservation.party_size,
                'status': reservation.status,
                'price': reservation.price
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

            if reservation.user_id != user.id:
                venue = Venue.query.get(reservation.venue_id)
                if not venue or venue.owner_id != user.id:
                    return False, "No permission to update this reservation"

            if 'start_time' in data:
                reservation.start_time = datetime.fromisoformat(data['start_time'])
            if 'end_time' in data:
                reservation.end_time = datetime.fromisoformat(data['end_time'])
            if 'party_size' in data:
                reservation.party_size = data['party_size']
            if 'status' in data:
                reservation.status = data['status']
            if 'price' in data:
                reservation.price = data['price']

            db.session.commit()

            return True, {
                'id': reservation.id,
                'venue_id': reservation.venue_id,
                'user_id': reservation.user_id,
                'start_time': reservation.start_time.isoformat(),
                'end_time': reservation.end_time.isoformat(),
                'party_size': reservation.party_size,
                'status': reservation.status,
                'price': reservation.price
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

            if reservation.user_id != user.id:
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