import React, { useState } from 'react';
import { apiClient } from '../api/client';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('customer');

  const handleRegister = async () => {
    if (!username || !email || !password) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await apiClient.post('/auth/register', {
        username,  
        email,
        password,
        user_type: userType
      });
      alert('Registration successful! You can now log in.');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Error during registration: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <select onChange={(e) => setUserType(e.target.value)}>
        <option value="customer">Customer</option>
        <option value="owner">Owner</option>
      </select>
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
