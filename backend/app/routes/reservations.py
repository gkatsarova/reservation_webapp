from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import Reservation, Venue, User, ReservationStatus, UserType
from ..extensions import db

ns = Namespace('reservations', description='Reservation operations')

reservation_model = ns.model('Reservation', {
    'venue_id': fields.Integer(required=True, description='ID of the restaurant'),
    'reservation_time': fields.DateTime(required=True, description='Date (YYYY-MM-DD HH:MM)'),
    'party_size': fields.Integer(required=True, description='Number of guests'),
    'notes': fields.String(description='Options or special requests'),
})

status_model = ns.model('StatusUpdate', {
    'status': fields.String(required=True, enum=[s.value for s in ReservationStatus], description='New status of the reservation')
})

@ns.route('/')
class ReservationList(Resource):
    @jwt_required()
    @ns.marshal_list_with(reservation_model)
    def get(self):
        current_user = get_jwt_identity()
        user = User.query.get(current_user['id'])
        return user.reservations

    @jwt_required()
    @ns.expect(reservation_model)
    @ns.response(201, 'The reservation has been created')
    @ns.response(400, 'Invalid data')
    def post(self):
        current_user = get_jwt_identity()
        if current_user['user_type'] != UserType.CUSTOMER.value:
            return {'message': 'Only clients can make reservations'}, 403

        data = request.get_json()
        
        try:
            reservation_time = datetime.strptime(data['reservation_time'], '%Y-%m-%d %H:%M')
            if reservation_time < datetime.now():
                return {'message': 'The date must be in the future'}, 400
        except ValueError:
            return {'message': 'Invalid format of the data'}, 400

        venue = Venue.query.get(data['venue_id'])
        if not venue:
            return {'message': 'The venue does not exist'}, 404
        
        existing_reservation = Reservation.query.filter(
        Reservation.venue_id == data['venue_id'],
        Reservation.reservation_time == reservation_time
        ).first()
        if existing_reservation:
            return {'message': 'This hour is already taken'}, 400

        new_reservation = Reservation(
            customer_id=current_user['id'],
            venue_id=data['venue_id'],
            reservation_time=reservation_time,
            party_size=data['party_size'],
            notes=data.get('notes')
        )
        
        db.session.add(new_reservation)
        db.session.commit()
        
        return {'message': 'The resevation has been created', 'id': new_reservation.id}, 201

@ns.route('/<int:reservation_id>/status')
class ReservationStatusUpdate(Resource):
    @jwt_required()
    @ns.expect(status_model)
    @ns.response(200, 'Staus updated successfully')
    @ns.response(403, 'You do not have permission to change this status')
    def patch(self, reservation_id):
        current_user = get_jwt_identity()
        reservation = Reservation.query.get_or_404(reservation_id)
        venue = Venue.query.get(reservation.venue_id)

        if current_user['id'] != venue.owner_id or current_user['user_type'] != UserType.OWNER.value:
            return {'message': 'You do not have permission to update this status'}, 403

        new_status = ReservationStatus(request.json['status'])
        reservation.status = new_status
        db.session.commit()

        return {'message': 'Status has been changed'}, 200

@ns.route('/venue/<int:venue_id>')
class VenueReservations(Resource):
    @jwt_required()
    @ns.marshal_list_with(reservation_model)
    def get(self, venue_id):
        current_user = get_jwt_identity()
        venue = Venue.query.get_or_404(venue_id)

        if current_user['id'] != venue.owner_id:
            return {'message': 'You do not have permission'}, 403

        return venue.reservations
    
