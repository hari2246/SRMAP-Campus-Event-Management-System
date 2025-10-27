import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  InputAdornment,
  MenuItem,
  Alert,
  Card,
  CardContent,
  CardHeader
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
      if (!auth.currentUser) {
        throw new Error('You must be logged in to create volunteer requests');
      }

      if (!requestData.title || !requestData.description) {
        throw new Error('Please fill all required fields');
      }

      await addDoc(collection(db, 'volunteer_requests'), {
        ...requestData,
        status: 'open',
        numberOfVolunteers: Number(requestData.numberOfVolunteers),
        startDate: new Date(requestData.startDate),
        endDate: new Date(requestData.endDate),
        createdAt: new Date(),
        organizer: auth.currentUser.uid,
        applications: [],
        organizerEmail: auth.currentUser.email
      });

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
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardHeader title="Create Volunteer Opportunity" />
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Request submitted successfully!</Alert>}

          <form onSubmit={handleSubmit}>
            {/* Title Field */}
            <TextField
              label="Opportunity Title *"
              fullWidth
              value={requestData.title}
              onChange={(e) => setRequestData({...requestData, title: e.target.value})}
              sx={{ mb: 2 }}
            />

            {/* Description Field */}
            <TextField
              label="Description *"
              multiline
              rows={4}
              fullWidth
              value={requestData.description}
              onChange={(e) => setRequestData({...requestData, description: e.target.value})}
              sx={{ mb: 2 }}
            />

            {/* Skills Field */}
            <TextField
              select
              label="Required Skills *"
              fullWidth
              value={requestData.requiredSkills}
              onChange={(e) => setRequestData({...requestData, requiredSkills: e.target.value})}
              sx={{ mb: 2 }}
            >
              {skillsOptions.map((skill) => (
                <MenuItem key={skill} value={skill}>
                  {skill}
                </MenuItem>
              ))}
            </TextField>

            {/* Number of Volunteers Field */}
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
              sx={{ mb: 2 }}
            />

            {/* Start Date Field */}
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
              sx={{ mb: 2 }}
            />

            {/* End Date Field */}
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
              sx={{ mb: 2 }}
            />

            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Post Volunteer Opportunity'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
