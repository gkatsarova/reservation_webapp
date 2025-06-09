import React, { useState } from 'react';
import Navbar from './Navbar';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  Grid, 
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  ArrowBack, 
  Place, 
  Schedule, 
  LocalDining, 
  Phone, 
  Email, 
  Image
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MotionBox = motion(Box);
const MotionButton = motion(Button);

function SetMapView({ coords }) {
  const map = useMap();
  if (coords) map.setView(coords, 16);
  return null;
}

function LocationSelector({ setCoords, setFormData }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setCoords([lat, lng]);
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await resp.json();
      if (data && data.display_name) {
        setFormData((prev) => ({ ...prev, address: data.display_name }));
      }
    }
  });
  return null;
}

export default function CreateVenue({ setToken, setUserType, setUsername }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    weekdays_hours: '',
    weekend_hours: '',
    image_url: '',
    menu_image_url: '',
    type: ''
  });
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in!');
      setLoading(false);
      return;
    }
    
    try {
      const response = await apiClient.post('/venues/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Venue created successfully!');
      navigate(`/venues/${response.data.id}`);
    } catch (error) {
      alert(
        'Error creating venue: ' +
          (error.response?.data?.message || error.message)
      );
      setLoading(false);
    }
  };

  const handleAddressBlur = async () => {
    if (!formData.address) return;
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.address)}&format=json&limit=1`);
      const data = await resp.json();
      if (data && data[0]) {
        setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        setCoords(null);
        alert('Address not found on map!');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

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
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
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

          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 3, 
              p: 4,
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.1)'
            }}
          >
            <Typography 
              variant="h2" 
              fontWeight="800" 
              sx={{ 
                mb: 4,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: isMobile ? '2rem' : '2.5rem'
              }}
            >
              Create New Venue
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {/* First Column */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Venue Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <LocalDining sx={{ color: '#64748B', mr: 1 }} />
                    }}
                  />
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Venue Type *</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      label="Venue Type *"
                    >
                      <MenuItem value="">Select type</MenuItem>
                      <MenuItem value="restaurant">Restaurant</MenuItem>
                      <MenuItem value="cafe">Cafe</MenuItem>
                      <MenuItem value="bar">Bar</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label="Address *"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleAddressBlur}
                    required
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <Place sx={{ color: '#64748B', mr: 1 }} />
                    }}
                  />
                </Grid>
                
                {/* Second Column */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <Phone sx={{ color: '#64748B', mr: 1 }} />
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <Email sx={{ color: '#64748B', mr: 1 }} />
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Venue Image URL"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <Image sx={{ color: '#64748B', mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Weekdays Hours (HH:MM-HH:MM)"
                    name="weekdays_hours"
                    value={formData.weekdays_hours}
                    onChange={handleChange}
                    placeholder="e.g., 09:00-18:00"
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <Schedule sx={{ color: '#64748B', mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Weekend Hours (HH:MM-HH:MM)"
                    name="weekend_hours"
                    value={formData.weekend_hours}
                    onChange={handleChange}
                    placeholder="e.g., 10:00-22:00"
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <Schedule sx={{ color: '#64748B', mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Menu Image URL"
                    name="menu_image_url"
                    value={formData.menu_image_url}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <Image sx={{ color: '#64748B', mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                    Select Location on Map
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Click on the map to set venue location or enter address above
                  </Typography>
                  <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                    <MapContainer 
                      center={coords || [42.698334, 23.319941]} 
                      zoom={coords ? 16 : 12} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {coords && <Marker position={coords} />}
                      <SetMapView coords={coords} />
                      <LocationSelector setCoords={setCoords} setFormData={setFormData} />
                    </MapContainer>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sx={{ textAlign: 'center' }}>
                  <MotionButton
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{
                      background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
                      color: 'white',
                      fontWeight: 600,
                      px: 6,
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      minWidth: 200
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Create Venue'
                    )}
                  </MotionButton>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>
      </Box>
    </>
  );
}