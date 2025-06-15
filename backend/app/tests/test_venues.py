import pytest
from flask_jwt_extended import create_access_token
import uuid
from ..extensions import db
from ..models import User, Venue, VenueComment, VenueType

@pytest.fixture(scope='function')
def init_database(app):
    with app.app_context():
        db.create_all()
        yield db
        db.session.remove()
        db.drop_all()

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

@pytest.fixture
def owner_token(app, register_user, init_database):
    response = register_user('owneruser', 'owner@example.com', 'Password123', 'owner')
    user_id = response.get_json()['user_id']
    with app.app_context():
        token = create_access_token(identity=str(user_id))
    return token

@pytest.fixture
def customer_token(app, register_user, init_database):
    response = register_user('customeruser', 'customer@example.com', 'Password123')
    user_id = response.get_json()['user_id']
    with app.app_context():
        token = create_access_token(identity=str(user_id))
    return token

@pytest.fixture
def create_venue(client, owner_token, init_database):
    def _create_venue():
        data = {
            "name": f"Test Venue {uuid.uuid4()}",
            "address": "Sofia, Bulgaria",
            "phone": f"123456{uuid.uuid4().hex[:4]}",
            "email": f"venue_{uuid.uuid4()}@example.com",
            "weekdays_hours": "09:00-18:00",
            "weekend_hours": "10:00-16:00",
            "type": "cafe"
        }
        response = client.post('/api/venues/', 
                          json=data,
                          headers={"Authorization": f"Bearer {owner_token}"})
        return response.get_json()['id']
    return _create_venue

def test_create_venue_success(client, owner_token, init_database):
    data = {
        "name": "My Venue",
        "address": "Sofia, Bulgaria",
        "phone": "1234567890",
        "email": "venue@example.com",
        "weekdays_hours": "09:00-18:00",
        "weekend_hours": "10:00-16:00",
        "type": "restaurant"
    }
    response = client.post('/api/venues/', 
                          json=data, 
                          headers={"Authorization": f"Bearer {owner_token}"})
    assert response.status_code == 201
    data = response.get_json()
    assert 'id' in data
    assert data['message'] == 'Venue created successfully'

def test_create_venue_duplicate_name(client, owner_token, init_database):
    data = {
        "name": "Duplicate Venue",
        "address": "Sofia, Bulgaria",
        "phone": "1234567890",
        "email": "venue1@example.com",
        "weekdays_hours": "09:00-18:00",
        "weekend_hours": "10:00-16:00",
        "type": "restaurant"
    }
    client.post('/api/venues/', 
                json=data, 
                headers={"Authorization": f"Bearer {owner_token}"})
    
    data["email"] = "venue2@example.com"
    data["phone"] = "9876543210"
    response = client.post('/api/venues/', 
                          json=data, 
                          headers={"Authorization": f"Bearer {owner_token}"})
    assert response.status_code == 400
    assert 'Venue with this name already exists' in response.get_json()['message']

def test_create_venue_duplicate_email(client, owner_token, init_database):
    data = {
        "name": "Venue 1",
        "address": "Sofia, Bulgaria",
        "phone": "1234567890",
        "email": "duplicate@example.com",
        "weekdays_hours": "09:00-18:00",
        "weekend_hours": "10:00-16:00",
        "type": "restaurant"
    }
    client.post('/api/venues/', 
                json=data, 
                headers={"Authorization": f"Bearer {owner_token}"})
    
    data["name"] = "Venue 2"
    data["phone"] = "9876543210"
    response = client.post('/api/venues/', 
                          json=data, 
                          headers={"Authorization": f"Bearer {owner_token}"})
    assert response.status_code == 400
    assert 'Venue with this email already exists' in response.get_json()['message']

def test_create_venue_unauthorized(client, customer_token, init_database):
    data = {
        "name": "Not Allowed Venue",
        "address": "Sofia, Bulgaria",
        "phone": "1234567890",
        "email": "venue@example.com",
        "weekdays_hours": "09:00-18:00",
        "weekend_hours": "10:00-16:00",
        "type": "restaurant"
    }
    response = client.post('/api/venues/', 
                          json=data, 
                          headers={"Authorization": f"Bearer {customer_token}"})
    assert response.status_code == 403
    assert 'Only owner can create venues' in response.get_json()['message']

