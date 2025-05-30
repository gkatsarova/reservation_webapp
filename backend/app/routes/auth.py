from flask import request
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import create_access_token
from datetime import timedelta
from ..extensions import api, db
from ..models import User, UserType

ns = Namespace('auth', description='Authentication operations')

login_model = ns.model('Login', {
    'email': fields.String(
        required=True,
        pattern=r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    ),
    'password': fields.String(required=True, min_length=8)
})

register_model = ns.model('Register', {
    'username': fields.String(required=True, description='Username'),
    'email': fields.String(
        required=True,
        description='Email',
        pattern=r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    ),
    'password': fields.String(required=True, description='Password', min_length=8),
    'user_type': fields.String(
        required=True,
        enum=['customer', 'owner'],
        description='User type (customer or owner)'
    )
})

token_response = ns.model('TokenResponse', {
    'access_token': fields.String(description='JWT access token')
})

@ns.route('/login')
class Login(Resource):
    @ns.expect(login_model)
    @ns.response(200, 'Login successful', token_response)
    @ns.response(401, 'Invalid credentials')
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()

        if user and user.check_password(data['password']):
            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={'user_type': user.user_type.value},
                expires_delta=timedelta(hours=1)
            )
            return {'access_token': access_token, 
                    'user_type': user.user_type.value, 
                    'username': user.username
                   }, 200  

        return {'message': 'Invalid data'}, 401


@ns.route('/register')
class Register(Resource):
    @ns.expect(register_model)
    @ns.response(201, 'Registration successful', token_response)
    @ns.response(400, 'Username or email already taken')
    @ns.response(500, 'Internal server error')
    def post(self):
        data = request.get_json()
        try:
            if User.query.filter_by(username=data['username']).first():
                return {'message': 'Username is already taken'}, 400

            if User.query.filter_by(email=data['email']).first():
                return {'message': 'Email is already taken'}, 400

            user = User(
                username=data['username'],
                email=data['email'],
                user_type=UserType(data['user_type'])
            )
            user.set_password(data['password'])
            db.session.add(user)
            db.session.commit()

            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={'user_type': user.user_type.value},
                expires_delta=timedelta(hours=1)
            )
            return {
                'message': 'Successfully registered',
                'access_token': access_token
            }, 201

        except Exception as e:
            db.session.rollback()
            return {'message': f'Error with registration: {str(e)}'}, 500