// src/components/Volunteers/VolunteerApplication.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  CircularProgress,
  Alert,
  Box
} from '@mui/material';

export default function VolunteerApplication() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState(null);
  const [formData, setFormData] = useState({
    motivation: '',
    relevantExperience: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const docRef = doc(db, 'volunteer_requests', requestId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          navigate('/404');
          return;
        }

        const data = docSnap.data();
        setRequestData(data);
        
        // Check if user already applied
        if (auth.currentUser) {
          const hasApplied = data.applications?.some(app => app.userId === auth.currentUser.uid);
          setHasApplied(hasApplied);
        }
      } catch (err) {
        setError('Failed to load volunteer opportunity');
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchRequest();
  }, [requestId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!auth.currentUser) {
        throw new Error('Please login to submit application');
      }

      if (hasApplied) {
        throw new Error('You have already applied to this opportunity');
      }

      if (!formData.motivation || !formData.relevantExperience) {
        throw new Error('Please fill all required fields');
      }

      await updateDoc(doc(db, 'volunteer_requests', requestId), {
        applications: arrayUnion({
          userId: auth.currentUser.uid,
          ...formData,
          appliedAt: new Date(),
          status: 'pending'
        })
      });

      // Notify organizer
      // await createNotification({
      //   type: 'VOLUNTEER_APPLICATION',
      //   userId: requestData.organizer,
      //   message: `New application for: ${requestData.title}`,
      //   link: `/volunteer-requests/${requestId}`
      // });

      // Reset form and update state
      setFormData({ motivation: '', relevantExperience: '' });
      setHasApplied(true);
      alert('Application submitted successfully!');

    } catch (err) {
      setError(err.message);
      console.error('Application error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!requestData) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">Volunteer opportunity not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Apply for: {requestData.title}
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {hasApplied ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          You've already applied to this opportunity. We'll contact you if selected.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Why do you want to volunteer? *"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            value={formData.motivation}
            onChange={(e) => setFormData({...formData, motivation: e.target.value})}
          />

          <TextField
            label="Relevant Experience *"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            value={formData.relevantExperience}
            onChange={(e) => setFormData({...formData, relevantExperience: e.target.value})}
          />

          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Application'}
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Opportunity Details</Typography>
        <Typography variant="body1">{requestData.description}</Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          <strong>Skills Required:</strong> {requestData.requiredSkills}
        </Typography>
        <Typography variant="body2">
          <strong>Volunteers Needed:</strong> {requestData.numberOfVolunteers}
        </Typography>
      </Box>
    </Container>
  );
}