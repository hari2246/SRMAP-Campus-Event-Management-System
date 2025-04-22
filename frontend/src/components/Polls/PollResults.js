import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent,
  LinearProgress, Box, CircularProgress
} from '@mui/material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

export default function UserPollResults() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPolls = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, 'polls'), where('createdBy.email', '==', user.email));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPolls(list);
      } catch (err) {
        console.error('Failed to fetch polls:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPolls();
  }, []);

  const calculateTotalVotes = (options) =>
    Object.values(options || {}).reduce(
      (sum, value) => sum + (typeof value === 'number' ? value : value.votes || 0),
      0
    );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Poll Results
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : polls.length === 0 ? (
        <Typography>No polls found.</Typography>
      ) : (
        polls.map(poll => {
          const totalVotes = calculateTotalVotes(poll.options);

          return (
            <Card key={poll.id} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">{poll.question}</Typography>
                {Object.entries(poll.options || {}).map(([optionText, value]) => {
                  const votes = typeof value === 'number' ? value : value.votes || 0;
                  const percentage = totalVotes
                    ? ((votes / totalVotes) * 100).toFixed(1)
                    : 0;

                  return (
                    <Box key={optionText} mt={2}>
                      <Typography>{optionText}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={parseFloat(percentage)}
                        sx={{ height: 10, borderRadius: 5, my: 1 }}
                      />
                      <Typography variant="caption">
                        {votes} votes ({percentage}%)
                      </Typography>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          );
        })
      )}
    </Container>
  );
}
