import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);

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

  if (!venue) return <div>Loading...</div>;

  console.log('user_id:', localStorage.getItem('user_id'));
  console.log('venue.owner_id:', venue.owner_id);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{venue.name}</h2>
      <p><strong>Type:</strong> {venue.venue_type}</p>
      <p><strong>Address:</strong> {venue.address}</p>
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
      {Number(localStorage.getItem('user_id')) === venue.owner_id && (
        <button onClick={handleDelete} style={{ marginLeft: 10, color: 'red' }}>
          Delete Venue
        </button>
      )}
    </div>
  );
}