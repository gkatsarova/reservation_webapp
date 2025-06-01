from datetime import datetime
from enum import Enum
from werkzeug.security import generate_password_hash, check_password_hash
from .extensions import db

class UserType(Enum):
    CUSTOMER = "customer"
    OWNER = "owner"

class VenueType(Enum):
    CAFE = "cafe"
    BAR = "bar"
    RESTAURANT = "restaurant"

class ReservationStatus(Enum):
    PENDING = "pending"
    CONFIRMED ="confirmed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    user_type = db.Column(db.Enum(UserType), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    venue = db.relationship('Venue', back_populates='owner', uselist=False, cascade='all, delete-orphan')
    reservations = db.relationship('Reservation', back_populates='customer')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Venue(db.Model):
    __tablename__ = 'venues'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    venue_type = db.Column(db.Enum(VenueType), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    menu_image_url = db.Column(db.String(500)) 
    weekdays_hours = db.Column(db.String(11), nullable=False)  
    weekend_hours = db.Column(db.String(11), nullable=False) 
    address = db.Column(db.String(200), unique=True, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    owner = db.relationship('User', back_populates='venue')
    reservations = db.relationship('Reservation', back_populates='venue')
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

class Reservation(db.Model):
    __tablename__ = 'reservations'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    venue_id = db.Column(db.Integer, db.ForeignKey('venues.id'), nullable=False)
    reservation_time = db.Column(db.DateTime, nullable=False)
    party_size = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Enum(ReservationStatus), default=ReservationStatus.PENDING)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    customer = db.relationship('User', back_populates='reservations')
    venue = db.relationship('Venue', back_populates='reservations')

    def __repr__(self):
        return f'<Reservation {self.id} for {self.venue.name}>'