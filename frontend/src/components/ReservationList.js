import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  useTheme,
  useMediaQuery,
  CircularProgress,
  Chip,
  Stack,
  IconButton
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Delete, 
  CheckCircle, 
  Cancel, 
  Restaurant, 
  Schedule, 
  People,
  Notes,
  Person
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function ReservationList({ setToken, setUserType, setUsername }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const userType = localStorage.getItem('user_type');
  const userId = Number(localStorage.getItem('user_id'));

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await apiClient.get('/reservations/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReservations(response.data);
      } catch (error) {
        console.error('Error loading reservations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await apiClient.delete(`/reservations/${selectedReservationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(reservations.filter(r => r.id !== selectedReservationId));
    } catch (error) {
      alert('Error deleting reservation');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedReservationId(null);
    }
  };

  const handleStatusChange = async (reservationId, status) => {
    try {
      const token = localStorage.getItem('token');
      await apiClient.patch(`/reservations/${reservationId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(reservations.map(r => 
        r.id === reservationId ? { ...r, status } : r
      ));
    } catch (error) {
      alert('Error updating status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'primary';
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <>
      <Navbar setToken={setToken} setUserType={setUserType} setUsername={setUsername} />
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

        <Box sx={{ 
          position: 'relative', 
          zIndex: 1,
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
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
            Your Reservations
          </Typography>
          
          {reservations.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '50vh',
              flexDirection: 'column',
              textAlign: 'center'
            }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                No reservations found
              </Typography>
              <MotionButton
                variant="contained"
                component={Link}
                to="/venues"
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
                Browse Venues
              </MotionButton>
            </Box>
          ) : (
            <Grid container spacing={isMobile ? 2 : 3}>
              {reservations.map((r) => (
                <Grid item xs={12} key={r.id}>
                  <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    sx={{ 
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between'
                      }}>
                        <Box sx={{ flex: 1, mb: isMobile ? 2 : 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Restaurant sx={{ color: '#6366F1', mr: 1 }} />
                            <Typography variant="h5" component="div" fontWeight="700">
                              <Link to={`/venues/${r.venue_id}`} style={{ 
                                textDecoration: 'none',
                                color: '#1E293B',
                                '&:hover': { textDecoration: 'underline' }
                              }}>
                                {r.venue_name}
                              </Link>
                            </Typography>
                          </Box>
                          
                          <Stack spacing={1} sx={{ ml: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Schedule sx={{ color: '#64748B', mr: 1, fontSize: 20 }} />
                              <Typography variant="body1">
                                {formatDateTime(r.reservation_time)}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <People sx={{ color: '#64748B', mr: 1, fontSize: 20 }} />
                              <Typography variant="body1">
                                Party Size: {r.party_size}
                              </Typography>
                            </Box>
                            
                            {r.notes && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Notes sx={{ color: '#64748B', mr: 1, fontSize: 20 }} />
                                <Typography variant="body1">
                                  {r.notes}
                                </Typography>
                              </Box>
                            )}
                            
                            {userType === 'owner' && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Person sx={{ color: '#64748B', mr: 1, fontSize: 20 }} />
                                <Typography variant="body1">
                                  Customer: {r.customer_name}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: isMobile ? 'flex-start' : 'flex-end',
                          gap: 1
                        }}>
                          <Chip 
                            label={r.status.toUpperCase()} 
                            color={getStatusColor(r.status)}
                            sx={{ 
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              px: 1,
                              mb: 1
                            }} 
                          />
                          
                          {userType === 'owner' && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <MotionButton
                                variant="contained"
                                startIcon={<CheckCircle />}
                                onClick={() => handleStatusChange(r.id, 'confirmed')}
                                disabled={r.status === 'confirmed'}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                size="small"
                                sx={{
                                  background: r.status === 'confirmed' ? 
                                    theme.palette.success.light : 
                                    'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                  color: 'white',
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  fontSize: '0.8rem'
                                }}
                              >
                                Confirm
                              </MotionButton>
                              
                              <MotionButton
                                variant="contained"
                                startIcon={<Cancel />}
                                onClick={() => handleStatusChange(r.id, 'cancelled')}
                                disabled={r.status === 'cancelled'}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                size="small"
                                sx={{
                                  background: r.status === 'cancelled' ? 
                                    theme.palette.error.light : 
                                    'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                                  color: 'white',
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  fontSize: '0.8rem'
                                }}
                              >
                                Cancel
                              </MotionButton>
                            </Box>
                          )}
                          
                          {userType === 'customer' && r.customer_id === userId && (
                            <IconButton
                              onClick={() => {
                                setSelectedReservationId(r.id);
                                setDeleteDialogOpen(true);
                              }}
                              sx={{
                                background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                                color: 'white',
                                borderRadius: 2,
                                '&:hover': {
                                  background: '#B91C1C'
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </MotionCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Reservation"
        text="Are you sure you want to delete this reservation? This action cannot be undone!"
      />
    </>
  );
}