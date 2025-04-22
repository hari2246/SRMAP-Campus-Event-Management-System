import React, { useEffect, useState } from 'react';
import { auth, db } from '../../services/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
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
  Box
} from '@mui/material';

export default function VolunteerApplicationsView() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteerRequests = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
          collection(db, 'volunteer_requests'),
          where('organizerEmail', '==', user.email)
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRequests(data);
      } catch (err) {
        console.error('Error fetching volunteer requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteerRequests();
  }, []);

  const updateStatus = async (requestId, userId, newStatus) => {
    const requestDoc = doc(db, 'volunteer_requests', requestId);
    const request = requests.find(req => req.id === requestId);
    const updatedApplications = request.applications.map(app =>
      app.userId === userId ? { ...app, status: newStatus } : app
    );

    await updateDoc(requestDoc, { applications: updatedApplications });

    // Update UI
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, applications: updatedApplications } : req
      )
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Volunteer Applications
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : requests.length === 0 ? (
        <Typography>No volunteer requests found.</Typography>
      ) : (
        requests.map((req) => (
          <Card key={req.id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">{req.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {req.description}
              </Typography>

              <Typography variant="subtitle1">Applications:</Typography>
              {req.applications?.length > 0 ? (
                <List dense>
                  {req.applications.map((app, index) => (
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
                                  onClick={() => updateStatus(req.id, app.userId, 'approved')}
                                  disabled={app.status === 'approved'}
                                  sx={{ mr: 1 }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  onClick={() => updateStatus(req.id, app.userId, 'rejected')}
                                  disabled={app.status === 'rejected'}
                                >
                                  Reject
                                </Button>
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                      {index < req.applications.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2">No applications received yet.</Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}
