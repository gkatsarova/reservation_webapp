import React from 'react';
import PropTypes from 'prop-types';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Logout, Delete } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog';

const MotionButton = motion('button');

const NavButton = ({ onClick, icon, text, color, borderColor, hoverColor }) => (
  <MotionButton
    onClick={onClick}
    style={{
      fontWeight: 600,
      borderRadius: 50,
      textTransform: 'none',
      padding: '8px 20px',
      border: `1px solid ${borderColor}`,
      color: color,
      background: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      outline: 'none'
    }}
    whileHover={{ scale: 1.05, backgroundColor: hoverColor }}
    whileTap={{ scale: 0.98 }}
  >
    {icon}
    {text}
  </MotionButton>
);

NavButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  borderColor: PropTypes.string.isRequired,
  hoverColor: PropTypes.string.isRequired
};

const Logo = () => (
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
);

const UserInfo = ({ username }) => (
  <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 600 }}>
    {username}
  </Typography>
);

UserInfo.propTypes = {
  username: PropTypes.string.isRequired
};

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
    setOpen(false);
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
          <Logo />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <UserInfo username={username} />
            <NavButton
              onClick={() => setOpen(true)}
              icon={<Delete fontSize="small" style={{ marginRight: 6 }} />}
              text="Delete Profile"
              color="#EF4444"
              borderColor="#EF4444"
              hoverColor="#FEE2E2"
            />
            <NavButton
              onClick={handleLogout}
              icon={<Logout fontSize="small" style={{ marginRight: 6 }} />}
              text="Logout"
              color="#64748B"
              borderColor="#E2E8F0"
              hoverColor="#F8FAFC"
            />
          </Box>
        </Toolbar>
      </AppBar>
      <ConfirmDeleteDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDeleteProfile}
        title="Delete Profile"
        text="Are you sure you want to delete your profile? This action cannot be undone!"
      />
    </>
  );
}

Navbar.propTypes = {
  setToken: PropTypes.func,
  setUserType: PropTypes.func,
  setUsername: PropTypes.func
}; 