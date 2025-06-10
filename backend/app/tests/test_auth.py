import pytest
from flask_jwt_extended import create_access_token
from ..extensions import db
from ..models import User, UserType

@pytest.fixture(scope='function')
def init_database(app):
    with app.app_context():
        db.create_all()
        yield db
        db.session.remove()
        db.drop_all()

@pytest.fixture
def register_user(client, init_database):
    def _register(username, email, password, user_type='customer'):
        return client.post('/api/auth/register', json={
            'username': username,
            'email': email,
            'password': password,
            'user_type': user_type
        })
    return _register

def test_register_success(client, init_database, register_user):
    response = register_user('testuser', 'test@example.com', 'Password123')
    assert response.status_code == 201
    data = response.get_json()
    assert 'access_token' in data
    assert 'user_id' in data
    assert 'username' in data
    assert 'user_type' in data
    assert data['username'] == 'testuser'
    assert data['user_type'] == 'customer'

def test_register_duplicate_username(client, init_database, register_user):
    register_user('testuser', 'test1@example.com', 'Password123')
    response = register_user('testuser', 'test2@example.com', 'Password123')
    assert response.status_code == 400
    assert 'Username is already taken' in response.get_json()['message']

def test_register_duplicate_email(client, init_database, register_user):
    register_user('testuser1', 'test@example.com', 'Password123')
    response = register_user('testuser2', 'test@example.com', 'Password123')
    assert response.status_code == 400
    assert 'Email is already taken' in response.get_json()['message']

def test_login_success(client, init_database, register_user):
    register_user('testuser', 'test@example.com', 'Password123')
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'Password123'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'access_token' in data
    assert 'user_type' in data
    assert 'username' in data
    assert 'user_id' in data
    assert data['username'] == 'testuser'
    assert data['user_type'] == 'customer'

def test_login_invalid_credentials(client, init_database, register_user):
    register_user('testuser', 'test@example.com', 'Password123')
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'WrongPassword'
    })
    assert response.status_code == 401
    assert 'Invalid data' in response.get_json()['message']

def test_delete_user_success(client, init_database, register_user):
    register_response = register_user('testuser', 'test@example.com', 'Password123')
    user_id = register_response.get_json()['user_id']
    login_response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'Password123'
    })
    token = login_response.get_json()['access_token']
    
    response = client.delete(f'/api/auth/users/{user_id}', 
                           headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.get_json()['message'] == 'User deleted'

def test_delete_user_no_permission(client, init_database, register_user):
    user1_response = register_user('user1', 'u1@example.com', 'Password123')
    user1_id = user1_response.get_json()['user_id']
    user2_response = register_user('user2', 'u2@example.com', 'Password123')
    user2_id = user2_response.get_json()['user_id']
    
    login_response = client.post('/api/auth/login', json={
        'email': 'u2@example.com',
        'password': 'Password123'
    })
    token = login_response.get_json()['access_token']
    
    response = client.delete(f'/api/auth/users/{user1_id}', 
                           headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    assert 'No permission' in response.get_json()['message']