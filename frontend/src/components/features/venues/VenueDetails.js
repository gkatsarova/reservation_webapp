import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { apiClient } from '../../../api/client';
import VenueHeader from './VenueHeader';
import VenueMap from './VenueMap';
import VenueComments from './VenueComments';
import ReservationForm from './ReservationForm';
import ConfirmDeleteDialog from '../../common/ConfirmDeleteDialog';

const MotionButton = motion(Button);

export default function VenueDetails({ setToken, setUserType, setUsername }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [comments, setComments] = useState([]);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);

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

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/venues/${id}`);
      alert('Venue deleted');
      navigate('/venues');
    } catch (error) {
      alert('Error deleting venue');
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
          onClick={() => navigate('/venues')}
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
  const averageRating = comments.reduce((acc, comment) => acc + (comment.rating || 0), 0) / 
    (comments.filter(comment => comment.rating).length || 1);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <VenueHeader
        venue={venue}
        isOwner={isOwner}
        onDeleteClick={() => setDeleteDialogOpen(true)}
        averageRating={averageRating}
      />

      <Box sx={{ mt: 4 }}>
        <VenueMap coords={coords} venueName={venue.name} />
      </Box>

      {isCustomer && !isOwner && (
        <Box sx={{ mt: 4 }}>
          {showReservationForm ? (
            <ReservationForm
              venue={venue}
              onReservationCreated={() => setShowReservationForm(false)}
              onClose={() => setShowReservationForm(false)}
            />
          ) : (
            <MotionButton
              variant="contained"
              onClick={() => setShowReservationForm(true)}
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
              Make a Reservation
            </MotionButton>
          )}
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <VenueComments
          comments={comments}
          venueId={Number(id)}
          isCustomer={isCustomer}
          isOwner={isOwner}
          onCommentAdded={fetchComments}
          onCommentDeleted={fetchComments}
        />
      </Box>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Venue"
        text="Are you sure you want to delete this venue? This action cannot be undone!"
      />
    </Box>
  );
} 