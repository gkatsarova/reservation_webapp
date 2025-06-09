import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Link, 
  useTheme,
  useMediaQuery,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Person,
  Email, 
  Lock,
  ArrowForward
} from '@mui/icons-material';
import { apiClient } from '../api/client';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

export default function Register({ setToken, setUserType, setUsername }) {
  const [username, setUsernameInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserTypeInput] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
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
        localStorage.setItem('username', username);
        setToken && setToken(response.data.access_token);
        setUserType && setUserType(userType);
        setUsername && setUsername(username);
        alert('Registration successful! You are logged in.');
        navigate('/home');
      } else {
        alert('Registration successful! You can now log in.');
        navigate('/login');
      }
    } catch (error) {
      setError(
        'Error during registration: ' +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #f0f4ff 0%, #e6f7ff 100%)',
      position: 'relative',
      overflow: 'hidden',
      p: isMobile ? 2 : 0,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 40%)',
        zIndex: 0
      }
    }}>
      <Box sx={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '50vh',
        height: '50vh',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)',
        zIndex: 0
      }} />
      
      <Box sx={{
        position: 'absolute',
        bottom: '-10%',
        left: '-10%',
        width: '40vh',
        height: '40vh',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        zIndex: 0
      }} />

      <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        sx={{
          width: isMobile ? '100%' : 400,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderRadius: 4,
          boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)',
          p: 4,
          zIndex: 1,
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        <Typography 
          variant="h4" 
          fontWeight="800" 
          sx={{ 
            mb: 3, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Create Account
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: '#64748B' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: '#64748B' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#64748B' }} />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            select
            fullWidth
            label="User Type"
            value={userType}
            onChange={(e) => setUserTypeInput(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
          </TextField>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        <MotionButton
          fullWidth
          variant="contained"
          onClick={handleRegister}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          endIcon={!loading && <ArrowForward />}
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
              background: 'linear-gradient(135deg, #5659E3 0%, #0A93D9 100%)',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            'Register'
          )}
        </MotionButton>

        <Box sx={{ 
          mt: 3, 
          textAlign: 'center',
          color: '#64748B'
        }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link 
              href="/login" 
              sx={{ 
                fontWeight: 600, 
                textDecoration: 'none',
                color: '#6366F1',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Login here
            </Link>
          </Typography>
        </Box>
      </MotionBox>
    </Box>
  );
}