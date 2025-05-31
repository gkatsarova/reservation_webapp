import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function VenueDetails() {
  const { id } = useParams();
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

  if (!venue) return <div>Loading...</div>;

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
    </div>
  );
}