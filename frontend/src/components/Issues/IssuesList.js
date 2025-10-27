import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';

export default function IssuesList() {
  const { eventId } = useParams();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const q = query(
          collection(db, 'issues'),
          where('eventId', '==', eventId)
        );
        const querySnapshot = await getDocs(q);
        const issuesList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Issue data:', data); // Debug log
          return {
            id: doc.id,
            description: data.issue || 'No description provided',
            userName: data.email || 'Anonymous',
            timestamp: data.timestamp
          };
        });
        setIssues(issuesList);
      } catch (err) {
        console.error('Fetch error:', err); // Debug log
        setError('Failed to fetch issues: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [eventId]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reported Issues
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reported By</TableCell>
              <TableCell>Issue Description</TableCell>
              <TableCell>Time Reported</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>{issue.userName || 'Anonymous'}</TableCell>
                <TableCell>{issue.description || 'No description provided'}</TableCell>
                <TableCell>
                  {issue.timestamp?.toDate?.().toLocaleString() || 'Time not available'}
                </TableCell>
              </TableRow>
            ))}
            {issues.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No issues reported yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}