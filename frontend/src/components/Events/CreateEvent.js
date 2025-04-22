// src/components/Events/CreateEvent.js
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Container,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  MenuItem,
  Box
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const categories = ['Workshop', 'Seminar', 'Fest', 'Meetup', 'Sports'];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    venue: '',
    category: '',
    approvalRequired: true,
    feedbackEnabled: true,
    attendanceEnabled: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!auth.currentUser) throw new Error('Authentication required');
      if (!formData.title.trim()) throw new Error('Event title is required');
      if (formData.endDate < formData.startDate) throw new Error('End date cannot be before start date');

      const eventData = {
        title: formData.title,
        description: formData.description,
        schedule: {
          start: Timestamp.fromDate(new Date(formData.startDate)),
          end: Timestamp.fromDate(new Date(formData.endDate)),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        venue: formData.venue,
        category: formData.category,
        organizers: {
          name: auth.currentUser.displayName || '',
          email: auth.currentUser.email || '',
          userId: auth.currentUser.uid
        },
        approval: {
          required: formData.approvalRequired,
          status: formData.approvalRequired ? 'pending' : 'approved'
        },
        feedback: {
          enabled: formData.feedbackEnabled
        },
        attendanceTracking: formData.attendanceEnabled,
        status: 'upcoming'
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);
      navigate(`/events/${docRef.id}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>Create New Event</Typography>

          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>

              <TextField
                label="Event Title"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />

              <TextField
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Date & Time"
                  value={formData.startDate}
                  onChange={(newValue) => handleChange('startDate', newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="End Date & Time"
                  value={formData.endDate}
                  onChange={(newValue) => handleChange('endDate', newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>

              <TextField
                label="Venue Details"
                placeholder="Enter venue name or details..."
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
              />

              <TextField
                select
                label="Category"
                required
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {categories.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.approvalRequired}
                    onChange={(e) => handleChange('approvalRequired', e.target.checked)}
                  />
                }
                label="Requires Admin Approval"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.feedbackEnabled}
                    onChange={(e) => handleChange('feedbackEnabled', e.target.checked)}
                  />
                }
                label="Enable Feedback Collection"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.attendanceEnabled}
                    onChange={(e) => handleChange('attendanceEnabled', e.target.checked)}
                  />
                }
                label="Track Attendance"
              />

              {error && (
                <Typography color="error">{error}</Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Event'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
