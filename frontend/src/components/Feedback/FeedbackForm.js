import React, { useState } from 'react';
import { TextField, Rating, Button, Box, Alert, Typography } from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';

export default function FeedbackForm({ eventId, onSubmit = () => {} }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState(null); // new state

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError('You must be logged in to submit feedback');
        return;
      }

      await addDoc(collection(db, 'feedback'), {
        eventId,
        userId: user.uid,
        email: user.email,
        rating,
        comment,
        timestamp: new Date()
      });

      const feedbackData = { rating, comment }; // store submitted values

      setSubmittedFeedback(feedbackData);
      setSuccessMessage('Thank you for your feedback!');
      setError('');
      setRating(0);
      setComment('');
      setShowForm(false);
      onSubmit(); // safely call callback
    } catch (err) {
      setError('Failed to submit feedback: ' + err.message);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {submittedFeedback ? (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
          <Typography variant="h6">Your Submitted Feedback</Typography>
          <Rating value={submittedFeedback.rating} readOnly sx={{ mb: 1 }} />
          <Typography variant="body1">{submittedFeedback.comment}</Typography>
        </>
      ) : !showForm ? (
        <>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              setSuccessMessage('');
              setShowForm(true);
            }}
          >
            Give Feedback
          </Button>
          {successMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {successMessage}
            </Alert>
          )}
        </>
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
