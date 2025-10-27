// src/components/Volunteers/VolunteerOpportunities.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';

export default function VolunteerOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const q = query(
          collection(db, 'volunteer_requests'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const opportunitiesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to JS Date
          startDate: doc.data().startDate?.toDate(),
          endDate: doc.data().endDate?.toDate()
        }));
        
        setOpportunities(opportunitiesData);
        setError('');
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError('Failed to load volunteer opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
        Volunteer Opportunities
      </Typography>
      
      <Grid container spacing={3}>
        {opportunities.map((opp) => (
          <Grid item xs={12} md={6} key={opp.id}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {opp.title}
                  <Chip
                    label={opp.status}
                    color={opp.status === 'open' ? 'success' : 'error'}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {opp.description}
                </Typography>

                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Skills:</strong> {opp.requiredSkills}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Volunteers Needed:</strong> {opp.numberOfVolunteers}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" display="block">
                      {opp.startDate?.toLocaleDateString()} - {opp.endDate?.toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>

                <Button
                  component={Link}
                  to={`/volunteer/apply/${opp.id}`}
                  variant="contained"
                  fullWidth
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {opportunities.length === 0 && (
        <Typography variant="body1" sx={{ mt: 3 }}>
          No volunteer opportunities available at the moment.
        </Typography>
      )}
    </Container>
  );
}