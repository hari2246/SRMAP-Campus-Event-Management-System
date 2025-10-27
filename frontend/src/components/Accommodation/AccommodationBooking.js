import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  query,
  where
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  MenuItem,
  Select,
  TextField,
  Divider
} from '@mui/material';

const AccommodationBooking = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
      fetchUserBookings(user.email);
    } else {
      console.error('User not authenticated');
    }

    const fetchRooms = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'accommodation_rooms'));
        setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      }
    };

    fetchRooms();
  }, []);

  const fetchUserBookings = async (email) => {
    try {
      const q = query(
        collection(db, 'accommodationBookings'),
        where('organiser', '==', email)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    }
  };

  const getRoomName = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.name : 'Unknown Room';
  };

  const handleBooking = async () => {
    if (!userEmail || !selectedRoom || !checkIn || !checkOut) {
      alert('Please fill all the fields.');
      return;
    }

    try {
      await addDoc(collection(db, 'accommodationBookings'), {
        organiser: userEmail,
        roomId: selectedRoom,
        checkIn: Timestamp.fromDate(new Date(checkIn)),
        checkOut: Timestamp.fromDate(new Date(checkOut)),
        status: 'pending',
        createdAt: Timestamp.now(),
      });

      alert('Booking request submitted!');
      setSelectedRoom('');
      setCheckIn('');
      setCheckOut('');
      fetchUserBookings(userEmail); // Refresh bookings
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Booking failed. Please try again.');
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>Book Accommodation</Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Select
            fullWidth
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            displayEmpty
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>Select a Room</MenuItem>
            {rooms.map((room) => (
              <MenuItem key={room.id} value={room.id}>
                {room.name} - Capacity: {room.capacity}
              </MenuItem>
            ))}
          </Select>
          <TextField
            fullWidth
            margin="normal"
            type="datetime-local"
            label="Check In"
            InputLabelProps={{ shrink: true }}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            type="datetime-local"
            label="Check Out"
            InputLabelProps={{ shrink: true }}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleBooking}
          >
            Submit Booking
          </Button>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>Your Bookings</Typography>
      {bookings.length === 0 ? (
        <Typography>No bookings found.</Typography>
      ) : (
        bookings.map((booking) => (
          <Card key={booking.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1">
                <strong>Room:</strong> {getRoomName(booking.roomId)}
              </Typography>
              <Typography>
                <strong>Check-in:</strong>{' '}
                {booking.checkIn.toDate().toLocaleString()}
              </Typography>
              <Typography>
                <strong>Check-out:</strong>{' '}
                {booking.checkOut.toDate().toLocaleString()}
              </Typography>
              <Typography>
                <strong>Status:</strong> {booking.status}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default AccommodationBooking;
