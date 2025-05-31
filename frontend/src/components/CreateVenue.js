import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';

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

  return (
    <div>
      <h2>Create Venue</h2>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="address" placeholder="Address" onChange={handleChange} />
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
    </div>
  );
}