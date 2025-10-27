// src/components/Issues/ReportIssueInline.js
import React, { useEffect, useState } from 'react';
import { TextField, Button, Box, Alert, Typography } from '@mui/material';
import { collection, addDoc, doc, getDocs, query, updateDoc, where, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';

export default function ReportIssueInline({ eventId }) {
  const [issueText, setIssueText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [existingIssue, setExistingIssue] = useState(null);

  useEffect(() => {
    const checkIfReported = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'issues'),
        where('eventId', '==', eventId),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setAlreadyReported(true);
        setSubmitted(true);
        setExistingIssue(snapshot.docs[0].data());
      }
    };

    checkIfReported();
  }, [eventId]);

  const handleSubmit = async () => {
    if (!issueText.trim()) {
      setError('Please describe the issue.');
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const docRef = await addDoc(collection(db, 'issues'), {
        userId: user.uid,
        email: user.email,
        issue: issueText,
        eventId,
        timestamp: Timestamp.now()
      });

      await updateDoc(doc(db, 'issues', docRef.id), { id: docRef.id });

      setSubmitted(true);
      setIssueText('');
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to submit issue.');
    }
  };

  if (alreadyReported && existingIssue) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Your Reported Issue:
        </Typography>
        <Typography sx={{ mt: 1 }}>{existingIssue.issue}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Reported on: {existingIssue.timestamp?.toDate().toLocaleString()}
        </Typography>
      </Box>
    );
  }

  if (submitted) {
    return <Alert severity="success">Issue reported successfully!</Alert>;
  }

  return (
    <Box>
      <TextField
        fullWidth
        multiline
        minRows={3}
        variant="outlined"
        label="Describe the issue"
        value={issueText}
        onChange={(e) => setIssueText(e.target.value)}
        sx={{ mt: 1 }}
      />
      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      <Button variant="contained" color="warning" onClick={handleSubmit} sx={{ mt: 2 }}>
        Submit
      </Button>
    </Box>
  );
}
