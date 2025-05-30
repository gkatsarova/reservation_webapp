import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function HomePage({ username, userType, setToken, setUserType, setUsername }) {
  const navigate = useNavigate();

  const displayUsername = username || localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('username');
    setToken(null);
    setUserType(null);
    setUsername(null);
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome, {displayUsername}!</h2>
      <p>User type: <strong>{userType}</strong></p>

      <Link to="/venues">
        <button>Venue List</button>
      </Link>{' '}

      {userType === 'owner' && (
        <Link to="/create-venue">
          <button>Create Venue</button>
        </Link>
      )}{' '}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
