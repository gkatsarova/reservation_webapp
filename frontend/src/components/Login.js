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
  InputAdornment,
  IconButton
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Visibility, 
  VisibilityOff,
  Email,
  Lock,
  ArrowForward
} from '@mui/icons-material';
import { apiClient } from '../api/client';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

export default function Login({ setToken, setUserType, setUsername }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }

    setLoading(true);
    setError('');
    
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

      navigate('/home'); 
    } catch (err) {
      setError('Login failed. Please check your credentials');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
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
          Welcome Back
        </Typography>

        <Box sx={{ mb: 3 }}>
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
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#64748B' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        <MotionButton
          fullWidth
          variant="contained"
          onClick={handleLogin}
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
            'Login'
          )}
        </MotionButton>

        <Box sx={{ 
          mt: 3, 
          textAlign: 'center',
          color: '#64748B'
        }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link 
              href="/register" 
              sx={{ 
                fontWeight: 600, 
                textDecoration: 'none',
                color: '#6366F1',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Register here
            </Link>
          </Typography>
        </Box>
      </MotionBox>
    </Box>
  );
}