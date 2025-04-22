// src/components/Polls/PollList.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Container, Typography, Card, CardContent, CircularProgress, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function PollList() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const q = query(
          collection(db, 'polls'),
          where('status', '==', 'active')
        );
        const snapshot = await getDocs(q);
        setPolls(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching polls:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Active Polls</Typography>
      {polls.map(poll => (
        <Card key={poll.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{poll.question}</Typography>
            <Button 
              component={Link}
              to={`/polls/${poll.id}`}
              variant="contained"
              sx={{ mt: 2 }}
            >
              View Poll
            </Button>
          </CardContent>
        </Card>
      ))}
      {polls.length === 0 && <Typography>No active polls available</Typography>}
    </Container>
  );
}