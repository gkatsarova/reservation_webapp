import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Logout, Dashboard, CalendarToday, AddBusiness } from '@mui/icons-material';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

export default function HomePage({ username, userType, setToken, setUserType, setUsername }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const storedUsername = localStorage.getItem('username');
  const storedType = localStorage.getItem('user_type');

  useEffect(() => {
    if (!username && storedUsername) setUsername(storedUsername);
    if (!userType && storedType) setUserType(storedType);
  }, [username, setUsername, userType, setUserType]);

  const displayUsername = username || storedUsername;
  const displayUserType = userType || storedType;

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUserType(null);
    setUsername(null);
    navigate('/login');
  };

  const actionButtons = [
    {
      label: displayUserType === 'owner' ? 'My Venues' : 'Browse Venues',
      path: '/venues',
      color: '#6366F1',  
      icon: <Dashboard fontSize="large" />,
      description: displayUserType === 'owner' 
        ? 'Manage your venues' 
        : 'Find perfect venues for your events'
    },
    {
      label: displayUserType === 'owner' ? 'My Reservations' : 'My Reservations',
      path: '/reservations',
      color: '#0EA5E9', 
      icon: <CalendarToday fontSize="large" />,
      description: displayUserType === 'owner' 
        ? 'Manage venue reservations' 
        : 'View your bookings'
    }
  ];

  if (displayUserType === 'owner') {
    actionButtons.push({
      label: 'Create Venue',
      path: '/create-venue',
      color: '#10B981',  
      icon: <AddBusiness fontSize="large" />,
      description: 'Add new venue to platform'
    });
  }

  const buttonCount = actionButtons.length;
  const mobileHeight = `calc((100vh - 64px - ${buttonCount} * 16px) / ${buttonCount})`;
  const desktopHeight = '100%';

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at top right, #f0f4ff 0%, #e6f7ff 100%)',
      overflow: 'hidden',
      position: 'relative',
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
      
      <AppBar position="static" color="primary" elevation={1} sx={{ 
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        zIndex: 2
      }}>
        <Toolbar sx={{ 
          justifyContent: 'space-between',
          padding: isMobile ? '0 12px' : '0 24px'
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700,
            letterSpacing: 0.5,
            color: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box component="span" sx={{ 
              background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              display: 'inline-block'
            }} />
            Welcome, <Box component="span" sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>{displayUsername}</Box>
          </Typography>
          
          <MotionButton
            variant="outlined"
            color="inherit"
            onClick={handleLogout}
            startIcon={<Logout />}
            whileHover={{ scale: 1.05, backgroundColor: '#F8FAFC' }}
            whileTap={{ scale: 0.98 }}
            sx={{ 
              fontWeight: 600,
              borderRadius: 50,
              textTransform: 'none',
              px: 2.5,
              py: 1,
              borderColor: '#E2E8F0',
              color: '#64748B',
              '& .MuiButton-startIcon': {
                marginRight: '6px'
              }
            }}
          >
            Logout
          </MotionButton>
        </Toolbar>
      </AppBar>

      <Stack 
        direction={isMobile ? 'column' : 'row'} 
        sx={{ 
          height: 'calc(100vh - 64px)', 
          p: isMobile ? 2 : 3,
          gap: isMobile ? 2 : 3,
          position: 'relative',
          zIndex: 1,
          boxSizing: 'border-box'
        }}
      >
        <AnimatePresence>
          {actionButtons.map((button, index) => (
            <MotionBox
              key={index}
              onClick={() => navigate(button.path)}
              whileHover={{ 
                scale: 1.03,
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                y: -10
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
              sx={{
                flex: 1,
                height: isMobile ? mobileHeight : desktopHeight,
                minHeight: isMobile ? '150px' : 'none',
                borderRadius: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                p: 4,
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                background: `linear-gradient(145deg, ${button.color} 0%, ${darkenColor(button.color, 15)} 100%)`,
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                  opacity: 0,
                  transition: 'opacity 0.5s ease'
                },
                '&:hover::before': {
                  opacity: 0.6
                }
              }}
            >
              <Box sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)'
              }} />
              
              <Box sx={{
                position: 'absolute',
                bottom: -20,
                left: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }} />
              
              {button.icon && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {button.icon}
                </motion.div>
              )}
              
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                sx={{ 
                  textAlign: 'center',
                  zIndex: 1,
                  fontSize: isMobile ? '1.8rem' : '2.4rem',
                  px: 2,
                  mt: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {button.label}
              </Typography>
              
              <Typography 
                variant="body1"
                sx={{
                  opacity: 0.9,
                  mt: 1.5,
                  textAlign: 'center',
                  maxWidth: '80%',
                  zIndex: 1,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                {button.description}
              </Typography>
            </MotionBox>
          ))}
        </AnimatePresence>
      </Stack>
    </Box>
  );
}

function darkenColor(color, percent) {
  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return [
      (bigint >> 16) & 255,
      (bigint >> 8) & 255,
      bigint & 255
    ];
  };
  
  const rgbToHex = (r, g, b) => 
    `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  
  if (color.startsWith('#')) {
    const [r, g, b] = hexToRgb(color);
    return rgbToHex(
      Math.max(0, Math.floor(r * (1 - percent/100))),
      Math.max(0, Math.floor(g * (1 - percent/100))),
      Math.max(0, Math.floor(b * (1 - percent/100)))
    );
  }
  
  return color;
}