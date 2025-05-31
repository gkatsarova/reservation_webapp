import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function Login({ setToken, setUserType, setUsername }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please fill in both fields');
      return;
    }

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user_type', response.data.user_type);
      localStorage.setItem('username', response.data.username); 
      localStorage.setItem('user_id', response.data.user_id);

      setToken(response.data.access_token);
      setUserType(response.data.user_type);
      setUsername(response.data.username);

      alert('Login successful!');
      navigate('/home'); 
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <p>
        Don't have an account? <a href="/register">Register here</a>.
      </p>
    </div>
  );
}