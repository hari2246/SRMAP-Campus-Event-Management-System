import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  doc, getDoc, deleteDoc, collection, getDocs, query, where, setDoc
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../services/firebase';
import EventFeedback from '../Feedback/EventFeedback';
import { QRCodeCanvas } from 'qrcode.react';
import QrReader from 'react-qr-scanner';
import ReportIssueInline from '../Issues/ReportIssues';

import {
  Container, Typography, CircularProgress, Alert, Chip, Stack, Button,
  Paper, Divider, Box, Grid, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

import FeedbackForm from '../Feedback/FeedbackForm';

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [averageRating, setAverageRating] = useState(null);
  const [totalAttendees, setTotalAttendees] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanningError, setScanningError] = useState('');
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);
  const [userFeedback, setUserFeedback] = useState(null);
  const [feedbackSnapAll, setFeedbackSnapAll] = useState(null);
  const [attendanceSnap, setAttendanceSnap] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        const email = user.email;
        setCurrentUserEmail(email);
        if (email === 'bhavajna_madivada@srmap.edu.in') {
          setUserRole('organiser');
        } else if (email.includes('_')) {
          setUserRole('student');
        } else if (email.includes('.')) {
          setUserRole('organiser');
        } else {
          setUserRole('admin');
        }
      } else {
        setCurrentUserEmail(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const processedData = {
            id: docSnap.id,
            ...data,
            schedule: {
              start: data.schedule?.start?.toDate?.() || new Date(),
              end: data.schedule?.end?.toDate?.() || new Date(),
            }
          };
          setEvent(processedData);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError('Failed to load event: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const fetchStats = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user || !eventId) return;

      try {
        const attendanceRef = doc(db, 'attendance', `${eventId}_${user.uid}`);
        const attendanceSnapshot = await getDoc(attendanceRef);
        setAttendanceSnap(attendanceSnapshot);

        const userId = user.uid;
        setCurrentUserEmail(user.email);

        const feedbackRef = collection(db, 'feedback');
        const feedbackQuery = query(feedbackRef, where('userId', '==', userId), where('eventId', '==', eventId));
        const feedbackSnap = await getDocs(feedbackQuery);

        if (!feedbackSnap.empty) {
          setHasGivenFeedback(true);
          const feedbackData = feedbackSnap.docs[0].data();
          setUserFeedback(feedbackData);
        } else {
          setHasGivenFeedback(false);
        }

        const feedbackSnapAll = await getDocs(query(feedbackRef, where('eventId', '==', eventId)));
        setFeedbackSnapAll(feedbackSnapAll);

        let totalRating = 0, count = 0;
        feedbackSnapAll.forEach(doc => {
          const data = doc.data();
          if (data.rating) {
            totalRating += data.rating;
            count++;
          }
        });

        if (count > 0) setAverageRating((totalRating / count).toFixed(1));

        const attendanceQuery = query(collection(db, 'attendance'), where('eventId', '==', eventId));
        const attendanceSnap = await getDocs(attendanceQuery);
        setTotalAttendees(attendanceSnap.size);

      } catch (err) {
        console.error('Stats fetching error:', err);
      }
    };

    fetchStats();
  }, [eventId]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteDoc(doc(db, 'events', eventId));
      alert('Event deleted successfully.');
      navigate('/events');
    } catch (err) {
      alert('Failed to delete event: ' + err.message);
    }
  };

  const handleShowQR = () => setShowQR(true);
  const handleCloseQR = () => setShowQR(false);

  const handleScan = async (data) => {
    if (data) {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('User not logged in.');

        const attendanceRef = doc(db, 'attendance', `${eventId}_${user.uid}`);
        const attendanceSnap = await getDoc(attendanceRef);

        if (attendanceSnap.exists()) {
          alert('Attendance already marked.');
        } else {
          await setDoc(attendanceRef, {
            eventId: eventId,
            userId: user.uid,
            email: user.email,
            timestamp: new Date(),
            eventTitle: event.title,
            userName: user.displayName || user.email,
            venue: event.venue,
            category: event.category
          });
          alert('Attendance marked successfully!');
        }

        setScannerOpen(false);
      } catch (err) {
        console.error('Scanning error:', err);
        setScanningError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button component={Link} to="/events" sx={{ mt: 2 }}>
          Back to Events
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
            <Typography variant="h4">{event.title}</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1} direction="row" flexWrap="wrap" gap={1}>
              <Chip label={`Status: ${event.status}`} color={
                event.status === 'completed' ? 'success' :
                  event.status === 'ongoing' ? 'warning' : 'default'
              } />
              <Chip label={`Category: ${event.category}`} />
              <Chip label={`Venue: ${event.venue}`} />
              <Chip label={`Start: ${event.schedule.start.toLocaleString()}`} />
              <Chip label={`End: ${event.schedule.end.toLocaleString()}`} />
              {event.organizers?.name && <Chip label={`Organizer: ${event.organizers.name}`} />}
              {event.approval?.status && <Chip label={`Approval: ${event.approval.status}`} color="info" />}
              {event.attendanceTracking && <Chip label="Attendance Enabled" color="secondary" />}
              {event.feedback?.enabled && <Chip label="Feedback Enabled" color="secondary" />}
            </Stack>

            <Box sx={{ mt: 3 }}>
              <Typography>{event.description}</Typography>
            </Box>

            {userRole === 'organiser' && currentUserEmail === event.organizers?.email && event.status !== 'completed' && (
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button variant="outlined" component={Link} to={`/events/${eventId}/edit`}>
                  Edit Event
                </Button>
                <Button variant="outlined" color="error" onClick={handleDelete}>
                  Delete Event
                </Button>
              </Stack>
            )}
            {event.status === 'ongoing' && userRole === 'student' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Report an Issue</Typography>
                <ReportIssueInline eventId={eventId} />
              </Box>
            )}

            {(event.status === 'ongoing' &&( userRole === 'organiser' || userRole === 'admin')) && (
              <Button
                variant="outlined"
                color="info"
                sx={{ mt: 3, ml: 2 }}
                component={Link}
                to={`/events/${eventId}/issues`}
              >
                View Reported Issues
              </Button>
            )}
          </Paper>

          {(event.status === 'ongoing' || event.status === 'completed') && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {event.attendanceTracking && (
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>Attendance</Typography>
                    {userRole === 'organiser' && currentUserEmail === event.organizers?.email  && (
                      <>
                        <Button variant="contained" color="secondary" onClick={handleShowQR}>
                          Collect Attendance
                        </Button>
                        {/* {totalAttendees !== null && (
                          <Chip label={`Total Attendees: ${totalAttendees}`} color="info" sx={{ mt: 1 }} />
                        )} */}
                        <Button variant="outlined" sx={{ mt: 2 }} component={Link} to={`/mark-attendance/${eventId}`}>
                          View Attendees
                        </Button>
                      </>
                    )}
                    {userRole === 'student' && (
                      <>
                        {attendanceSnap?.exists() ? (
                          <Chip 
                            label="Attendance Marked" 
                            color="success" 
                            sx={{ mt: 2 }}
                          />
                        ) : (
                          <Button
                            variant="contained"
                            color="success"
                            sx={{ mt: 2 }}
                            onClick={() => setScannerOpen(true)}
                          >
                            Scan QR to Mark Attendance
                          </Button>
                        )}
                      </>
                    )}
                    {totalAttendees !== null && (
                          <Chip label={`Total Attendees: ${totalAttendees}`} color="info" sx={{ mt: 1 }} />
                        )}
                  </Paper>
                </Grid>
              )}
              {event.feedback?.enabled && (
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Feedback</Typography>

                  {(userRole === 'organiser' || userRole === 'admin') && (
                    <>
                      {averageRating && (
                        <Chip label={`Avg. Rating: ${averageRating}/5`} color="primary" sx={{ mr: 1 }} />
                      )}
                      <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        component={Link}
                        to={`/events/${eventId}/feedback`}
                      >
                        View All Feedback
                      </Button>
                    </>
                  )}

                  {userRole === 'student' && (
                    <>
                      {hasGivenFeedback ? (
                        <Box sx={{ mt: 2 }}>
                          <Typography>You have already submitted feedback.</Typography>
                          <Typography>Rating: {userFeedback?.rating}/5</Typography>
                          <Typography>Comment: {userFeedback?.comment}</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ mt: 2 }}>
                          <FeedbackForm eventId={eventId} />
                        </Box>
                      )}
                    </>
                  )}
                </Paper>
              </Grid>
            )}

            </Grid>
          )}

          {showQR && (
            <Dialog open={showQR} onClose={handleCloseQR}>
              <DialogTitle>Event Attendance QR Code</DialogTitle>
              <DialogContent>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <QRCodeCanvas
                    value={`${window.location.origin}/events/${eventId}`}
                    size={256}
                    level="H"
                  />
                  <Typography variant="body2" align="center" sx={{ mt: 2, mb: 1 }}>
                    Students can scan this QR code to mark their attendance
                  </Typography>
                  <Box 
                    sx={{ 
                      p: 2, 
                      bgcolor: '#f5f5f5', 
                      borderRadius: 1,
                      width: '100%',
                      wordBreak: 'break-all'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      URL: {`${window.location.origin}/events/${eventId}`}
                    </Typography>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseQR}>Close</Button>
              </DialogActions>
            </Dialog>
          )}

          {scannerOpen && !attendanceSnap?.exists() && (
             <Dialog open={scannerOpen} onClose={() => setScannerOpen(false)}>
             <DialogTitle>Scan QR Code to Mark Attendance</DialogTitle>
             <DialogContent>
               <QrReader
                 onError={(error) => {
                   console.error('Scanner error:', error);
                   setScanningError(error?.message || 'Failed to scan QR code');
                 }}
                 onScan={handleScan}
                 style={{ width: '100%' }}
               />
               {scanningError && (
                 <Alert severity="error" sx={{ mt: 2 }}>
                   {scanningError}
                 </Alert>
               )}
             </DialogContent>
             <DialogActions>
               <Button onClick={() => setScannerOpen(false)} color="primary">
                 Close
               </Button>
             </DialogActions>
           </Dialog>
          )}

        </Grid>

        {/* Removing the right sidebar Grid item */}
      </Grid>
    </Container>
  );
}
