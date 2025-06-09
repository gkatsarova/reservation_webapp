import pytest
from flask_jwt_extended import create_access_token

@pytest.fixture
def register_user(client):
    def _register(username, email, password, user_type='customer'):
        return client.post('/api/auth/register', json={
            'username': username,
            'email': email,
            'password': password,
            'user_type': user_type
        })
    return _register

def test_successful_registration(register_user):
    response = register_user('testuser', 'test@example.com', 'Password123', 'owner')
    assert response.status_code == 201
    data = response.get_json()
    assert 'access_token' in data
    assert data['username'] == 'testuser'
    assert data['user_type'] == 'owner'

def test_duplicate_email_registration(register_user):
    register_user('user1', 'duplicate@example.com', 'Password123')
    response = register_user('user2', 'duplicate@example.com', 'Password123')
    assert response.status_code == 400
    assert 'Email is already taken' in response.get_json()['message']

def test_duplicate_username_registration(register_user):
    register_user('duplicateuser', 'email1@example.com', 'Password123')
    response = register_user('duplicateuser', 'email2@example.com', 'Password123')
    assert response.status_code == 400
    assert 'Username is already taken' in response.get_json()['message']

def test_login_success(client, register_user):
    register_user('loginuser', 'login@example.com', 'Password123')
    response = client.post('/api/auth/login', json={
        'email': 'login@example.com',
        'password': 'Password123'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'access_token' in data
    assert data['username'] == 'loginuser'

def test_login_invalid_password(client, register_user):
    register_user('wrongpass', 'wrong@example.com', 'Password123')
    response = client.post('/api/auth/login', json={
        'email': 'wrong@example.com',
        'password': 'WrongPassword'
    })
    assert response.status_code == 401
    assert response.get_json()['message'] == 'Invalid data'

def test_login_nonexistent_user(client):
    response = client.post('/api/auth/login', json={
        'email': 'nonexistent@example.com',
        'password': 'Whatever123'
    })
    assert response.status_code == 401
    assert response.get_json()['message'] == 'Invalid data'

def test_delete_user_success(client, app, register_user):
    reg_response = register_user('deletable', 'del@example.com', 'Password123')
    user_id = reg_response.get_json()['user_id']

    with app.app_context():
        token = create_access_token(identity=str(user_id))

    response = client.delete(f'/api/auth/users/{user_id}', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    assert response.get_json()['message'] == 'User deleted'

def test_delete_user_no_permission(client, app, register_user):
    user1_response = register_user('user1', 'u1@example.com', 'Password123')
    user1_id = user1_response.get_json()['user_id']
    
    user2_response = register_user('user2', 'u2@example.com', 'Password123')
    user2_id = user2_response.get_json()['user_id']

    with app.app_context():
        token = create_access_token(identity=str(user1_id))

    response = client.delete(f'/api/auth/users/{user2_id}', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 403
    assert response.get_json()['message'] == 'No permission to delete this user'