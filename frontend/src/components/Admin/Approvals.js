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
  Divider,
  Chip,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Box
} from '@mui/material';

export default function AdminApprovals() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const fetchApprovals = async () => {
    if (!user) return;

    try {
      const [eventsSnap, venuesSnap, accSnap] = await Promise.all([
        getDocs(query(collection(db, 'events'), where('approval.approvedBy', '==', user.email))),
        getDocs(query(collection(db, 'venueBookings'), where('venueApproval.approvedBy', '==', user.email))),
        getDocs(query(collection(db, 'accommodationRequests'), where('approval.approvedBy', '==', user.email))),
      ]);

      setEvents(eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setVenues(venuesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setAccommodations(accSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [user]);

  if (user?.role !== 'admin') return <Typography>Admin access required</Typography>;
  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  const renderCard = (item, type) => {
    const approvalData =
      type === 'venue' ? item.venueApproval :
      item.approval;

    return (
      <Card key={item.id} sx={{ mb: 2, borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {item.title || item.venueName || item.requestTitle || 'Untitled'}
          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>
            {item.description || item.reason || 'No description available.'}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Chip
            label={`Status: ${approvalData?.status}`}
            color={approvalData?.status === 'approved' ? 'success' : 'error'}
            size="small"
            sx={{ mr: 1 }}
          />

          {approvalData?.approvedAt && (
            <Typography variant="caption" color="textSecondary">
              Approved At: {new Date(approvalData.approvedAt).toLocaleString()}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Approvals
      </Typography>

      <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)} sx={{ mb: 3 }}>
        <Tab label="Events" />
        <Tab label="Venues" />
        <Tab label="Accommodation" />
      </Tabs>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          {tab === 0 && (
            events.length === 0
              ? <NoData type="events" />
              : events.map(e => renderCard(e, 'event'))
          )}
          {tab === 1 && (
            venues.length === 0
              ? <NoData type="venues" />
              : venues.map(v => renderCard(v, 'venue'))
          )}
          {tab === 2 && (
            accommodations.length === 0
              ? <NoData type="accommodations" />
              : accommodations.map(a => renderCard(a, 'accommodation'))
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

function NoData({ type }) {
  return (
    <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
      <Typography variant="h6" color="textSecondary">
        No {type} approved/rejected by you yet.
      </Typography>
    </Paper>
  );
}
