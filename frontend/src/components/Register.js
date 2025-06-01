import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function Register({ setToken, setUserType, setUsername}) {
  const [username, setUsernameInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserTypeInput] = useState('customer');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await apiClient.post('/auth/register', {
        username,
        email,
        password,
        user_type: userType,
      });
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user_type', userType);
        localStorage.setItem('user_id', response.data.user_id);
        setToken && setToken(response.data.access_token);
        setUserType && setUserType(userType);
        setUsername && setUsername(username);
        alert('Registration succesful! You are logged in.');
        navigate('/home');
      } else{
      alert('Registration successful! You can now log in.');
      navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(
        'Error during registration: ' +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setUsernameInput(e.target.value)}
      />
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
      <select onChange={(e) => setUserTypeInput(e.target.value)} value={userType}>
        <option value="customer">Customer</option>
        <option value="owner">Owner</option>
      </select>
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}