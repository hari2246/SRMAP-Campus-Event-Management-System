// src/pages/AdminBookingApprovalPage.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Box, Typography, Card, CardContent, Button, Grid
} from '@mui/material';

const AccommodationApprovals = () => {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const snap = await getDocs(collection(db, 'accommodationBookings'));
    setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAction = async (id, action) => {
    await updateDoc(doc(db, 'accommodationBookings', id), {
      status: action,
    });
    fetchBookings();
  };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>Booking Approvals</Typography>
      {bookings.filter(b => b.status === 'pending').map((b) => (
        <Card key={b.id} sx={{ my: 2 }}>
          <CardContent>
            <Typography><strong>Organiser:</strong> {b.organiser}</Typography>
            <Typography><strong>Room:</strong> {b.name}</Typography>
            <Typography><strong>Check In:</strong> {b.checkIn.toDate().toLocaleString()}</Typography>
            <Typography><strong>Check Out:</strong> {b.checkOut.toDate().toLocaleString()}</Typography>
            <Grid container spacing={2} mt={1}>
              <Grid item>
                <Button variant="contained" color="success" onClick={() => handleAction(b.id, 'approved')}>Approve</Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="error" onClick={() => handleAction(b.id, 'rejected')}>Reject</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default AccommodationApprovals;
