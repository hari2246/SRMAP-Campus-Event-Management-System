import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Container, Paper, Typography, CircularProgress, Stack, Chip, Divider, Box, Rating
} from '@mui/material';

export default function EventFeedbackDetails() {
  const { eventId } = useParams();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const feedbackRef = collection(db, 'feedback');
        const q = query(feedbackRef, where('eventId', '==', eventId));
        const querySnapshot = await getDocs(q);
        const feedbackList = querySnapshot.docs.map(doc => doc.data());
        setFeedbacks(feedbackList);

        // Calculate average rating
        const total = feedbackList.reduce((acc, f) => acc + (f.rating || 0), 0);
        const avg = feedbackList.length ? total / feedbackList.length : 0;
        setAverageRating(avg);
      } catch (err) {
        setError('Failed to load feedbacks: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [eventId]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Feedback Details</Typography>

      {feedbacks.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Rating</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Rating value={averageRating} precision={0.1} readOnly />
            <Typography>({averageRating.toFixed(1)} / 5)</Typography>
          </Stack>
        </Box>
      )}

      {feedbacks.length === 0 ? (
        <Typography>No feedback available for this event.</Typography>
      ) : (
        feedbacks.map((feedback, index) => (
          <Paper key={index} elevation={3} sx={{ p: 3, mb: 3 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                User ID: {feedback.userId}
              </Typography>

              <Typography variant="h6">
                Rating: {feedback.rating} / 5
              </Typography>

              <Divider />

              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Comment:</strong><br />
                {feedback.comment || 'No comment'}
              </Typography>

            </Stack>
          </Paper>
        ))
      )}
    </Container>
  );
}
