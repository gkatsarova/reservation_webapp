import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import VenueList from './components/VenueList';
import HomePage from './components/HomePage';
import CreateVenue from './components/CreateVenue';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userType, setUserType] = useState(localStorage.getItem('user_type'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setUserType(localStorage.getItem('user_type'));
      setUsername(localStorage.getItem('username'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Навигация за НЕлогнати потребители (login, register, venues)
  if (!token) {
    return (
      <Router>
        <nav>
          <Link to="/venues">Venues</Link> | <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
        </nav>
        <Routes>
          <Route path="/venues" element={<VenueList />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setToken={setToken} setUserType={setUserType} setUsername={setUsername} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  // Ако е логнат — навигация **само** към HomePage, VenueList и (ако е owner) CreateVenue
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/venues">Venues</Link> |{' '}
        {userType === 'owner' && <Link to="/create-venue">Create Venue</Link>}
      </nav>
      <Routes>
        <Route path="/" element={<HomePage username={username} userType={userType} setToken={setToken} setUserType={setUserType} setUsername={setUsername} />} />
        <Route path="/venues" element={<VenueList />} />
        {userType === 'owner' && <Route path="/create-venue" element={<CreateVenue />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}