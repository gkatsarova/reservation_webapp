import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

export default function VenueList() {
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await apiClient.get('/venues');
        setVenues(response.data);
      } catch (error) {
        alert('Error loading venues');
      }
    };
    fetchVenues();
  }, []);

  return (
    <div>
      <h2>Restaurants</h2>
      <ul>
        {venues.map(venue => (
          <li key={venue.id}>{venue.name} - {venue.address}</li>
        ))}
      </ul>
    </div>
  );
}