import React, { useState } from 'react';
import { TextField, Rating, Button, Box, Alert, Typography } from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';

export default function FeedbackForm({ eventId, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      await addDoc(collection(db, 'feedback'), {
        eventId,
        userId: user.uid,
        email: user.email,
        rating,
        comment,
        timestamp: new Date()
      });

      onSubmit();
      setShowForm(false);
    } catch (err) {
      setError('Failed to submit feedback: ' + err.message);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {!showForm ? (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => setShowForm(true)}
        >
          Give Feedback
        </Button>
      ) : (
        <>
          <Typography gutterBottom>Rate your experience</Typography>
          <Rating
            value={rating}
            onChange={(_, value) => setRating(value)}
            size="large"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Your feedback"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setShowForm(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              fullWidth
            >
              Submit Feedback
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}