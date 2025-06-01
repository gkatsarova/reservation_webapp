import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import {Link } from 'react-router-dom';

export default function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const userType = localStorage.getItem('user_type');
  const userId = Number(localStorage.getItem('user_id'));

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await apiClient.get('/reservations/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReservations(response.data);
      } catch (error) {
        alert('Error loading reservations');
      }
    };
    fetchReservations();
  }, []);

  const handleDelete = async (reservationId) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    try {
      const token = localStorage.getItem('token');
      await apiClient.delete(`/reservations/${reservationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(reservations.filter(r => r.id !== reservationId));
      alert('Reservation deleted!');
    } catch (error) {
      alert('Error deleting reservation');
    }
  };

  if (!reservations.length) return <div>No reservations found.</div>;

  console.log(reservations);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Reservations</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {reservations.map(r => (
          <li key={r.id} style={{ border: '1px solid #ccc', marginBottom: 16, padding: 16, borderRadius: 8 }}>
            <div>
              <strong>Venue:</strong>{' '}
              <Link to={`/venues/${r.venue_id}`}>
                {r.venue_name}
              </Link>
            </div>
            <div><strong>Date & Time:</strong> {r.reservation_time}</div>
            <div><strong>Party Size:</strong> {r.party_size}</div>
            <div><strong>Status:</strong> {r.status}</div>
            <div><strong>Notes:</strong> {r.notes}</div>
            {userType === 'owner' && (
              <>
                <div><strong>Customer:</strong> {r.customer_name}</div>
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      try {
                        await apiClient.patch(`/reservations/${r.id}/status`, { status: 'confirmed' }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        setReservations(reservations =>
                          reservations.map(res =>
                            res.id === r.id ? { ...res, status: 'confirmed' } : res
                          )
                        );
                      } catch {
                        alert('Error updating status');
                      }
                    }}
                    disabled={r.status === 'confirmed'}
                    style={{ marginRight: 8 }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      try {
                        await apiClient.patch(`/reservations/${r.id}/status`, { status: 'cancelled' }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        setReservations(reservations =>
                          reservations.map(res =>
                            res.id === r.id ? { ...res, status: 'cancelled' } : res
                          )
                        );
                      } catch {
                        alert('Error updating status');
                      }
                    }}
                    disabled={r.status === 'cancelled'}
                    style={{ color: 'red' }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
            {userType === 'customer' && r.customer_id === userId && (
              <button
                onClick={() => handleDelete(r.id)}
                style={{ marginTop: 10, color: 'red' }}
              >
                Delete Reservation
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}