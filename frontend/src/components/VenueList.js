import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardMedia, 
  Button, 
  CircularProgress,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { motion } from 'framer-motion';
import { LocationOn, Phone, ArrowForward } from '@mui/icons-material';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function VenueList() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userType = localStorage.getItem('user_type'); // вземи типа на потребителя

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/venues/');
        setVenues(response.data);
      } catch (error) {
        console.log('Error:', error);
        if (error.response && error.response.status === 401) {
          setError('You must be logged in to view venues.');
        } else {
          setError('Error loading venues. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const getPlaceholderImage = (index) => {
    const colors = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B'];
    return `https://via.placeholder.com/800x400/${colors[index % colors.length].slice(1)}/ffffff?text=Venue+${index+1}`;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        background: 'radial-gradient(circle at top right, #f0f4ff 0%, #e6f7ff 100%)'
      }}>
        <CircularProgress size={60} sx={{ color: '#6366F1' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        flexDirection: 'column',
        background: 'radial-gradient(circle at top right, #f0f4ff 0%, #e6f7ff 100%)',
        p: 3
      }}>
        <Typography variant="h5" color="error" sx={{ mb: 2, textAlign: 'center' }}>
          {error}
        </Typography>
        <MotionButton
          variant="contained"
          onClick={() => window.location.reload()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          sx={{
            background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
            color: 'white',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 2
          }}
        >
          Try Again
        </MotionButton>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, #f0f4ff 0%, #e6f7ff 100%)',
      p: isMobile ? 2 : 4,
      position: 'relative',
      overflow: 'hidden',
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

      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        <Typography 
          variant="h3" 
          fontWeight="800" 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          All Venues
        </Typography>
        
        {venues.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            flexDirection: 'column'
          }}>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
              No venues available
            </Typography>
            {userType === 'owner' && (
              <MotionButton
                variant="contained"
                component={Link}
                to="/create-venue"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                Create New Venue
              </MotionButton>
            )}
          </Box>
        ) : (
          <Stack spacing={isMobile ? 2 : 4} sx={{ width: '100%' }}>
            {venues.map((venue, index) => (
              <MotionCard
                key={venue.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, boxShadow: '0 15px 30px rgba(0,0,0,0.15)' }}
                sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                  width: '100%',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                  <CardMedia
                    component="img"
                    height={isMobile ? "200" : "220"}
                    image={venue.image_url || getPlaceholderImage(index)}
                    alt={venue.name}
                    sx={{ 
                      width: isMobile ? '100%' : '40%',
                      objectFit: 'cover',
                      position: 'relative'
                    }}
                    onLoad={() => {
                      document.querySelector(`#venue-img-${venue.id}`)?.setAttribute('data-loaded', 'true');
                    }}
                    id={`venue-img-${venue.id}`}
                  />
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    flex: 1,
                    p: 3 
                  }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography 
                        gutterBottom 
                        variant="h4" 
                        component="div"
                        fontWeight="700"
                        sx={{ mb: 2 }}
                      >
                        {venue.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <LocationOn sx={{ color: '#6366F1', mr: 1 }} />
                        <Typography variant="h6" color="text.secondary">
                          {venue.address}
                        </Typography>
                      </Box>
                      
                      {venue.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Phone sx={{ color: '#0EA5E9', mr: 1 }} />
                          <Typography variant="h6" color="text.secondary">
                            {venue.phone}
                          </Typography>
                        </Box>
                      )}
                      
                      {venue.description && (
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                          {venue.description}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 3, alignSelf: 'flex-end' }}>
                      <MotionButton
                        component={Link}
                        to={`/venues/${venue.id}`}
                        variant="contained"
                        endIcon={<ArrowForward />}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        sx={{
                          background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
                          color: 'white',
                          fontWeight: 600,
                          py: 1.5,
                          px: 4,
                          borderRadius: 2
                        }}
                      >
                        View Details
                      </MotionButton>
                    </Box>
                  </Box>
                </Box>
              </MotionCard>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}