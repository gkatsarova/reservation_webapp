from ..models import Venue, User, UserType, VenueType
from ..extensions import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
import re

class VenueFacade:
    def __init__(self):
        self.default_image_url = "/static/images/default-venue.jpg"
        self.default_menu_url = "/static/images/default-menu.jpg"

    def _validate_url(self, url):
        if not url:
            return False
        url_pattern = re.compile(
            r'^https?://' 
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|' 
            r'localhost|' 
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  
            r'(?::\d+)?'  
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        return bool(url_pattern.match(url))

    def _get_safe_image_url(self, url, is_menu=False):
        if not self._validate_url(url):
            return self.default_menu_url if is_menu else self.default_image_url
        return url

    def get_venues_for_user(self, user: User):
        try:
            if user.user_type == UserType.OWNER:
                venues = Venue.query.filter_by(owner_id=user.id).all()
            else:
                venues = Venue.query.all()
            
            return [{
                'id': venue.id,
                'owner_id': venue.owner_id,
                'name': venue.name,
                'address': venue.address,
                'phone': venue.phone,
                'email': venue.email,
                'weekdays_hours': venue.weekdays_hours,
                'weekend_hours': venue.weekend_hours,
                'image_url': self._get_safe_image_url(venue.image_url),
                'menu_image_url': self._get_safe_image_url(venue.menu_image_url, True),
                'type': venue.venue_type.value,
                'latitude': venue.latitude,
                'longitude': venue.longitude
            } for venue in venues]
        except Exception as e:
            print(f"Error getting venues: {str(e)}")
            return []

    def get_venue_details(self, venue_id: int):
        try:
            venue = Venue.query.get(venue_id)
            if not venue:
                return False, "Venue not found"
            
            return True, {
                'id': venue.id,
                'owner_id': venue.owner_id,
                'name': venue.name,
                'address': venue.address,
                'phone': venue.phone,
                'email': venue.email,
                'weekdays_hours': venue.weekdays_hours,
                'weekend_hours': venue.weekend_hours,
                'image_url': self._get_safe_image_url(venue.image_url),
                'menu_image_url': self._get_safe_image_url(venue.menu_image_url, True),
                'type': venue.venue_type.value,
                'latitude': venue.latitude,
                'longitude': venue.longitude
            }
        except Exception as e:
            print(f"Error getting venue details: {str(e)}")
            return False, str(e)

    def create_venue(self, user: User, venue_data: dict):
        try:
            if not all(k in venue_data for k in ['name', 'address', 'phone', 'weekdays_hours', 'weekend_hours', 'type']):
                return False, "Missing required fields"

            try:
                venue_type = VenueType(venue_data['type'])
            except ValueError:
                return False, "Invalid venue type"

            venue = Venue(
                owner_id=user.id,
                name=venue_data['name'],
                address=venue_data['address'],
                phone=venue_data['phone'],
                email=venue_data.get('email'),
                weekdays_hours=venue_data['weekdays_hours'],
                weekend_hours=venue_data['weekend_hours'],
                image_url=self._get_safe_image_url(venue_data.get('image_url')),
                menu_image_url=self._get_safe_image_url(venue_data.get('menu_image_url'), True),
                venue_type=venue_type,
                latitude=venue_data.get('latitude'),
                longitude=venue_data.get('longitude')
            )

            db.session.add(venue)
            db.session.commit()

            return True, {'id': venue.id}
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Database error creating venue: {str(e)}")
            return False, "Database error occurred"
        except Exception as e:
            print(f"Error creating venue: {str(e)}")
            return False, str(e)

    def delete_venue(self, venue_id: int, user: User):
        try:
            venue = Venue.query.get(venue_id)
            if not venue:
                return False, "Venue not found"
            
            if venue.owner_id != user.id and user.user_type != UserType.ADMIN:
                return False, "No permission to delete this venue"

            db.session.delete(venue)
            db.session.commit()
            return True, "Venue deleted successfully"
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Database error deleting venue: {str(e)}")
            return False, "Database error occurred"
        except Exception as e:
            print(f"Error deleting venue: {str(e)}")
            return False, str(e) 