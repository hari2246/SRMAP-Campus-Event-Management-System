import React, { useEffect, useState } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Divider,
  Stack
} from '@mui/material';
import { FaUsers, FaCalendarAlt, FaClipboardCheck, FaDoorOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Import Link for routing

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    approvals: 0,
    venueRequests: 0,
  });

  const [pendingItems, setPendingItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const eventsSnap = await getDocs(collection(db, 'events'));

      const venueQuery = query(collection(db, 'venueBookings'), where('approval', '==', 'pending'));
      const venueSnap = await getDocs(venueQuery);

      // Filter events that are pending approval
      const eventsQuery = query(collection(db, 'events'), where('approval', '==', 'pending'));
      const eventsApprovalSnap = await getDocs(eventsQuery);

      setStats({
        users: usersSnap.size,
        events: eventsSnap.size,
        approvals: eventsApprovalSnap.size,
        venueRequests: venueSnap.size,
      });

      // Fetch pending items (events, venue requests)
      const pendingEventsQuery = query(collection(db, 'events'), where('approval.status', '==', 'pending'));
      const venueRequestsQuery = query(collection(db, 'venueBookings'), where('approval', '==', 'pending'));

      const pendingEventsSnap = await getDocs(pendingEventsQuery);
      const venueRequestsSnap = await getDocs(venueRequestsQuery);

      const pendingActions = [
        ...pendingEventsSnap.docs.map(doc => ({ title: `Event approval: ${doc.data().name}` })),
        ...venueRequestsSnap.docs.map(doc => ({ title: `Venue request: ${doc.data().name}` })),
      ];

      setPendingItems(pendingActions);
    };

    fetchData();
  }, []);

  const quickActions = [
    { title: 'Event Approvals', link: '/event/approvals' },
    { title: 'Venue Bookings', link: '/venue/approval' },
  ];

  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<FaUsers />} title="Total Users" count={stats.users} sub="+12 from last week" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<FaCalendarAlt />} title="Events" count={stats.events} sub="+2 from last month" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<FaClipboardCheck />} title="Pending Approvals" count={stats.approvals} sub="Requires attention" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<FaDoorOpen />} title="Venue Requests" count={stats.venueRequests} sub="Awaiting confirmation" />
        </Grid>
      </Grid>

      {/* Pending + Quick Actions */}
      <Grid container spacing={3}>
        {/* Pending Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Pending Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              {pendingItems.length === 0 ? (
                <Typography>No pending applications</Typography>
              ) : (
                pendingItems.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>{item.title}</Typography>
                    <Button variant="outlined" size="small">Review</Button>
                  </Box>
                ))
              )}
            </Stack>
            <Box sx={{ mt: 2 }}>
              <Button variant="text">View All Pending Items</Button>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {quickActions.map((action, i) => (
                <Grid item xs={6} key={i}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    component={Link} // Use Link component to route
                    to={action.link}
                  >
                    {action.title}
                  </Button>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" color="primary" fullWidth>
                Generate Reports
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function StatCard({ icon, title, count, sub }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ fontSize: 30, color: 'primary.main' }}>{icon}</Box>
      <Typography variant="subtitle1">{title}</Typography>
      <Typography variant="h5" fontWeight="bold">{count}</Typography>
      <Typography variant="caption" color="text.secondary">{sub}</Typography>
    </Paper>
  );
}
