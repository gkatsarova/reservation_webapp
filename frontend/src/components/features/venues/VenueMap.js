import React from 'react';
import PropTypes from 'prop-types';
import { Box, Paper, Typography } from '@mui/material';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MotionBox = motion(Box);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function VenueMap({ coords, venueName }) {
  if (!coords) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          bgcolor: '#F8FAFC',
          textAlign: 'center'
        }}
      >
        <Typography color="text.secondary">
          No location information available
        </Typography>
      </Paper>
    );
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          bgcolor: '#F8FAFC',
          overflow: 'hidden'
        }}
      >
        <Typography variant="h6" gutterBottom>
          Location
        </Typography>
        <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden' }}>
          <MapContainer
            center={coords}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={coords} />
          </MapContainer>
        </Box>
      </Paper>
    </MotionBox>
  );
}

VenueMap.propTypes = {
  coords: PropTypes.arrayOf(PropTypes.number),
  venueName: PropTypes.string.isRequired
}; 