import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import VenueList from './components/VenueList';
import CreateVenue from './components/CreateVenue';

function isAuthenticated() {
  return !!localStorage.getItem('token');
}

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

export default function App() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const token = localStorage.getItem('token');

  return (
    <Router>
      <nav>
        <Link to="/">Venues</Link> |{' '}
        {!token && (
          <>
            <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
          </>
        )}
        {token && <button onClick={handleLogout}>Logout</button>}
      </nav>

      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <VenueList />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-venue"
          element={
            <PrivateRoute>
              <CreateVenue />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}