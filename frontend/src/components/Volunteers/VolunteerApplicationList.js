import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc,updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Button,
  Stack,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';

export default function VolunteerApplicationsList() {
  const { requestId } = useParams();
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'volunteer_requests', requestId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          setError('Opportunity not found');
          return;
        }
        setRequestData(docSnap.data());
      } catch (err) {
        console.error(err);
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestId]);

  const updateStatus = async (newStatus, userId) => {
    const requestDoc = doc(db, 'volunteer_requests', requestId);
    const updatedApplications = requestData.applications.map(app =>
      app.userId === userId ? { ...app, status: newStatus } : app
    );

    await updateDoc(requestDoc, { applications: updatedApplications });

    // Update UI
    setRequestData(prev => ({
      ...prev,
      applications: updatedApplications
    }));
  };

  if (loading) return <CircularProgress />;

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Applications for: {requestData.title}
      </Typography>

      {requestData.applications?.length ? (
        <Card>
          <CardContent>
            <Typography variant="h6">{requestData.description}</Typography>
            <Typography variant="subtitle1" gutterBottom>
              Applications:
            </Typography>

            <List dense>
              {requestData.applications.map((app, index) => (
                <React.Fragment key={app.userId}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <span>{app.userId}</span>
                          <Chip
                            label={app.status}
                            color={
                              app.status === 'approved'
                                ? 'success'
                                : app.status === 'rejected'
                                ? 'error'
                                : 'warning'
                            }
                            size="small"
                          />
                        </Stack>
                      }
                      secondary={
                        <>
                          <Typography variant="body2">
                            <strong>Motivation:</strong> {app.motivation}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Experience:</strong> {app.relevantExperience}
                          </Typography>
                          <Typography variant="caption" display="block">
                            <strong>Applied At:</strong>{' '}
                            {new Date(app.appliedAt?.seconds * 1000).toLocaleString()}
                          </Typography>
                          <Box mt={1}>
                            <Button
                              size="small"
                              color="success"
                              variant="outlined"
                              onClick={() => updateStatus('approved', app.userId)}
                              disabled={app.status === 'approved'}
                              sx={{ mr: 1 }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => updateStatus('rejected', app.userId)}
                              disabled={app.status === 'rejected'}
                            >
                              Reject
                            </Button>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  {index < requestData.applications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      ) : (
        <Typography>No applications received yet.</Typography>
      )}
    </Container>
  );
}
