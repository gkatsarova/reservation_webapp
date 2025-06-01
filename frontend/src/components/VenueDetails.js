import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    reservation_time: '',
    party_size: 1,
    notes: ''
  });
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await apiClient.get(`/venues/${id}`);
        setVenue(response.data);
      } catch (error) {
        alert('Error loading venue details');
      }
    };
    fetchVenue();
  }, [id]);

  useEffect(() => {
    if (venue && venue.latitude && venue.longitude) {
      setCoords([venue.latitude, venue.longitude]);
    }
  }, [venue]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this venue?')) {
      try {
        const token = localStorage.getItem('token');
        await apiClient.delete(`/venues/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Venue deleted');
        navigate('/venues');
      } catch (error) {
        alert('Error deleting venue');
      }
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReservation = async (e) => {
    e.preventDefault();

    const now = new Date();
    const selected = new Date(form.reservation_time);
    if (selected < now) {
      alert('Cannot make reservation in the past!');
      return;
    }

    const day = selected.getDay(); 
    const isWeekend = (day === 0 || day === 6);
    const hoursStr = isWeekend ? venue.weekend_hours : venue.weekdays_hours; 
    const [start, end] = hoursStr.split('-');
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const resHour = selected.getHours();
    const resMin = selected.getMinutes();

    const afterStart = resHour > startH || (resHour === startH && resMin >= startM);
    const beforeEnd = resHour < endH || (resHour === endH && resMin <= endM);

    if (!(afterStart && beforeEnd)) {
      alert(`Reservation must be within working hours: ${hoursStr}`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formattedTime = form.reservation_time.replace('T', ' ');
      await apiClient.post('/reservations/', {
        venue_id: Number(id),
        reservation_time: formattedTime,
        party_size: Number(form.party_size),
        notes: form.notes
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Reservation created!');
      setShowForm(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating reservation');
    }
  };

  if (!venue) return <div>Loading...</div>;

  console.log('user_id:', localStorage.getItem('user_id'));
  console.log('venue.owner_id:', venue.owner_id);

  const isCustomer = localStorage.getItem('user_type') === 'customer';

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{venue.name}</h2>
      <p><strong>Type:</strong> {venue.venue_type}</p>
      <p><strong>Address:</strong> {venue.address}</p>
      {coords && (
        <MapContainer center={coords} zoom={16} style={{ height: 300, width: '100%', marginBottom: 10 }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={coords} />
        </MapContainer>
      )}
      <p><strong>Phone:</strong> {venue.phone}</p>
      <p><strong>Email:</strong> {venue.email}</p>
      <p><strong>Weekdays hours:</strong> {venue.weekdays_hours}</p>
      <p><strong>Weekend hours:</strong> {venue.weekend_hours}</p>
      {venue.menu_image_url && (
        <div>
          <strong>Menu:</strong><br />
          <img src={venue.menu_image_url} alt="Menu" style={{ maxWidth: 400 }} />
        </div>
      )}
      <br />
      <Link to="/venues">
        <button>Back to list</button>
      </Link>
      {isCustomer && !showForm && (
        <button onClick={() => setShowForm(true)} style={{ marginLeft: 10 }}>
          Make Reservation
        </button>
      )}
      {isCustomer && showForm && (
        <form onSubmit={handleReservation} style={{ marginTop: 20 }}>
          <div>
            <label>Date & Time: </label>
            <input
              type="datetime-local"
              name="reservation_time"
              value={form.reservation_time}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0,16)} 
            />
          </div>
          <div>
            <label>Party Size: </label>
            <input
              type="number"
              name="party_size"
              min="1"
              value={form.party_size}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Notes: </label>
            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={handleChange}
            />
          </div>
          <button type="submit">Reserve</button>
          <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </form>
      )}
      {Number(localStorage.getItem('user_id')) === venue.owner_id && (
        <button onClick={handleDelete} style={{ marginLeft: 10, color: 'red' }}>
          Delete Venue
        </button>
      )}
    </div>
  );
}