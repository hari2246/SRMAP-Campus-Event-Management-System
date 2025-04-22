// src/components/Venue/VenueBooking.js
import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, TextField, MenuItem,
  FormControl, InputLabel, Select, Checkbox,
  FormControlLabel, Button, CircularProgress, ListItemText, Card, CardContent,Box
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  collection, getDocs, addDoc, serverTimestamp, updateDoc, doc,
  query, where
} from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function VenueBooking() {
  const [user] = useAuthState(auth);

  const [venues, setVenues] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchCapacity, setSearchCapacity] = useState('');
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [fromDateTime, setFromDateTime] = useState(new Date());
  const [toDateTime, setToDateTime] = useState(new Date());
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'venues'));
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(venue => venue.status === 'available');
        setVenues(list);
        setFilteredVenues(list);
      } catch (err) {
        console.error(err);
        setError('Failed to load venues');
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  useEffect(() => {
    const filtered = venues.filter(v =>
      (!searchName || v.venueName?.toLowerCase().includes(searchName.toLowerCase())) &&
      (!searchCapacity || v.capacity >= parseInt(searchCapacity))
    );
    setFilteredVenues(filtered);
  }, [searchName, searchCapacity, venues]);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user) return;

      try {
        const bookingsRef = collection(db, 'venueBookings');
        const q = query(bookingsRef, where('bookedBy.email', '==', user.email));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserBookings(list);
      } catch (err) {
        console.error('Error fetching user bookings:', err);
      }
    };

    fetchUserBookings();
  }, [user]);

  const handleBooking = async () => {
    try {
      if (!user) throw new Error('You must be logged in to book.');
      if (!selectedVenueId) throw new Error('Please select a venue.');
      if (!eventTitle.trim()) throw new Error('Please enter event title.');
      if (!fromDateTime || !toDateTime) throw new Error('Please select both From and To times.');

      const selectedVenue = venues.find(v => v.id === selectedVenueId);
      if (!selectedVenue) throw new Error('Selected venue not found.');

      const bookingData = {
        title: eventTitle,
        venueId: selectedVenue.id,
        venueName: selectedVenue.venueName,
        capacity: selectedVenue.capacity,
        location: selectedVenue.location,
        from: fromDateTime,
        to: toDateTime,
        bookedBy: {
          name: user.displayName,
          email: user.email,
          uid: user.uid
        },
        venueApproval: {
          status: approvalRequired ? 'pending' : 'approved',
          requestedAt: new Date()
        },
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'venueBookings'), bookingData);

      await updateDoc(doc(db, 'venues', selectedVenue.id), {
        status: approvalRequired ? 'pending' : 'booked'
      });

      alert(`Venue booked ${approvalRequired ? 'with pending approval.' : 'successfully and approved!'}`);

      // Reset
      setSelectedVenueId('');
      setEventTitle('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Booking Form */}
      <Card sx={{ p: 4, boxShadow: 6, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <Typography variant="h4" gutterBottom>Book a Venue</Typography>
  
        {loading ? <CircularProgress /> : (
          <Grid container spacing={3}>
            {/* Event title */}
            <Grid item xs={12}>
              <TextField
                label="Event Title"
                fullWidth
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </Grid>
  
            {/* Search filters */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Search by Venue Name"
                fullWidth
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Minimum Capacity"
                type="number"
                fullWidth
                value={searchCapacity}
                onChange={(e) => setSearchCapacity(e.target.value)}
              />
            </Grid>
  
            {/* Venue selection */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Venue</InputLabel>
                <Select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  label="Select Venue"
                  displayEmpty
                  renderValue={(selectedId) => {
                    if (!selectedId) {
                      return <em>Select Venue</em>; // Placeholder when no venue selected
                    }
                    const venue = filteredVenues.find(v => v.id === selectedId);
                    return venue
                      ? `${venue.venueName} (${venue.capacity} • ${venue.location})`
                      : <em>Select Venue</em>;
                  }}
                >
                  {filteredVenues.map((venue) => (
                    <MenuItem key={venue.id} value={venue.id}>
                      <ListItemText
                        primary={venue.venueName}
                        secondary={`${venue.capacity} people • ${venue.location}`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
  
            {/* Date/Time */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="From Date & Time"
                  value={fromDateTime}
                  onChange={setFromDateTime}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="To Date & Time"
                  value={toDateTime}
                  onChange={setToDateTime}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                />
              </Grid>
            </LocalizationProvider>
  
            {/* Approval toggle */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={approvalRequired}
                    onChange={(e) => setApprovalRequired(e.target.checked)}
                  />
                }
                label="Requires Admin Approval"
              />
            </Grid>
  
            {/* Submit */}
            <Grid item xs={12}>
              <Button variant="contained" fullWidth onClick={handleBooking}>
                Submit Booking
              </Button>
            </Grid>
  
            {error && (
              <Grid item xs={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Card>
  
      {/* Booking List */}
      {userBookings.length > 0 && (
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>Your Venue Booking Requests</Typography>
          <Grid container spacing={2}>
            {userBookings.map((booking) => (
              <Grid item xs={12} sm={6} md={4} key={booking.id}>
                <Card sx={{ height: '100%', p: 2, backgroundColor: '#f9f9f9' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">{booking.title}</Typography>
                    <Typography variant="body2">
                      {booking.venueName} • {booking.capacity} people
                    </Typography>
                    <Typography variant="body2">{booking.location}</Typography>
                    <Typography variant="body2">
                      From: {new Date(booking.from.seconds * 1000).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      To: {new Date(booking.to.seconds * 1000).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      Status: {booking.venueApproval.status}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
  
}
