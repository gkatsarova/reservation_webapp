from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, ReservationStatus
from ..facades.reservation_facade import ReservationFacade

ns = Namespace('reservations', description='Reservation operations')

reservation_model = ns.model('Reservation', {
    'id': fields.Integer,
    'venue_id': fields.Integer(required=True, description='ID of the restaurant'),
    'venue_name': fields.String,
    'reservation_time': fields.DateTime(required=True, description='Date (YYYY-MM-DD HH:MM)'),
    'party_size': fields.Integer(required=True, description='Number of guests'),
    'notes': fields.String(description='Options or special requests'),
    'status': fields.String,
    'customer_name': fields.String,
    'customer_id': fields.Integer
})

reservation_response = ns.model('ReservationResponse', {
    'message': fields.String,
    'id': fields.Integer
})

status_model = ns.model('StatusUpdate', {
    'status': fields.String(required=True, enum=[s.value for s in ReservationStatus], description='New status of the reservation')
})

@ns.route('/')
class ReservationList(Resource):
    def __init__(self, api=None, *args, **kwargs):
        super().__init__(api, *args, **kwargs)
        self.facade = ReservationFacade()

    @ns.doc(security='Bearer')
    @jwt_required()
    @ns.marshal_list_with(reservation_model)
    def get(self):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return [], 200

        reservations = self.facade.get_reservations_for_user(user)
        return reservations, 200

    @ns.doc(security='Bearer')
    @jwt_required()
    @ns.expect(reservation_model)
    @ns.response(201, 'The reservation has been created')
    @ns.response(400, 'Invalid data')
    @ns.response(403, 'Venue owners cannot make reservations')
    def post(self):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404

        data = request.get_json()
        if 'venue_id' not in data:
            return {'message': 'venue_id is required'}, 400

        success, result, status_code = self.facade.create_reservation(user, data['venue_id'], data)
        
        if not success:
            return {'message': result}, status_code
            
        return {'message': 'The reservation has been created', 'id': result['id']}, status_code

@ns.route('/<int:reservation_id>/status')
class ReservationStatusUpdate(Resource):
    def __init__(self, api=None, *args, **kwargs):
        super().__init__(api, *args, **kwargs)
        self.facade = ReservationFacade()

    @ns.doc(security='Bearer')
    @jwt_required()
    def patch(self, reservation_id):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404

        data = request.get_json()
        success, message = self.facade.update_reservation(
            reservation_id, user, {'status': data.get('status')}
        )
        
        if not success:
            return {'message': message}, 400 if 'Invalid' in message else 403
            
        return {'message': message}, 200

@ns.route('/venue/<int:venue_id>')
class VenueReservations(Resource):
    def __init__(self, api=None, *args, **kwargs):
        super().__init__(api, *args, **kwargs)
        self.facade = ReservationFacade()

    @ns.doc(security='Bearer')
    @jwt_required()
    @ns.marshal_list_with(reservation_model)
    def get(self, venue_id):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404

        success, result = self.facade.get_venue_reservations(venue_id, user)
        if not success:
            return {'message': result}, 403

        return result, 200

@ns.route('/<int:reservation_id>')
class ReservationDelete(Resource):
    def __init__(self, api=None, *args, **kwargs):
        super().__init__(api, *args, **kwargs)
        self.facade = ReservationFacade()

    @ns.doc(security='Bearer')
    @jwt_required()
    @ns.response(200, 'Reservation deleted')
    @ns.response(403, 'You do not have permission to delete this reservation')
    @ns.response(404, 'Reservation not found')
    def delete(self, reservation_id):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404

        success, message, status_code = self.facade.delete_reservation(reservation_id, user)
        if not success:
            return {'message': message}, status_code

        return {'message': message}, status_code