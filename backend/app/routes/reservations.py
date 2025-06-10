from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import Reservation, Venue, User, ReservationStatus, UserType
from ..extensions import db

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
    @ns.doc(security='Bearer')
    @jwt_required()
    @ns.marshal_list_with(reservation_model)
    def get(self):
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        if not user:
            return [], 200

        if user.user_type == UserType.CUSTOMER:
            reservations = Reservation.query.filter_by(customer_id=user.id).all()
        elif user.user_type == UserType.OWNER:
            venue_ids = [v.id for v in Venue.query.filter_by(owner_id=user.id).all()]
            reservations = Reservation.query.filter(Reservation.venue_id.in_(venue_ids)).all()
        else:
            reservations = []

        result = []
        for r in reservations:
            res_dict = r.as_dict() if hasattr(r, 'as_dict') else r.__dict__
            res_dict['id'] = r.id
            res_dict['venue_name'] = r.venue.name if r.venue else ''
            res_dict['customer_name'] = r.customer.username if hasattr(r, 'customer') and r.customer else ''
            res_dict['status'] = r.status.value if hasattr(r.status, 'value') else r.status
            res_dict['notes'] = r.notes
            res_dict['customer_id'] = r.customer_id
            result.append(res_dict)
        return result, 200

    @ns.doc(security='Bearer')
    @jwt_required()
    @ns.expect(reservation_model)
    @ns.response(201, 'The reservation has been created')
    @ns.response(400, 'Invalid data')
    def post(self):
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        if not user or user.user_type != UserType.CUSTOMER:
            return {'message': 'Only customers can make reservations'}, 403

        data = request.get_json()
        
        try:
            reservation_time = datetime.strptime(data['reservation_time'], '%Y-%m-%d %H:%M')
            if reservation_time < datetime.now():
                return {'message': 'The date must be in the future'}, 400
        except ValueError:
            return {'message': 'Invalid format of the data'}, 400

        venue = db.session.get(Venue, data['venue_id'])
        if not venue:
            return {'message': 'The venue does not exist'}, 404
        
        existing_reservation = Reservation.query.filter(
        Reservation.venue_id == data['venue_id'],
        Reservation.reservation_time == reservation_time
        ).first()
        if existing_reservation:
            return {'message': 'This hour is already taken'}, 400

        new_reservation = Reservation(
            customer_id=current_user_id,
            venue_id=data['venue_id'],
            reservation_time=reservation_time,
            party_size=data['party_size'],
            notes=data.get('notes')
        )
        
        db.session.add(new_reservation)
        db.session.commit()
        
        return {'message': 'The reservation has been created', 'id': new_reservation.id}, 201

@ns.route('/<int:reservation_id>/status')
class ReservationStatusUpdate(Resource):
    @ns.doc(security='Bearer')
    @jwt_required()
    def patch(self, reservation_id):
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        reservation = db.session.get(Reservation, reservation_id)
        if not reservation:
            return {'message': 'Reservation not found'}, 404
        venue = db.session.get(Venue, reservation.venue_id)
        if user.id != venue.owner_id or user.user_type != UserType.OWNER:
            return {'message': 'You do not have permission'}, 403

        data = request.get_json()
        new_status = data.get('status')
        if new_status not in [s.value for s in ReservationStatus]:
            return {'message': 'Invalid status'}, 400

        reservation.status = ReservationStatus(new_status)
        db.session.commit()
        return {'message': 'Status updated'}, 200

@ns.route('/venue/<int:venue_id>')
class VenueReservations(Resource):
    @ns.doc(security='Bearer')
    @jwt_required()
    @ns.marshal_list_with(reservation_model)
    def get(self, venue_id):
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        venue = db.session.get(Venue, venue_id)
        if not venue:
            return {'message': 'Venue not found'}, 404

        if not user or user.id != venue.owner_id:
            return {'message': 'You do not have permission'}, 403

        reservations = Reservation.query.filter_by(venue_id=venue_id).all()
        result = []
        for r in reservations:
            res_dict = r.as_dict() if hasattr(r, 'as_dict') else r.__dict__
            res_dict['id'] = r.id
            res_dict['venue_name'] = r.venue.name if r.venue else ''
            res_dict['customer_name'] = r.customer.username if hasattr(r, 'customer') and r.customer else ''
            res_dict['status'] = r.status.value if hasattr(r.status, 'value') else r.status
            res_dict['notes'] = r.notes
            res_dict['customer_id'] = r.customer_id
            result.append(res_dict)
        return result, 200

@ns.route('/<int:reservation_id>')
class ReservationDelete(Resource):
    @ns.doc(security='Bearer')
    @jwt_required()
    @ns.response(200, 'Reservation deleted')
    @ns.response(403, 'You do not have permission to delete this reservation')
    @ns.response(404, 'Reservation not found')
    def delete(self, reservation_id):
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)

        reservation = db.session.get(Reservation, reservation_id)
        if not reservation:
            return {'message': 'Reservation not found'}, 404

        if user.user_type != UserType.CUSTOMER or reservation.customer_id != user.id:
            return {'message': 'You do not have permission to delete this reservation'}, 403

        db.session.delete(reservation)
        db.session.commit()

        return {'message': 'Reservation deleted'}, 200