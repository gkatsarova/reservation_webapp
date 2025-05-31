import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';

export default function VenueList() {
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await apiClient.get('/venues/');
        console.log('Backend response:', response.data);
        setVenues(response.data);
      } catch (error) {
        console.log('Error:', error);
        if (error.response && error.response.status === 401) {
          alert('You must be logged in to view venues.');
        } else {
          alert('Error loading venues');
        }
      }
    };

    fetchVenues();
  }, []);

  console.log(venues);

  return (
    <div>
      <h2>My Venues</h2>
      <ul>
        {venues.map((v) =>
          v.id ? (
            <li key={v.id}>
              <strong>{v.name}</strong> — {v.address} | Phone: {v.phone}
              <Link to={`/venues/${v.id}`}>
                <button>Details</button>
              </Link>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}