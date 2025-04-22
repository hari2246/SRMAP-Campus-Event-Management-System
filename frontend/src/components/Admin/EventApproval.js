import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Box,
  Stack,
  Divider,
  CircularProgress,
  Paper,
} from '@mui/material';

export default function EventApproval() {
  const { user } = useAuth();
  const [pendingEvents, setPendingEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch events that are pending approval
  useEffect(() => {
    const fetchPendingEvents = async () => {
      const snapshot = await getDocs(collection(db, 'events'));

      const pending = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(event => event.approval?.status === 'pending');

      const eventsWithOrganizerData = pending.map(event => ({
        ...event,
        status: event.status || 'upcoming',
        title: event.title || 'Untitled Event',
        description: event.description || '',
        organizerDetails: {
          name: event.organizers?.name || 'Unknown',
          email: event.organizers?.email || 'N/A',
        },
        startDate: event.schedule?.start,
        endDate: event.schedule?.end,
      }));

      setPendingEvents(eventsWithOrganizerData);
      setLoading(false);
    };

    fetchPendingEvents();
  }, []);

  // Update event status (upcoming, ongoing, completed)
  const updateEventStatus = async (event) => {
    const currentTime = new Date();

    const startTime =
      event.schedule?.start?.toDate?.() ||
      (event.schedule?.start?.seconds && new Date(event.schedule.start.seconds * 1000));
    const endTime =
      event.schedule?.end?.toDate?.() ||
      (event.schedule?.end?.seconds && new Date(event.schedule.end.seconds * 1000));

    if (!startTime || !endTime) {
      console.warn('Invalid schedule data for event:', event.id);
      return;
    }

    let newStatus = 'upcoming';
    if (currentTime >= startTime && currentTime <= endTime) {
      newStatus = 'ongoing';
    } else if (currentTime > endTime) {
      newStatus = 'completed';
    }

    if (newStatus !== event.status) {
      await updateDoc(doc(db, 'events', event.id), {
        status: newStatus,
        'schedule.updatedAt': new Date().toISOString(),
      });
    }
  };

  // Update statuses regularly
  useEffect(() => {
    if (pendingEvents.length === 0) return;

    pendingEvents.forEach(updateEventStatus);

    const intervalId = setInterval(() => {
      pendingEvents.forEach(updateEventStatus);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [pendingEvents]);

  // Approve or Reject event
  const handleApproval = async (eventId, status) => {
    try {
      const event = pendingEvents.find(e => e.id === eventId);

      await updateDoc(doc(db, 'events', eventId), {
        'approval.status': status,
        'approval.approvedAt': new Date().toISOString(),
      });

      setPendingEvents(prev => prev.filter(event => event.id !== eventId));
      setSelectedEvent(null);
    } catch (error) {
      console.error('Approval error:', error);
    }
  };

  const handleEventClick = (event) => setSelectedEvent(event);
  const handleBackToList = () => setSelectedEvent(null);

  if (user?.role !== 'admin') return <Typography>Admin access required</Typography>;
  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      
      {selectedEvent ? (
        <>
        <Grid item xs={12}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h5" gutterBottom>
              {selectedEvent.title}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Chip label={`Status: ${selectedEvent.status}`} color="warning" />
              {selectedEvent.category && <Chip label={selectedEvent.category} />}
              {selectedEvent.startDate && (
                <Chip
                  label={new Date(
                    selectedEvent.startDate?.toDate?.() ||
                    selectedEvent.startDate?.seconds * 1000
                  ).toLocaleDateString()}
                />
              )}
            </Stack>

            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedEvent.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1">Organizer Information</Typography>
            <Typography variant="body2">
              <strong>Name:</strong> {selectedEvent.organizerDetails?.name || 'N/A'} <br />
              <strong>Email:</strong> {selectedEvent.organizerDetails?.email || 'N/A'}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleApproval(selectedEvent.id, 'approved')}
                sx={{ mr: 2 }}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleApproval(selectedEvent.id, 'rejected')}
              >
                Reject
              </Button>
              <Button onClick={handleBackToList} sx={{ ml: 2 }}>
                Back to List
              </Button>
            </Box>
          </Paper>
        </Grid>
        </>
        
      ) : (
        <>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              Pending Event Approvals
            </Typography>
          </Grid>

          <Grid item xs={12}>
            {pendingEvents.length === 0 ? (
              <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
                <Typography variant="h6" color="textSecondary">
                  No events require approval at the moment.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {pendingEvents.map(event => (
                  <Grid item xs={12} sm={6} md={4} key={event.id}>
                    <Card
                      onClick={() => handleEventClick(event)}
                      sx={{
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        boxShadow: 2,
                        transition: '0.3s',
                        '&:hover': { boxShadow: 6 },
                        cursor: 'pointer',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6">{event.title}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {event.description.length > 100
                            ? event.description.slice(0, 100) + '...'
                            : event.description}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                          Organizer: {event.organizerDetails?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {event.organizerDetails?.email}
                        </Typography>
                        <Chip
                          label={`Status: ${event.status}`}
                          size="small"
                          color="warning"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Grid>
  );
}
