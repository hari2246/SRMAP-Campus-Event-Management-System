// src/components/Admin/VenueApproval.js
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import { db, auth } from '../../services/firebase';

export default function VenueApproval() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingVenueApprovals = async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(
        collection(db, 'venueBookings'),
        where('venueApproval.status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      const pending = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPendingBookings(pending);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pending approvals.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (bookingId, action) => {
    try {
      const bookingRef = doc(db, 'venueBookings', bookingId);
      await updateDoc(bookingRef, {
        'venueApproval.status': action,
        'venueApproval.reviewedAt': new Date(),
        'venueApproval.reviewedBy': auth.currentUser?.email || 'admin'
      });

      // Optional: update venue status too
      if (action === 'approved' || action === 'rejected') {
        const approvedBooking = pendingBookings.find(b => b.id === bookingId);
        if (approvedBooking?.venueId) {
          await updateDoc(doc(db, 'venues', approvedBooking.venueId), {
            status: action === 'approved' ? 'booked' : 'available'
          });
        }
      }

      fetchPendingVenueApprovals();
    } catch (err) {
      console.error(err);
      setError('Failed to update approval status.');
    }
  };

  useEffect(() => {
    fetchPendingVenueApprovals();
  }, []);

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Venue Approval Panel</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {pendingBookings.length === 0 ? (
        <Typography>No pending venue approvals.</Typography>
      ) : (
        <Grid container spacing={3}>
          {pendingBookings.map(booking => (
            <Grid item xs={12} md={6} key={booking.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{booking.title}</Typography>
                  <Typography variant="body2">
                    <strong>Venue:</strong> {booking.venueName}<br />
                    <strong>Capacity:</strong> {booking.capacity}<br />
                    <strong>Location:</strong> {booking.location}
                  </Typography>
                  <Typography variant="caption">
                    Requested By: {booking.bookedBy?.email}
                  </Typography>

                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleApprovalAction(booking.id, 'approved')}
                      >
                        Approve
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleApprovalAction(booking.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
