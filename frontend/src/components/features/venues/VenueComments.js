import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Rating,
  IconButton
} from '@mui/material';
import { motion } from 'framer-motion';
import { Delete, Star, StarBorder } from '@mui/icons-material';
import { apiClient } from '../../../api/client';

const MotionBox = motion(Box);

export default function VenueComments({
  comments,
  venueId,
  isCustomer,
  isOwner,
  onCommentAdded,
  onCommentDeleted
}) {
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { text: newComment };
      if (isCustomer && !isOwner) {
        payload.rating = newRating;
      }
      await apiClient.post(`/venues/${venueId}/comments`, payload);
      setNewComment('');
      setNewRating(5);
      onCommentAdded();
    } catch (error) {
      alert('Error submitting comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await apiClient.delete(`/venues/${venueId}/comments/${commentId}`);
      onCommentDeleted();
    } catch (error) {
      alert('Error deleting comment');
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: '#F8FAFC' }}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>

        {(isCustomer || isOwner) && (
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              sx={{ mb: 2 }}
            />
            {isCustomer && !isOwner && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating
                  value={newRating}
                  onChange={(_, value) => setNewRating(value)}
                  icon={<Star sx={{ color: '#F59E0B' }} />}
                  emptyIcon={<StarBorder sx={{ color: '#F59E0B' }} />}
                />
              </Box>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={!newComment.trim()}
              sx={{
                background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)'
                }
              }}
            >
              Post Comment
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {comments.map((comment) => (
            <Paper
              key={comment.id}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'white',
                position: 'relative'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {comment.username}
                </Typography>
                {(isOwner || comment.user_id === Number(localStorage.getItem('user_id'))) && (
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteComment(comment.id)}
                    sx={{ color: 'error.main' }}
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>
              {comment.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating
                    value={comment.rating}
                    readOnly
                    size="small"
                    icon={<Star sx={{ color: '#F59E0B' }} />}
                    emptyIcon={<StarBorder sx={{ color: '#F59E0B' }} />}
                  />
                </Box>
              )}
              <Typography variant="body1" color="text.secondary">
                {comment.text}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
    </MotionBox>
  );
}

VenueComments.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      rating: PropTypes.number,
      username: PropTypes.string.isRequired,
      user_id: PropTypes.number.isRequired
    })
  ).isRequired,
  venueId: PropTypes.number.isRequired,
  isCustomer: PropTypes.bool.isRequired,
  isOwner: PropTypes.bool.isRequired,
  onCommentAdded: PropTypes.func.isRequired,
  onCommentDeleted: PropTypes.func.isRequired
}; 