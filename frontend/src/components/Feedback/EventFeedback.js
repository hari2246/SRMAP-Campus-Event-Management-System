// src/components/Events/EventFeedback.js
import React, { useEffect,useState } from 'react';
import { 
  Box, 
  Typography, 
  Rating, 
  TextField, 
  Button, 
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { db, auth } from '../../services/firebase';

import { 
  // ... other imports
} from '@mui/material';
import { 
  doc, 
  collection, 
  addDoc, 
  getDocs,
  query,       // Add this
  where        // Add this
} from 'firebase/firestore'; // Update imports

export default function EventFeedback({ eventId, eventStatus }) {
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  // Load existing feedback
  useEffect(() => {
    const loadFeedback = async () => {
      const feedbackCol = collection(db, 'feedback');
      const q = query(feedbackCol, where('eventId', '==', eventId));
      const snapshot = await getDocs(q);
      setFeedbacks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    loadFeedback();
  }, [eventId]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!auth.currentUser) throw new Error('Please login to submit feedback');
      if (eventStatus !== 'ongoing' && eventStatus !== 'completed') {
        throw new Error('Feedback only allowed for ongoing/completed events');
      }

      await addDoc(collection(db, 'feedback'), {
        eventId,
        userId: auth.currentUser.uid,
        rating,
        comment,
        createdAt: new Date()
      });

      setSuccess(true);
      setComment('');
      setRating(3);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Event Feedback
      </Typography>

      {['ongoing', 'completed'].includes(eventStatus) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" gutterBottom>
            Rate this event:
          </Typography>
          
          <Rating
            value={rating}
            onChange={(e, newValue) => setRating(newValue)}
            size="large"
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Your comments"
            multiline
            rows={4}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !auth.currentUser}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>Thanks for your feedback!</Alert>}
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Previous Feedback
      </Typography>
      
      {feedbacks.length === 0 ? (
        <Typography variant="body2">No feedback yet</Typography>
      ) : (
        <List>
          {feedbacks.map(fb => (
            <ListItem key={fb.id} divider>
              <ListItemText
                primary={<Rating value={fb.rating} readOnly />}
                secondary={
                  <>
                    <Typography variant="body2">{fb.comment}</Typography>
                    <Typography variant="caption">
                      {new Date(fb.createdAt?.toDate()).toLocaleDateString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}