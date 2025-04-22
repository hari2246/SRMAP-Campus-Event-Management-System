import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import {
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function MyEvents() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'events'),
          where('organizers.userId', '==', user.uid)
        );

        const snapshot = await getDocs(q);

        const events = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          title: doc.data().title || 'Untitled Event',
          description: doc.data().description || '',
          status: doc.data().status || 'unknown',
          category: doc.data().category || '',
          startDate: doc.data().schedule?.start,
          endDate: doc.data().schedule?.end,
        }));

        setMyEvents(events);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [user]);

  if (!user) return <Typography>Please login to view your events.</Typography>;
  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Events
      </Typography>

      <Grid container spacing={3} sx={{ p: 3 }}>
        {myEvents.length === 0 ? (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
              <Typography variant="h6" color="textSecondary">
                You haven't created any events yet.
              </Typography>
            </Paper>
          </Grid>
        ) : (
          myEvents.map(event => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card
                onClick={() => navigate(`/events/${event.id}`)}
                sx={{
                  borderRadius: 4,
                  boxShadow: 2,
                  cursor: 'pointer',
                  transition: '0.3s',
                  '&:hover': { boxShadow: 6, transform: 'scale(1.02)' },
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {event.description.length > 100
                      ? event.description.slice(0, 100) + '...'
                      : event.description}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2">
                    Category: {event.category || 'General'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {event.startDate
                      ? `Starts: ${new Date(
                          event.startDate?.toDate?.() ||
                          event.startDate?.seconds * 1000
                        ).toLocaleDateString()}`
                      : 'No start date'}
                  </Typography>
                  <Chip
                    label={`Status: ${event.status}`}
                    size="small"
                    color={
                      event.status === 'upcoming'
                        ? 'info'
                        : event.status === 'ongoing'
                        ? 'warning'
                        : event.status === 'completed'
                        ? 'success'
                        : 'default'
                    }
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </>
  );
}
