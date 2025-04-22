import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { CircularProgress, Typography, Container, Alert, Button } from '@mui/material';

export default function MarkAttendance() {
  const { eventId } = useParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async user => {
      if (!user) {
        setStatus('Please log in to mark your attendance.');
        setLoading(false);
        return;
      }

      const userId = user.uid;
      const userEmail = user.email;
      const attendanceRef = doc(db, 'events', eventId, 'attendees', userId);

      try {
        const snap = await getDoc(attendanceRef);
        if (snap.exists()) {
          setStatus('You have already marked your attendance.');
        } else {
          await setDoc(attendanceRef, {
            userId,
            email: userEmail,
            timestamp: new Date()
          });
          setStatus('Attendance marked successfully!');
        }
      } catch (error) {
        console.error(error);
        setStatus('Failed to mark attendance.');
      }

      setLoading(false);
    });
  }, [eventId]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Alert severity={status.includes('successfully') ? 'success' : 'info'}>
          <Typography>{status}</Typography>
        </Alert>
      )}
      {!loading && (
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      )}
    </Container>
  );
}
