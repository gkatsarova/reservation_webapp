import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  IconButton,
  Rating,
  Chip
} from '@mui/material';
import { 
  ArrowBack, 
  Delete, 
  Schedule, 
  Star, 
  StarBorder,
  Phone,
  Email
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MotionBox = motion(Box);

export default function VenueHeader({ 
  venue, 
  isOwner, 
  onDeleteClick,
  averageRating 
}) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ position: 'relative', mb: 4 }}>
        <CardMedia
          component="img"
          height="400"
          image={venue.image_url}
          alt={venue.name}
          sx={{
            objectFit: 'cover',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            width: '100%',
            height: '400px',
            backgroundColor: '#f8fafc'
          }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/800x400?text=No+Image+Available';
          }}
        />
        <IconButton
          component={Link}
          to="/venues"
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            bgcolor: 'white',
            '&:hover': { bgcolor: 'white' }
          }}
        >
          <ArrowBack />
        </IconButton>
        {isOwner && (
          <IconButton
            onClick={onDeleteClick}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'white',
              color: 'error.main',
              '&:hover': { bgcolor: 'white' }
            }}
          >
            <Delete />
          </IconButton>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {venue.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating
              value={averageRating}
              readOnly
              precision={0.5}
              icon={<Star sx={{ color: '#F59E0B' }} />}
              emptyIcon={<StarBorder sx={{ color: '#F59E0B' }} />}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({averageRating.toFixed(1)})
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" paragraph>
            {venue.description}
          </Typography>

          {venue.menu_image_url && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Menu
              </Typography>
              <CardMedia
                component="img"
                image={venue.menu_image_url}
                alt="Menu"
                sx={{
                  objectFit: 'contain',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  width: '100%',
                  maxHeight: '600px',
                  backgroundColor: '#f8fafc'
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x600?text=Menu+Not+Available';
                }}
              />
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ color: '#6366F1', mr: 1 }} />
                <Typography variant="body1">
                  {venue.weekdays_hours} (Weekdays)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ color: '#6366F1', mr: 1 }} />
                <Typography variant="body1">
                  {venue.weekend_hours} (Weekend)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Phone sx={{ color: '#6366F1', mr: 1 }} />
                <Typography variant="body1">
                  {venue.phone}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ color: '#6366F1', mr: 1 }} />
                <Typography variant="body1">
                  {venue.email}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MotionBox>
  );
}

VenueHeader.propTypes = {
  venue: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image_url: PropTypes.string.isRequired,
    weekdays_hours: PropTypes.string.isRequired,
    weekend_hours: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }).isRequired,
  isOwner: PropTypes.bool.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  averageRating: PropTypes.number.isRequired
}; 