import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Stack,
  Box,
  Button,
  ButtonGroup,
} from '@mui/material';
import { Link } from 'react-router-dom';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filter, setFilter] = useState('ongoing');

  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDocs(collection(db, 'events'));
      const allEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const approvedEvents = allEvents.filter(event => event.approval.status === 'approved');
      setEvents(approvedEvents);
      applyFilter(approvedEvents, filter);
    };
    fetchEvents();
  }, []);

  const applyFilter = (events, filterType) => {
    const now = new Date();

    const filtered = events.filter(event => {
      const start = event.schedule?.start?.toDate
        ? event.schedule.start.toDate()
        : new Date(event.schedule?.start);
      const end = event.schedule?.end?.toDate
        ? event.schedule.end.toDate()
        : new Date(event.schedule?.end);

      if (filterType === 'ongoing') return start <= now && end >= now;
      if (filterType === 'upcoming') return start > now;
      if (filterType === 'completed') return end < now;
      return true;
    });

    setFilteredEvents(filtered);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    applyFilter(events, newFilter);
  };

  return (
    <Box sx={{ px: 2, py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Events
      </Typography>

      {/* Filter Buttons */}
      <ButtonGroup sx={{ mb: 3 }}>
        <Button
          variant={filter === 'ongoing' ? 'contained' : 'outlined'}
          onClick={() => handleFilterChange('ongoing')}
        >
          Ongoing
        </Button>
        <Button
          variant={filter === 'upcoming' ? 'contained' : 'outlined'}
          onClick={() => handleFilterChange('upcoming')}
        >
          Upcoming
        </Button>
        <Button
          variant={filter === 'completed' ? 'contained' : 'outlined'}
          onClick={() => handleFilterChange('completed')}
        >
          Completed
        </Button>
      </ButtonGroup>

      {/* Event Cards */}
      <Grid container spacing={3}>
        {filteredEvents.map(event => {
          const startDate = event.schedule?.start?.toDate
            ? event.schedule.start.toDate()
            : new Date(event.schedule?.start);
          const endDate = event.schedule?.end?.toDate
            ? event.schedule.end.toDate()
            : new Date(event.schedule?.end);

          return (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card
                component={Link}
                to={`/events/${event.id}`}
                sx={{
                  textDecoration: 'none',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  transition: '0.3s',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: '#1976d2',
                  },
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom>
                    {event.title}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip label={event.status} color="primary" size="small" />
                    <Chip
                      label={event.category}
                      icon={<CategoryIcon />}
                      variant="outlined"
                      size="small"
                    />
                  </Stack>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    <EventIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {startDate.toLocaleString()} → {endDate.toLocaleString()}
                  </Typography>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {event.venue}
                  </Typography>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Organized by: {event.organizers?.name}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mt: 'auto',
                    }}
                  >
                    {event.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
