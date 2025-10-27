// src/components/User/UserDashboard.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import UpdateIcon from '@mui/icons-material/Update';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

const UserDashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    ongoingEvents: 0,
  });

  const [events, setEvents] = useState([]);
  const [ongoingEvents, setOngoingEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const eventsSnap = await getDocs(collection(db, 'events'));const eventsData = eventsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          schedule: {
            ...data.schedule,
            start: data.schedule?.start?.toDate ? data.schedule.start.toDate() : null,
            end: data.schedule?.end?.toDate ? data.schedule.end.toDate() : null,
          }
        };
      });
      

      const upcoming = eventsData.filter(e => e.status==='upcoming');
      const ongoing = eventsData.filter(e => e.status==='ongoing');

      setEvents(upcoming.slice(0, 3));
      setOngoingEvents(ongoing);

      setStats(prev => ({
        ...prev,
        totalEvents: eventsData.length,
        upcomingEvents: upcoming.length,
        ongoingEvents: ongoing.length,
      }));
    };

    fetchData();
  }, []);

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome to SRM Events, your complete event management solution.
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} my={2}>
        <StatCard icon={<EventIcon color="primary" />} label="Total Events" value={stats.totalEvents} sub="+2 from last month" />
        <StatCard icon={<UpdateIcon color="secondary" />} label="Upcoming Events" value={stats.upcomingEvents} sub="Next in 3 days" />
        <StatCard icon={<UpdateIcon color="action" />} label="Ongoing Events" value={stats.ongoingEvents} sub="Live now" />
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Upcoming Events */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Upcoming Events</Typography>
              <Divider />
              {events.length === 0 && <Typography variant="body2" color="textSecondary" mt={2}>No upcoming events.</Typography>}
              {events.map((event, index) => (
                <Box key={index} display="flex" justifyContent="space-between" my={2}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">{event.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {event.schedule.start ? event.schedule.start.toLocaleString() : 'N/A'} | {event.venue}
                    </Typography>

                  </Box>
                  
                </Box>
              ))}
              <Button size="small">View All</Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Access */}
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#f3e8ff' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Quick Access</Typography>
              <Button 
                fullWidth 
                variant="contained" 
                color="primary"  
                sx={{ my: 1 }} 
                component={Link} 
                to="/polls" // Replace with the desired URL
              >
                Polls
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                color="primary" 
                component={Link} 
                to="/volunteer" // Replace with the desired URL
              >
                Apply for Volunteers
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Ongoing Events */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Ongoing Events</Typography>
              <Divider />
              {ongoingEvents.length === 0 && (
                <Typography variant="body2" color="textSecondary" mt={2}>No ongoing events right now.</Typography>
              )}
              {ongoingEvents.map((event, index) => (
                <Box key={index} display="flex" justifyContent="space-between" my={2}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">{event.title}</Typography>
                    <Typography variant="body2" color="textSecondary">{event.venue}</Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        {/* <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Recent Activity</Typography>
              <ul>
                <li>New volunteer application received - 5 minutes ago</li>
                <li>Tech Conference 2025 updated - 1 hour ago</li>
                <li>New feedback submitted - 3 hours ago</li>
              </ul>
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>
    </Box>
  );
};

const StatCard = ({ icon, label, value, sub }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          {icon}
          <Box>
            <Typography variant="subtitle2" color="textSecondary">{label}</Typography>
            <Typography variant="h6" fontWeight="bold">{value}</Typography>
            <Typography variant="caption" color="textSecondary">{sub}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

export default UserDashboard;
