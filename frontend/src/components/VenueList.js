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
      <h2>My Venues</h2>
      <ul>
        {venues.map((v) => (
          <li key={v.id}>
            <strong>{v.name}</strong> — {v.address} | Phone: {v.phone}
          </li>
        ))}
      </ul>
    </div>
  );
}