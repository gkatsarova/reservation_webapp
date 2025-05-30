from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Venue, User, UserType, VenueType
from ..extensions import db
from flask import request
from datetime import datetime

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
    'menu_image_url': fields.String(required=False, description='URL for menu image'),
    'venue_type': fields.String(attribute=lambda x: x.venue_type.value, required=True, description='Type of the venue (restaurant, bar, cafe, etc.)'),
})

def enum_to_val(enum_obj):
    return enum_obj.value if enum_obj else None

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
            return True
            
        datetime.strptime(end, '%H:%M')
        return True
    except:
        return False

@ns.route('/')
class VenueListCreate(Resource):
    @ns.marshal_list_with(venue_model)
    @ns.response(200, 'List of venues returned')
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404
        
        if user.user_type == UserType.OWNER:
            venues = Venue.query.filter_by(owner_id=user.id).all()
        else:
            venues = Venue.query.all()

        return venues

    @ns.doc(security='Bearer')
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
        required_fields = ['name', 'address', 'phone', 'email', 'weekdays_hours', 'weekend_hours', 'type']
        missing_fields = [f for f in required_fields if not data.get(f)]
        if missing_fields:
            return {'message': f'Missing required fields: {", ".join(missing_fields)}'}, 400

        if Venue.query.filter_by(name=data['name']).first():
            return {'message': 'Venue with this name already exists.'}, 400
        if Venue.query.filter_by(address=data['address']).first():
            return {'message': 'Venue with this address already exists.'}, 400
        if Venue.query.filter_by(phone=data['phone']).first():
            return {'message': 'Venue with this phone already exists.'}, 400
        if Venue.query.filter_by(email=data['email']).first():
            return {'message': 'Venue with this email already exists.'}, 400

        weekdays_hours = data.get('weekdays_hours')
        weekend_hours = data.get('weekend_hours')

        if not validate_hours(weekdays_hours) or not validate_hours(weekend_hours):
            return {'message': 'Invalid hours format. Use HH:MM-HH:MM'}, 400

        if data['type'] not in VenueType._value2member_map_:
            return {'message': 'Invalid venue type.'}, 400

        venue = Venue(
            owner_id=user.id,
            name=data['name'],
            address=data['address'],
            phone=data['phone'],
            email=data.get('email'),
            weekdays_hours=weekdays_hours,
            weekend_hours=weekend_hours,
            menu_image_url=data.get('menu_image_url'),
            venue_type=VenueType(data['type']) 
        )

        try:
            db.session.add(venue)
            db.session.commit()
            return {'message': 'Venue created successfully', 'id': venue.id}, 201
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error when creating venue: {str(e)}'}, 500

@ns.route('/<int:venue_id>')
class VenueDetail(Resource):
    @ns.marshal_with(venue_model)
    @ns.response(200, 'Venue details')
    @ns.response(404, 'Venue not found')
    @jwt_required()
    def get(self, venue_id):
        venue = Venue.query.get_or_404(venue_id)
        return venue
    
    @ns.response(200, 'Venue deleted')
    @ns.response(403, 'No permission')
    @ns.response(404, 'Venue not found')
    @jwt_required()
    def delete(self, venue_id):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404

        venue = Venue.query.get_or_404(venue_id)
        if venue.owner_id != user.id:
            return {'message': 'Do not have permission'}, 403

        try:
            db.session.delete(venue)
            db.session.commit()
            return {'message': 'Venue is deleted'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error with deleting: {str(e)}'}, 500