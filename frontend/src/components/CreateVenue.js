import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function SetMapView({ coords }) {
  const map = useMap();
  if (coords) map.setView(coords, 16);
  return null;
}

function LocationSelector({ setCoords, setFormData }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setCoords([lat, lng]);
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await resp.json();
      if (data && data.display_name) {
        setFormData((prev) => ({ ...prev, address: data.display_name }));
      }
    }
  });
  return null;
}

export default function CreateVenue() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    weekdays_hours: '',
    weekend_hours: '',
    menu_image_url: '',
    type: '', 
  });
  const [venues, setVenues] = useState([]);
  const [coords, setCoords] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in!');
      return;
    }
    try {
      const response = await apiClient.post('/venues/', formData);
      alert('Venue created! ID: ' + response.data.id);
    } catch (error) {
      alert(
        'Error creating venue: ' +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleAddressBlur = async () => {
    if (!formData.address) return;
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.address)}&format=json&limit=1`);
    const data = await resp.json();
    if (data && data[0]) {
      setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
    } else {
      setCoords(null);
      alert('Address not found on map!');
    }
  };

  return (
    <div>
      <h2>Create Venue</h2>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input
        name="address"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange}
        onBlur={handleAddressBlur}
      />
      <input name="phone" placeholder="Phone" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input
        name="weekdays_hours"
        placeholder="Weekdays hours (HH:MM-HH:MM)"
        onChange={handleChange}
      />
      <input
        name="weekend_hours"
        placeholder="Weekend hours (HH:MM-HH:MM)"
        onChange={handleChange}
      />
      <input
        name="menu_image_url"
        placeholder="Menu Image URL"
        onChange={handleChange}
      />
      <select name="type" onChange={handleChange} required>
        <option value="">Select type</option>
        <option value="restaurant">Restaurant</option>
        <option value="bar">Bar</option>
        <option value="cafe">Cafe</option>
      </select>
      <button onClick={handleSubmit}>Create</button>

      <h3>Venues List</h3>
      <ul>
        {venues.map((venue) => (
          <li key={venue.id}>
            <Link to={`/venues/${venue.id}`}>
            <button>{venue.name}</button>
            </Link>
          </li>
        ))}
      </ul>

      {coords && (
        <MapContainer center={coords} zoom={16} style={{ height: 300, width: '100%', marginTop: 10 }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={coords} />
          <SetMapView coords={coords} />
          <LocationSelector setCoords={setCoords} setFormData={setFormData} />
        </MapContainer>
      )}
    </div>
  );
}