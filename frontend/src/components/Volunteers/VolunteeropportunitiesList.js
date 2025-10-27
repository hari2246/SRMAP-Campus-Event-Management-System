import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';

export default function VolunteerOpportunitiesList() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;

        if (!user) {
          setError('You must be logged in to view your opportunities.');
          return;
        }

        const q = query(
          collection(db, 'volunteer_requests'),
          where('organizer', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setOpportunities(data);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError('Failed to load your opportunities.');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container sx={{ backgroundColor: '#f5f5f5', padding: '2rem', borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Available Volunteer Opportunities
      </Typography>

      {opportunities.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          No volunteer opportunities created yet.
        </Typography>
      ) : (
        <List>
          {opportunities.map(op => (
            <ListItem
              button
              key={op.id}
              onClick={() => navigate(`/volunteer-requests/${op.id}/applications`)}
              sx={{ mb: 2 }}
            >
              <ListItemText
                primary={op.title}
                secondary={`${op.applications?.length || 0} application(s)`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
}
