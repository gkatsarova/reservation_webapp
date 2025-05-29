import React, { useState } from 'react';
import { apiClient } from '../api/client';

export default function CreateVenue() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    weekdays_hours: '',
    weekend_hours: '',
    menu_image_url: '',
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const response = await apiClient.post('/venues', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
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
      <button onClick={handleSubmit}>Create</button>
    </div>
  );
}