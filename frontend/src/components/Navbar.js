import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Logout } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const MotionButton = motion('button');

export default function Navbar({ setToken, setUserType, setUsername }) {
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setToken && setToken(null);
    setUserType && setUserType(null);
    setUsername && setUsername(null);
    navigate('/login');
  };

  return (
    <AppBar position="static" color="primary" elevation={1} sx={{ 
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      zIndex: 2
    }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 64 }}>
        <Typography 
          variant="h5" 
          fontWeight="800" 
          component={Link}
          to="/"
          sx={{ 
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: 1
          }}
        >
          Home
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 600 }}>
            {username}
          </Typography>
          <MotionButton
            onClick={handleLogout}
            style={{
              fontWeight: 600,
              borderRadius: 50,
              textTransform: 'none',
              padding: '8px 20px',
              border: '1px solid #E2E8F0',
              color: '#64748B',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              outline: 'none'
            }}
            whileHover={{ scale: 1.05, backgroundColor: '#F8FAFC' }}
            whileTap={{ scale: 0.98 }}
          >
            <Logout fontSize="small" style={{ marginRight: 6 }} />
            Logout
          </MotionButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}