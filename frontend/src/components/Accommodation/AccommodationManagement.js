import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Divider
} from '@mui/material';

const AccommodationManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    capacity: ''
  });

  const fetchRooms = async () => {
    const snap = await getDocs(collection(db, 'accommodation_rooms'));
    setRooms(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.capacity) return;

    await addDoc(collection(db, 'accommodation_rooms'), {
      ...formData,
      capacity: parseInt(formData.capacity),
      createdAt: serverTimestamp()
    });

    setFormData({ name: '', capacity: '' });
    fetchRooms();
  };

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* Form Section */}
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 800 }}>
        <Typography variant="h4" textAlign="center" color="primary" gutterBottom>
          Add Accommodation Room
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Room Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" color="primary" size="large">
                Add Room
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Room Display Section - Column Wise */}
      <Box sx={{ width: '100%', maxWidth: 800 }}>
        <Typography variant="h5" color="primary" textAlign="center" gutterBottom>
          Existing Rooms 🏨
        </Typography>

        {rooms.length === 0 ? (
          <Paper elevation={1} sx={{ p: 3, mt: 2 }}>
            <Typography textAlign="center" color="text.secondary">
              No rooms added yet.
            </Typography>
          </Paper>
        ) : (
          rooms.map((room, index) => (
            <Paper key={room.id || index} elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" color="secondary">
                {room.name}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1">
                <strong>Capacity:</strong> {room.capacity}
              </Typography>
              {room.createdAt && (
                <Typography variant="body2" color="text.secondary">
                  Created At: {room.createdAt.toDate?.().toLocaleString?.() || 'N/A'}
                </Typography>
              )}
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
};

export default AccommodationManagement;
