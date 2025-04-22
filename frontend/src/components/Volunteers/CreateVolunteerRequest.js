// src/components/Volunteers/CreateVolunteerRequest.js
import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Grid,
  InputAdornment,
  MenuItem,
  Alert
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PeopleIcon from '@mui/icons-material/People';

export default function CreateVolunteerRequest() {
  const [requestData, setRequestData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    numberOfVolunteers: 1,
    startDate: '',
    endDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const skillsOptions = [
    'Event Management',
    'Technical Support',
    'Hospitality',
    'Logistics',
    'Marketing'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Check user authentication
      if (!auth.currentUser) {
        throw new Error('You must be logged in to create volunteer requests');
      }

      // Validate required fields
      if (!requestData.title || !requestData.description) {
        throw new Error('Please fill all required fields');
      }

      // Create document with proper data types
      await addDoc(collection(db, 'volunteer_requests'), {
        ...requestData,
        status: 'open',
        numberOfVolunteers: Number(requestData.numberOfVolunteers),
        startDate: new Date(requestData.startDate),
        endDate: new Date(requestData.endDate),
        createdAt: new Date(),
        organizer: auth.currentUser.uid,
        applications: [],
        organizerEmail: auth.currentUser.email // Optional but useful
      });

      // Reset form and show success
      setRequestData({
        title: '',
        description: '',
        requiredSkills: '',
        numberOfVolunteers: 1,
        startDate: '',
        endDate: ''
      });
      setSuccess(true);
    } catch (error) {
      console.error('Error creating request:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Create Volunteer Opportunity
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Request submitted successfully!</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Opportunity Title *"
              fullWidth
              value={requestData.title}
              onChange={(e) => setRequestData({...requestData, title: e.target.value})}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description *"
              multiline
              rows={4}
              fullWidth
              value={requestData.description}
              onChange={(e) => setRequestData({...requestData, description: e.target.value})}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Required Skills *"
              fullWidth
              value={requestData.requiredSkills}
              onChange={(e) => setRequestData({...requestData, requiredSkills: e.target.value})}
            >
              {skillsOptions.map((skill) => (
                <MenuItem key={skill} value={skill}>
                  {skill}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Number of Volunteers Needed *"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PeopleIcon />
                  </InputAdornment>
                ),
                inputProps: { min: 1 }
              }}
              value={requestData.numberOfVolunteers}
              onChange={(e) => setRequestData({
                ...requestData,
                numberOfVolunteers: Math.max(1, e.target.value)
              })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              type="date"
              label="Start Date *"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EventNoteIcon />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ shrink: true }}
              value={requestData.startDate}
              onChange={(e) => setRequestData({...requestData, startDate: e.target.value})}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              type="date"
              label="End Date *"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EventNoteIcon />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ shrink: true }}
              value={requestData.endDate}
              onChange={(e) => setRequestData({...requestData, endDate: e.target.value})}
            />
          </Grid>

          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Post Volunteer Opportunity'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}