import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton
} from '@mui/material';
import { motion } from 'framer-motion';
import { Close } from '@mui/icons-material';
import { apiClient } from '../../../api/client';

const MotionBox = motion(Box);

export default function ReservationForm({
  venue,
  onReservationCreated,
  onClose
}) {
  const [form, setForm] = useState({
    reservation_time: '',
    party_size: 1,
    notes: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
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
      const startTime = new Date(form.reservation_time);
      const endTime = new Date(form.reservation_time);
      endTime.setHours(endTime.getHours() + 1);

      const formatDate = (date) => {
        return date.toISOString().split('.')[0];
      };

      await apiClient.post('/reservations/', {
        venue_id: venue.id,
        start_time: formatDate(startTime),
        end_time: formatDate(endTime),
        party_size: Number(form.party_size),
        notes: form.notes
      });
      alert('Reservation created!');
      onReservationCreated();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating reservation');
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: '#F8FAFC' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Make a Reservation</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="datetime-local"
            name="reservation_time"
            value={form.reservation_time}
            onChange={handleChange}
            label="Reservation Time"
            required
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            type="number"
            name="party_size"
            value={form.party_size}
            onChange={handleChange}
            label="Party Size"
            required
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            name="notes"
            value={form.notes}
            onChange={handleChange}
            label="Additional Notes"
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)'
              }
            }}
          >
            Make Reservation
          </Button>
        </Box>
      </Paper>
    </MotionBox>
  );
}

ReservationForm.propTypes = {
  venue: PropTypes.shape({
    id: PropTypes.number.isRequired,
    weekdays_hours: PropTypes.string.isRequired,
    weekend_hours: PropTypes.string.isRequired
  }).isRequired,
  onReservationCreated: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}; 