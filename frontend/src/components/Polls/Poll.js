// src/components/Polls/Poll.js
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import {
  Container, Typography, Button, CircularProgress, Alert, Box, LinearProgress
} from '@mui/material';
import { useParams } from 'react-router-dom';

export default function Poll() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const docRef = doc(db, 'polls', pollId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const pollData = docSnap.data();
          setPoll(pollData);
          setHasVoted((pollData.voters || []).includes(auth.currentUser?.uid));
        } else {
          setError('Poll not found');
        }
      } catch (error) {
        setError('Failed to load poll');
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [pollId]);

  const handleVote = async () => {
    try {
      if (!auth.currentUser) throw new Error('Please login to vote');
      if (hasVoted) throw new Error('You already voted');
      if (!selectedOption) throw new Error('Please select an option');

      const voteCount = poll.options[selectedOption] || 0;

      await updateDoc(doc(db, 'polls', pollId), {
        [`options.${selectedOption}`]: voteCount + 1,
        voters: arrayUnion(auth.currentUser.uid)
      });

      setPoll(prev => ({
        ...prev,
        options: {
          ...prev.options,
          [selectedOption]: voteCount + 1
        },
        voters: [...(prev.voters || []), auth.currentUser.uid]
      }));
      setHasVoted(true);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <Box mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!poll) return null;

  const totalVotes = Object.values(poll.options || {}).reduce((a, b) => a + b, 0);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>{poll.question}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 3 }}>
        {Object.entries(poll.options || {}).map(([option, votes]) => {
          const percentage = totalVotes ? (votes / totalVotes) * 100 : 0;

          return (
            <Box key={option} sx={{ mb: 2 }}>
              <Button
                variant={selectedOption === option ? 'contained' : 'outlined'}
                onClick={() => setSelectedOption(option)}
                disabled={hasVoted}
                fullWidth
                sx={{ mb: 1 }}
              >
                {option}
              </Button>
              {hasVoted && (
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              )}
              {hasVoted && (
                <Typography variant="caption" color="textSecondary">
                  {votes} votes ({percentage.toFixed(1)}%)
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {!hasVoted && (
        <Button
          variant="contained"
          size="large"
          onClick={handleVote}
          disabled={!selectedOption}
        >
          Submit Vote
        </Button>
      )}

      {hasVoted && <Alert severity="success" sx={{ mt: 2 }}>Thanks for voting!</Alert>}
    </Container>
  );
}
