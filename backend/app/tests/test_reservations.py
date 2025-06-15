import pytest
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token
from ..models import User, Venue, Reservation, ReservationStatus, UserType, VenueType
from ..extensions import db

@pytest.fixture(scope='function')
def init_database(app):
    with app.app_context():
        db.create_all()
        yield db
        db.session.remove()
        db.drop_all()

@pytest.fixture
def customer_user(app, init_database):
    with app.app_context():
        user = User(
            username="test_customer", 
            email="customer@test.com",
            user_type=UserType.CUSTOMER
        )
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()
        return {"id": user.id, "username": user.username}

@pytest.fixture
def owner_user(app, init_database):
    with app.app_context():
        user = User(
            username="test_owner", 
            email="owner@test.com",
            user_type=UserType.OWNER
        )
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()
        return {"id": user.id, "username": user.username}

@pytest.fixture
def venue(app, owner_user, init_database):
    with app.app_context():
        venue = Venue(
            name="Test Venue",
            venue_type=VenueType.RESTAURANT,
            phone="1234567890",
            email="venue@test.com",
            address="Sofia, Bulgaria",
            owner_id=owner_user["id"],
            weekdays_hours="09:00-18:00",
            weekend_hours="10:00-16:00"
        )
        db.session.add(venue)
        db.session.commit()
        return {"id": venue.id, "name": venue.name}

@pytest.fixture
def reservation(app, customer_user, venue, init_database):
    with app.app_context():
        fixed_time = datetime.utcnow().replace(hour=12, minute=0, second=0, microsecond=0) + timedelta(days=1)
        res = Reservation(
            customer_id=customer_user["id"],
            venue_id=venue["id"],
            reservation_time=fixed_time,
            party_size=4,
            status=ReservationStatus.PENDING
        )
        db.session.add(res)
        db.session.commit()
        return {"id": res.id, "customer_id": res.customer_id, "venue_id": res.venue_id}

@pytest.fixture
def customer_token(app, customer_user):
    with app.app_context():
        return create_access_token(identity=str(customer_user["id"]))

@pytest.fixture
def owner_token(app, owner_user):
    with app.app_context():
        return create_access_token(identity=str(owner_user["id"]))

def test_get_reservations_customer(client, customer_token, reservation, init_database):
    response = client.get(
        "/api/reservations/",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 200
    data = response.json
    assert len(data) == 1
    assert data[0]["id"] == reservation["id"]
    assert data[0]["customer_id"] == reservation["customer_id"]

def test_get_reservations_owner(client, owner_token, reservation, venue, init_database):
    response = client.get(
        "/api/reservations/",
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]["venue_id"] == venue["id"]

def test_get_reservations_unauthorized(client, init_database):
    response = client.get("/api/reservations/")
    assert response.status_code == 401

def test_create_reservation_success(client, customer_token, venue, init_database):
    future_time = datetime.utcnow() + timedelta(days=1)
    data = {
        "venue_id": venue["id"],
        "reservation_time": future_time.strftime("%Y-%m-%d %H:%M"),
        "party_size": 4,
        "notes": "Window seat please"
    }
    response = client.post(
        "/api/reservations/",
        json=data,
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 201
    assert "id" in response.json

def test_create_reservation_past_date(client, customer_token, venue, init_database):
    past_time = datetime.utcnow() - timedelta(days=1)
    data = {
        "venue_id": venue["id"],
        "reservation_time": past_time.strftime("%Y-%m-%d %H:%M"),
        "party_size": 2
    }
    response = client.post(
        "/api/reservations/",
        json=data,
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 400
    assert "future" in response.json["message"]

def test_create_reservation_duplicate(client, customer_token, venue, reservation, init_database):
    with client.application.app_context():
        res = db.session.get(Reservation, reservation["id"])
        data = {
            "venue_id": venue["id"],
            "reservation_time": res.reservation_time.strftime("%Y-%m-%d %H:%M"),
            "party_size": 3,
            "notes": "Test duplicate"
        }
        response = client.post(
            "/api/reservations/",
            json=data,
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 400
        assert "already taken" in response.json["message"]

def test_create_reservation_owner_not_allowed(client, owner_token, venue, init_database):
    data = {
        "venue_id": venue["id"],
        "reservation_time": (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M"),
        "party_size": 4
    }
    response = client.post(
        "/api/reservations/",
        json=data,
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert response.status_code == 403
    assert "customers" in response.json["message"]

def test_update_status_success(client, owner_token, reservation, init_database):
    with client.application.app_context():
        res = db.session.get(Reservation, reservation["id"])
        data = {"status": "confirmed"}
        response = client.patch(
            f"/api/reservations/{res.id}/status",
            json=data,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
        updated_res = db.session.get(Reservation, res.id)
        assert updated_res.status == ReservationStatus.CONFIRMED

def test_update_status_invalid(client, owner_token, reservation, init_database):
    data = {"status": "invalid_status"}
    response = client.patch(
        f"/api/reservations/{reservation['id']}/status",
        json=data,
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert response.status_code == 400

def test_update_status_unauthorized(client, customer_token, reservation, init_database):
    data = {"status": "confirmed"}
    response = client.patch(
        f"/api/reservations/{reservation['id']}/status",
        json=data,
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 403

def test_get_venue_reservations_success(client, owner_token, venue, reservation, init_database):
    response = client.get(
        f"/api/reservations/venue/{venue['id']}",
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]["id"] == reservation["id"]

def test_get_venue_reservations_wrong_owner(client, customer_token, venue, init_database):
    response = client.get(
        f"/api/reservations/venue/{venue['id']}",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 403

def test_delete_reservation_success(client, customer_token, reservation, init_database):
    with client.application.app_context():
        res_id = reservation["id"]
        response = client.delete(
            f"/api/reservations/{res_id}",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 200
        assert db.session.get(Reservation, res_id) is None

def test_delete_reservation_unauthorized(client, owner_token, reservation, init_database):
    response = client.delete(
        f"/api/reservations/{reservation['id']}",
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert response.status_code == 403

def test_delete_nonexistent_reservation(client, customer_token, init_database):
    with client.application.app_context():
        response = client.delete(
            "/api/reservations/9999",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 404