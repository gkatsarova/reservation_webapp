import React, { useState } from 'react';
import { apiClient } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
    alert('Please fill in both fields');
    return;
    }
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      alert('Login successful!');
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <div>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}