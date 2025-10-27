import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  Paper,
  Stack
} from '@mui/material';
import { doc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

const categories = ['Workshop', 'Seminar', 'Fest', 'Meetup', 'Sports'];

export default function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    venue: '',
    category: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEventData({
            title: data.title || '',
            description: data.description || '',
            startDate: data.schedule?.start?.toDate()?.toISOString().split('T')[0] || '',
            endDate: data.schedule?.end?.toDate()?.toISOString().split('T')[0] || '',
            venue: data.venue || '',
            category: data.category || ''
          });
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        setError('Failed to fetch event data.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const docRef = doc(db, 'events', eventId);
      await updateDoc(docRef, {
        title: eventData.title,
        description: eventData.description,
        venue: eventData.venue,
        category: eventData.category,
        schedule: {
          start: Timestamp.fromDate(new Date(eventData.startDate)),
          end: Timestamp.fromDate(new Date(eventData.endDate)),
          updatedAt: serverTimestamp()
        }
      });
      alert('Event updated successfully!');
      navigate(`/events/${eventId}`);
    } catch (err) {
      alert('Failed to update event: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button component={Link} to="/events" sx={{ mt: 2 }}>
          Back to Events
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Edit Event</Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Title"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={eventData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
              required
            />
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={eventData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={eventData.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Venue"
              name="venue"
              value={eventData.venue}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              select
              label="Category"
              name="category"
              value={eventData.category}
              onChange={handleChange}
              fullWidth
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>

            <Button
              component={Link}
              to={`/events/${eventId}`}
              variant="outlined"
            >
              Cancel
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
