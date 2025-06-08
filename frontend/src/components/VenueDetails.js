import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  TextField, 
  useTheme,
  useMediaQuery,
  CircularProgress,
  IconButton,
  Rating,
  Paper,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  ArrowBack, 
  Delete, 
  Schedule, 
  People, 
  Notes, 
  Star, 
  StarBorder,
  Close,
  Map as MapIcon,
  Phone,
  Email,
  CalendarToday
} from '@mui/icons-material';
import { apiClient } from '../api/client';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [venue, setVenue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    reservation_time: '',
    party_size: 1,
    notes: ''
  });
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/venues/${id}`);
        setVenue(response.data);
        if (response.data.latitude && response.data.longitude) {
          setCoords([response.data.latitude, response.data.longitude]);
        }
      } catch (error) {
        setError('Error loading venue details');
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
    fetchComments();
  }, [id]);

  const fetchComments = async () => {
    try {
      const response = await apiClient.get(`/venues/${id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { text: newComment };
      if (isCustomer && !isOwner) payload.rating = newRating;
      await apiClient.post(`/venues/${id}/comments`, payload);
      setNewComment('');
      setNewRating(5);
      fetchComments();
    } catch (error) {
      alert('Error submitting comment');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this venue?')) {
      try {
        const token = localStorage.getItem('token');
        await apiClient.delete(`/venues/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Venue deleted');
        navigate('/venues');
      } catch (error) {
        alert('Error deleting venue');
      }
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const token = localStorage.getItem('token');
        await apiClient.delete(`/venues/${id}/comments/${commentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchComments();
      } catch (error) {
        alert('Error deleting comment');
      }
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReservation = async (e) => {
    e.preventDefault();

    const now = new Date();
    const selected = new Date(form.reservation_time);
    if (selected < now) {
      alert('Cannot make reservation in the past!');
      return;
    }

    const day = selected.getDay(); 
    const isWeekend = (day === 0 || day === 6);
    const hoursStr = isWeekend ? venue.weekend_hours : venue.weekdays_hours; 
    const [start, end] = hoursStr.split('-');
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const resHour = selected.getHours();
    const resMin = selected.getMinutes();

    const afterStart = resHour > startH || (resHour === startH && resMin >= startM);
    const beforeEnd = resHour < endH || (resHour === endH && resMin <= endM);

    if (!(afterStart && beforeEnd)) {
      alert(`Reservation must be within working hours: ${hoursStr}`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formattedTime = form.reservation_time.replace('T', ' ');
      await apiClient.post('/reservations/', {
        venue_id: Number(id),
        reservation_time: formattedTime,
        party_size: Number(form.party_size),
        notes: form.notes
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Reservation created!');
      setShowForm(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating reservation');
    }
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
          Back to Venues
        </MotionButton>
      </Box>
    );
  }

  const isCustomer = localStorage.getItem('user_type') === 'customer';
  const isOwner = Number(localStorage.getItem('user_id')) === venue.owner_id;

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
        <MotionButton
          component={Link}
          to="/venues"
          startIcon={<ArrowBack />}
          variant="outlined"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          sx={{
            mb: 3,
            borderColor: '#E2E8F0',
            color: '#64748B',
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 2
          }}
        >
          Back to Venues
        </MotionButton>

        <Card sx={{ 
          borderRadius: 3, 
          overflow: 'hidden', 
          boxShadow: '0 15px 40px rgba(0,0,0,0.1)', 
          mb: 4 
        }}>
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="400"
              image={venue.image_url || 'https://via.placeholder.com/1200x400/6366f1/ffffff?text=Venue+Image'}
              alt={venue.name}
              sx={{ objectFit: 'cover' }}
            />
            <Box sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              p: 3
            }}>
              <Typography 
                variant="h2" 
                fontWeight="800" 
                sx={{ 
                  color: 'white',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                }}
              >
                {venue.name}
              </Typography>
              <Chip 
                label={venue.venue_type} 
                sx={{ 
                  mt: 1, 
                  background: 'rgba(99, 102, 241, 0.8)', 
                  color: 'white',
                  fontWeight: 600
                }} 
              />
            </Box>
          </Box>
          
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}>
                  Venue Information
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <MapIcon sx={{ color: '#6366F1', mr: 1, fontSize: 24 }} />
                    <Typography variant="h6" color="text.secondary">
                      {venue.address}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Phone sx={{ color: '#0EA5E9', mr: 1, fontSize: 24 }} />
                    <Typography variant="h6" color="text.secondary">
                      {venue.phone}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Email sx={{ color: '#10B981', mr: 1, fontSize: 24 }} />
                    <Typography variant="h6" color="text.secondary">
                      {venue.email}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <CalendarToday sx={{ color: '#F59E0B', mr: 1, fontSize: 24 }} />
                    <Typography variant="h6" color="text.secondary">
                      Weekdays: {venue.weekdays_hours} | Weekend: {venue.weekend_hours}
                    </Typography>
                  </Box>
                </Box>
                
                {coords && (
                  <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden', mt: 2 }}>
                    <MapContainer 
                      center={coords} 
                      zoom={16} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={coords} />
                    </MapContainer>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}>
                  Menu & Details
                </Typography>
                
                {venue.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {venue.description}
                    </Typography>
                  </Box>
                )}
                
                {venue.menu_image_url && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                      Menu:
                    </Typography>
                    <CardMedia
                      component="img"
                      image={venue.menu_image_url}
                      alt="Menu"
                      sx={{
                        borderRadius: 2,
                        maxHeight: 300,
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  {isCustomer && !showForm && (
                    <MotionButton
                      variant="contained"
                      onClick={() => setShowForm(true)}
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
                      Make Reservation
                    </MotionButton>
                  )}
                  
                  {isOwner && (
                    <MotionButton
                      variant="contained"
                      onClick={handleDelete}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      sx={{
                        background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                        color: 'white',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        borderRadius: 2
                      }}
                      startIcon={<Delete />}
                    >
                      Delete Venue
                    </MotionButton>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {isCustomer && showForm && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ 
              background: 'rgba(255, 255, 255, 0.8)', 
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              p: 4,
              mb: 4,
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="700">
                Make Reservation
              </Typography>
              <IconButton onClick={() => setShowForm(false)}>
                <Close />
              </IconButton>
            </Box>
            
            <form onSubmit={handleReservation}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date & Time"
                    type="datetime-local"
                    name="reservation_time"
                    value={form.reservation_time}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().slice(0,16)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <Schedule sx={{ color: '#64748B', mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Party Size"
                    type="number"
                    name="party_size"
                    min="1"
                    value={form.party_size}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <People sx={{ color: '#64748B', mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Special Notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <Notes sx={{ color: '#64748B', mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <MotionButton
                      type="submit"
                      variant="contained"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      sx={{
                        background: 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
                        color: 'white',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        borderRadius: 2
                      }}
                    >
                      Confirm Reservation
                    </MotionButton>
                    
                    <Button
                      variant="outlined"
                      onClick={() => setShowForm(false)}
                      sx={{
                        borderColor: '#E2E8F0',
                        color: '#64748B',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        borderRadius: 2
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </MotionBox>
        )}

        <Card sx={{ 
          borderRadius: 3, 
          overflow: 'hidden', 
          boxShadow: '0 15px 40px rgba(0,0,0,0.1)', 
          p: 4 
        }}>
          <Typography variant="h4" fontWeight="700" sx={{ mb: 3 }}>
            Reviews & Ratings
          </Typography>
          
          {isCustomer && !isOwner ? (
            <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4, p: 3, borderRadius: 2, background: 'rgba(99, 102, 241, 0.05)' }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                Add Your Review
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Your Rating:
                </Typography>
                <Rating
                  name="rating"
                  value={newRating}
                  onChange={(e, newValue) => setNewRating(newValue)}
                  icon={<Star sx={{ color: '#F59E0B' }} fontSize="inherit" />}
                  emptyIcon={<StarBorder sx={{ color: '#F59E0B' }} fontSize="inherit" />}
                />
              </Box>
              <TextField
                fullWidth
                label="Your Comment"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <MotionButton
                type="submit"
                variant="contained"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                sx={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                Submit Review
              </MotionButton>
            </Box>
          ) : isOwner ? (
            <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4, p: 3, borderRadius: 2, background: 'rgba(99, 102, 241, 0.05)' }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                Add Your Comment
              </Typography>
              <TextField
                fullWidth
                label="Your Comment"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <MotionButton
                type="submit"
                variant="contained"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                sx={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                Submit Comment
              </MotionButton>
            </Box>
          ) : null}
          
          {comments.length === 0 ? (
            !isOwner && (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                No reviews yet. Be the first to leave a review!
              </Typography>
            )
          ) : (
            <Grid container spacing={3}>
              {comments.map((comment, index) => (
                <Grid item xs={12} key={index}>
                  <Paper sx={{ p: 3, borderRadius: 2, background: '#F8FAFC' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating
                          value={comment.rating}
                          readOnly
                          icon={<Star sx={{ color: '#F59E0B' }} fontSize="inherit" />}
                          emptyIcon={<StarBorder sx={{ color: '#F59E0B' }} fontSize="inherit" />}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({comment.rating}/5)
                        </Typography>
                      </Box>
                      
                      {Number(localStorage.getItem('user_id')) === comment.user_id && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteComment(comment.id)}
                          sx={{ color: '#EF4444' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    
                    <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                      {comment.text}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      By: {comment.username || 'Anonymous'} • {new Date(comment.created_at).toLocaleDateString()}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Card>
      </Box>
    </Box>
  );
}