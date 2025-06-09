import React from 'react';
import { AppBar, Toolbar, Typography, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Logout, Delete } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

const MotionButton = motion('button');

export default function Navbar({ setToken, setUserType, setUsername }) {
  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.clear();
    setToken && setToken(null);
    setUserType && setUserType(null);
    setUsername && setUsername(null);
    navigate('/login');
  };

  const handleDeleteProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await apiClient.delete(`/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      handleLogout();
    } catch (err) {
      alert('Error deleting profile');
    }
  };

  return (
    <>
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
              onClick={() => setOpen(true)}
              style={{
                fontWeight: 600,
                borderRadius: 50,
                textTransform: 'none',
                padding: '8px 20px',
                border: '1px solid #EF4444',
                color: '#EF4444',
                background: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                outline: 'none'
              }}
              whileHover={{ scale: 1.05, backgroundColor: '#FEE2E2' }}
              whileTap={{ scale: 0.98 }}
            >
              <Delete fontSize="small" style={{ marginRight: 6 }} />
              Delete Profile
            </MotionButton>
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
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Delete Profile</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your profile? This action cannot be undone!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteProfile} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}