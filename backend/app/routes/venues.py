from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Venue, User, UserType
from ..extensions import db
from flask import request
from datetime import datetime

ns = Namespace('venues', description='Venue operations')

venue_model = ns.model('Venue', {
    'name': fields.String(required=True, description='Name of the venue'),
    'address': fields.String(required=True, description='Address'),
    'phone': fields.String(required=True, description='Phone number'),
    'email': fields.String(description='Email of the venue'),
    'weekdays_hours': fields.String(required=True, description='Working hours for weekdays, format HH:MM-HH:MM'),
    'weekend_hours': fields.String(required=True, description='Working hours for weekend, format HH:MM-HH:MM'),
    'menu_image_url': fields.String(description='URL for menu image'),
})

venue_response = ns.model('VenueResponse', {
    'message': fields.String,
    'id': fields.Integer
})

def validate_hours(hours_str):
    try:
        start, end = hours_str.split('-')
        start = start.strip()
        end = end.strip()
        datetime.strptime(start, '%H:%M')
        if end == "24:00":
            end = "23:59"
        datetime.strptime(end, '%H:%M')
        return True
    except Exception as e:
        print(f"Validation error: {e}")
        return False

@ns.route('/')
class VenueList(Resource):
    @ns.doc(security='Bearer')
    @jwt_required()
    @ns.marshal_list_with(venue_model)
    @ns.response(200, 'List of venues returned')
    def get(self):
        current_user_id = get_jwt_identity()
        print(f"Current user id (get): {current_user_id}") 
        
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404
        
        if user.user_type != UserType.OWNER:
            return []
        
        venues = Venue.query.filter_by(owner_id=user.id).all()
        return venues

    @ns.doc(security='Bearer')
    @jwt_required()
    @ns.expect(venue_model)
    @ns.response(201, 'Venue created successfully', venue_response)
    @ns.response(400, 'Missing or invalid fields')
    @ns.response(403, 'Not authorized')
    def post(self):
        current_user_id = get_jwt_identity()
        print(f"Current user id (post): {current_user_id}")
        
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404
        
        if user.user_type != UserType.OWNER:
            return {'message': 'Only owner can create venues'}, 403
        
        data = request.get_json()
        print(f"Received data: {data}") 

        required_fields = ['name', 'address', 'phone', 'email', 'weekdays_hours', 'weekend_hours']
        missing_fields = [f for f in required_fields if not data.get(f)]
        if missing_fields:
            return {'message': f'Missing required fields: {", ".join(missing_fields)}'}, 400
        
        weekdays_hours = data.get('weekdays_hours')
        weekend_hours = data.get('weekend_hours')

        if not validate_hours(weekdays_hours) or not validate_hours(weekend_hours):
            return {'message': 'Invalid hours format. Use HH:MM-HH:MM'}, 400
        
        venue = Venue(
            owner_id=user.id,
            name=data['name'],
            address=data['address'],
            phone=data['phone'],
            email=data.get('email'),
            weekdays_hours=weekdays_hours,
            weekend_hours=weekend_hours,
            menu_image_url=data.get('menu_image_url')
        )
        
        try:
            db.session.add(venue)
            db.session.commit()
            print(f"Venue created with ID: {venue.id}") 
            return {'message': 'Venue created successfully', 'id': venue.id}, 201
        except Exception as e:
            db.session.rollback()
            print(f"Database error while creating venue: {e}") 
            return {'message': f'Error when creating venue: {str(e)}'}, 500

@ns.route('/<int:venue_id>')
class VenueDetail(Resource):
    @ns.doc(security='Bearer')
    @jwt_required()
    @ns.response(200, 'Venue deleted')
    @ns.response(403, 'No permission')
    @ns.response(404, 'Venue not found')
    def delete(self, venue_id):
        current_user_id = get_jwt_identity()
        print(f"Current user id (delete): {current_user_id}") 
        
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404
        
        venue = Venue.query.get_or_404(venue_id)
        
        if venue.owner_id != user.id:
            return {'message': 'Do not have permission'}, 403
        
        try:
            db.session.delete(venue)
            db.session.commit()
            print(f"Venue deleted with ID: {venue_id}") 
            return {'message': 'Venue is deleted'}, 200
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting venue: {e}") 
            return {'message': f'Error with deleting: {str(e)}'}, 500
