import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/features/auth/Register';
import Login from './components/features/auth/Login';
import VenueList from './components/features/venues/VenueList';
import HomePage from './components/features/home/HomePage';
import CreateVenue from './components/features/venues/CreateVenue';
import VenueDetails from './components/features/venues/VenueDetails';
import ReservationList from './components/features/reservations/ReservationList';

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

  if (!token) {
    return (
      <Router>
        <Routes>
          <Route path="/venues" element={<VenueList />} />
          <Route path="/register" element={<Register setToken={setToken} setUserType={setUserType} setUsername={setUsername}/>} />
          <Route path="/login" element={<Login setToken={setToken} setUserType={setUserType} setUsername={setUsername} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              username={username}
              userType={userType}
              setToken={setToken}
              setUserType={setUserType}
              setUsername={setUsername}
            />
          }
        />
        <Route
          path="/venues"
          element={
            <VenueList
              setToken={setToken}
              setUserType={setUserType}
              setUsername={setUsername}
            />
          }
        />
        <Route
          path="/venues/:id"
          element={
            <VenueDetails
              setToken={setToken}
              setUserType={setUserType}
              setUsername={setUsername}
            />
          }
        />
        {userType === 'owner' && (
          <Route
            path="/create-venue"
            element={
              <CreateVenue
                setToken={setToken}
                setUserType={setUserType}
                setUsername={setUsername}
              />
            }
          />
        )}
        <Route
          path="/reservations"
          element={
            <ReservationList
              setToken={setToken}
              setUserType={setUserType}
              setUsername={setUsername}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}