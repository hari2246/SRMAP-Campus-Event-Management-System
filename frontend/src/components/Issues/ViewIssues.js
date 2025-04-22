// src/components/Issues/ViewIssues.js
import React, { useEffect, useState } from 'react';
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { db } from '../../services/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function ViewIssues({ eventId }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      if (!eventId) {
        setError('Invalid event selected.');
        setLoading(false);
        return;
      }
  
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setError('You must be logged in to view issues.');
          return;
        }
  
        const userRole = localStorage.getItem('userRole');
        const currentUserEmail = user.email;
  
        const eventRef = doc(db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);
        if (!eventSnap.exists()) {
          setError('Event not found.');
          return;
        }
        const eventData = eventSnap.data();
  
        let q;
        if (userRole === 'admin') {
          q = query(
            collection(db, 'issues'),
            where('eventId', '==', eventId),
            orderBy('timestamp', 'desc')
          );
        } else if (
          userRole === 'organiser' &&
          Object.values(eventData.organizers || {}).some(
            (org) => org.email === currentUserEmail
          )
        ) {
          q = query(
            collection(db, 'issues'),
            where('eventId', '==', eventId),
            orderBy('timestamp', 'desc')
          );
        } else {
          setError('You are not authorized to view these issues.');
          return;
        }
  
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setIssues(data);
      } catch (err) {
        console.error('Error fetching issues:', err);
        setError('Something went wrong while loading issues.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchIssues();
  }, [eventId]);
  

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Reported Issues
      </Typography>
      {issues.length === 0 ? (
        <Typography>No issues reported yet.</Typography>
      ) : (
        <List>
          {issues.map((issue, index) => (
            <React.Fragment key={issue.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={`By: ${issue.email}`}
                  secondary={
                    <>
                      <Typography variant="body2">{issue.issue}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(issue.timestamp?.seconds * 1000).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < issues.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
}
