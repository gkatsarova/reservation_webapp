from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import Venue, User, VenueComment, VenueType, UserType
from ..extensions import db
from sqlalchemy import func
import requests
from ..facades.venue_facade import VenueFacade

ns = Namespace('venues', description='Venue operations')

venue_model = ns.model('Venue', {
    'id': fields.Integer,
    'owner_id': fields.Integer,
    'name': fields.String(required=True, description='Name of the venue'),
    'address': fields.String(required=True, description='Address'),
    'phone': fields.String(required=True, description='Phone number'),
    'email': fields.String(description='Email of the venue'),
    'weekdays_hours': fields.String(required=True, description='Working hours for weekdays, format HH:MM-HH:MM'),
    'weekend_hours': fields.String(required=True, description='Working hours for weekend, format HH:MM-HH:MM'),
    'image_url': fields.String(required=False, description='URL for restaurant image'), 
    'menu_image_url': fields.String(required=False, description='URL for menu image'),
    'type': fields.String(required=True, description='Type of the venue (restaurant, bar, cafe, etc.)'),
    'latitude': fields.Float,
    'longitude': fields.Float
})

venue_response = ns.model('VenueResponse', {
    'message': fields.String,
    'id': fields.Integer
})

comment_model = ns.model('VenueComment', {
    'id': fields.Integer,
    'venue_id': fields.Integer,
    'user_id': fields.Integer,
    'text': fields.String,
    'rating': fields.Float,
    'created_at': fields.DateTime,
    'username': fields.String(attribute=lambda c: c.user.username if c.user else "")
})

def enum_to_val(enum_obj):
    return enum_obj.value if enum_obj else None

def validate_hours(hours_str):
    try:
        start, end = hours_str.split('-')
        start = start.strip()
        end = end.strip()
        datetime.strptime(start, '%H:%M')
        if end == "24:00":
            return True
            
        datetime.strptime(end, '%H:%M')
        return True
    except:
        return False

def get_coordinates(address):
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": address, "format": "json", "limit": 1}
    headers = {"User-Agent": "reservation-app"}
    resp = requests.get(url, params=params, headers=headers)
    data = resp.json()
    if data and len(data) > 0:
        return float(data[0]['lat']), float(data[0]['lon'])
    return None, None

class VenueListCreate(Resource):
    def __init__(self, api=None, *args, **kwargs):
        super().__init__(api, *args, **kwargs)
        self.facade = VenueFacade()

    @ns.marshal_list_with(venue_model)
    @ns.response(200, 'List of venues returned')
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404

        venues = self.facade.get_venues_for_user(user)
        return venues

    @jwt_required()
    @ns.expect(venue_model)
    @ns.response(201, 'Venue created successfully', venue_response)
    @ns.response(400, 'Missing or invalid fields')
    @ns.response(403, 'Not authorized')
    def post(self):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404

        if user.user_type != UserType.OWNER:
            return {'message': 'Only owner can create venues'}, 403

        data = request.get_json()
        success, result = self.facade.create_venue(user, data)
        
        if not success:
            return {'message': result}, 400
            
        return {'message': 'Venue created successfully', 'id': result['id']}, 201

class VenueDetail(Resource):
    def __init__(self, api=None, *args, **kwargs):
        super().__init__(api, *args, **kwargs)
        self.facade = VenueFacade()

    @ns.marshal_with(venue_model)
    @ns.response(200, 'Venue details')
    @ns.response(404, 'Venue not found')
    @jwt_required()
    def get(self, venue_id):
        success, result = self.facade.get_venue_details(venue_id)
        if not success:
            return {'message': result}, 404
        return result
    
    @ns.response(200, 'Venue deleted')
    @ns.response(403, 'No permission')
    @ns.response(404, 'Venue not found')
    @jwt_required()
    def delete(self, venue_id):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404

        success, message, status_code = self.facade.delete_venue(venue_id, user)
        if not success:
            return {'message': message}, status_code

        return {'message': message}, status_code

@ns.route('/<int:venue_id>/comments')
class VenueComments(Resource):
    @ns.marshal_list_with(comment_model)
    def get(self, venue_id):
        comments = VenueComment.query.filter_by(venue_id=venue_id).order_by(VenueComment.created_at.desc()).all()
        return comments
    
    @jwt_required()
    @ns.expect(comment_model)
    def post(self, venue_id):
        data = request.get_json()
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)
        text = data.get('text', '').strip()
        rating = data.get('rating')

        if not text:
            return {'message': 'Text is required.'}, 400

        if user.user_type == UserType.CUSTOMER:
            if rating is None or not (1 <= int(rating) <= 5):
                return {'message': 'Rating (1-5) is required for customers.'}, 400
        else:
            rating = None

        comment = VenueComment(
            venue_id=venue_id,
            user_id=user_id,
            text=text,
            rating=int(rating) if rating is not None else None
        )
        db.session.add(comment)
        db.session.commit()
        return {'message': 'Comment added.'}, 201

@ns.route('/<int:venue_id>/comments/<int:comment_id>')
class VenueCommentDelete(Resource):
    @jwt_required()
    @ns.response(200, 'Comment deleted')
    @ns.response(403, 'No permission')
    @ns.response(404, 'Comment not found')
    def delete(self, venue_id, comment_id):
        user_id = get_jwt_identity()
        comment = VenueComment.query.filter_by(id=comment_id, venue_id=venue_id).first()
        if not comment:
            return {'message': 'Comment not found'}, 404

        venue = db.session.get(Venue, venue_id)
        if not venue:
            return {'message': 'Venue not found'}, 404

        if comment.user_id != int(user_id) and venue.owner_id != int(user_id):
            return {'message': 'No permission to delete this comment'}, 403

        db.session.delete(comment)
        db.session.commit()
        return {'message': 'Comment deleted'}, 200

ns.add_resource(VenueListCreate, '/')
ns.add_resource(VenueDetail, '/<int:venue_id>')