def test_get_venues_as_owner(client, owner_token, init_database):
    data = {
        "name": "Owner's Venue",
        "address": "Sofia, Bulgaria",
        "phone": "1234567890",
        "email": "venue@example.com",
        "weekdays_hours": "09:00-18:00",
        "weekend_hours": "10:00-16:00",
        "type": "restaurant"
    }
    create_response = client.post('/api/venues/', 
                                json=data, 
                                headers={"Authorization": f"Bearer {owner_token}"})
    venue_id = create_response.get_json()['id']
    
    response = client.get('/api/venues/', 
                         headers={"Authorization": f"Bearer {owner_token}"})
    assert response.status_code == 200
    venues = response.get_json()
    assert isinstance(venues, list)
    assert any(v['id'] == venue_id for v in venues)

def test_get_venues_as_customer(client, owner_token, customer_token, init_database):
    data = {
        "name": "Customer's Venue",
        "address": "Sofia, Bulgaria",
        "phone": "1234567890",
        "email": "venue@example.com",
        "weekdays_hours": "09:00-18:00",
        "weekend_hours": "10:00-16:00",
        "type": "restaurant"
    }
    create_response = client.post('/api/venues/', 
                                json=data, 
                                headers={"Authorization": f"Bearer {owner_token}"})
    venue_id = create_response.get_json()['id']
    
    response = client.get('/api/venues/', 
                         headers={"Authorization": f"Bearer {customer_token}"})
    assert response.status_code == 200
    venues = response.get_json()
    assert isinstance(venues, list)
    assert any(v['id'] == venue_id for v in venues)

def test_delete_venue_success(client, owner_token, init_database):
    data = {
        "name": "To Delete Venue",
        "address": "Sofia, Bulgaria",
        "phone": "1234567890",
        "email": "venue@example.com",
        "weekdays_hours": "09:00-18:00",
        "weekend_hours": "10:00-16:00",
        "type": "restaurant"
    }
    create_response = client.post('/api/venues/', 
                                json=data, 
                                headers={"Authorization": f"Bearer {owner_token}"})
    venue_id = create_response.get_json()['id']
    
    response = client.delete(f'/api/venues/{venue_id}', 
                           headers={"Authorization": f"Bearer {owner_token}"})
    assert response.status_code == 200
    assert response.get_json()['message'] == 'Venue is deleted'

def test_delete_venue_unauthorized(client, owner_token, customer_token, init_database):
    data = {
        "name": "Not To Delete Venue",
        "address": "Sofia, Bulgaria",
        "phone": "1234567890",
        "email": "venue@example.com",
        "weekdays_hours": "09:00-18:00",
        "weekend_hours": "10:00-16:00",
        "type": "restaurant"
    }
    create_response = client.post('/api/venues/', 
                                json=data, 
                                headers={"Authorization": f"Bearer {owner_token}"})
    venue_id = create_response.get_json()['id']
    
    response = client.delete(f'/api/venues/{venue_id}', 
                           headers={"Authorization": f"Bearer {customer_token}"})
    assert response.status_code == 403
    assert 'Do not have permission' in response.get_json()['message']

def test_add_comment_as_customer(client, customer_token, create_venue, init_database):
    venue_id = create_venue()
    comment_data = {"text": "Great place!", "rating": 5}
    response = client.post(f'/api/venues/{venue_id}/comments', 
                         json=comment_data,
                         headers={"Authorization": f"Bearer {customer_token}"})
    assert response.status_code == 201
    json_data = response.get_json()
    assert 'message' in json_data
    assert 'Comment added' in json_data['message']

def test_get_comments(client, create_venue, customer_token, init_database):
    venue_id = create_venue()
    
    comment_data = {"text": "Lovely cafe!", "rating": 5}
    client.post(f'/api/venues/{venue_id}/comments', 
               json=comment_data,
               headers={"Authorization": f"Bearer {customer_token}"})
    
    response = client.get(f'/api/venues/{venue_id}/comments')
    assert response.status_code == 200
    comments = response.get_json()
    assert isinstance(comments, list)
    assert len(comments) > 0
    
    comment = comments[0]
    assert 'id' in comment
    assert 'venue_id' in comment
    assert 'user_id' in comment
    assert 'text' in comment
    assert 'rating' in comment
    assert 'created_at' in comment
    assert 'username' in comment
    
    assert comment['text'] == "Lovely cafe!"
    assert comment['rating'] == 5
    assert comment['venue_id'] == venue_id