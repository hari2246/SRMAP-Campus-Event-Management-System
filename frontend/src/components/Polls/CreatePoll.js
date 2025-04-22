import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { Button, TextField, Container, Typography, Box } from '@mui/material';

export default function CreatePoll() {
  const [pollData, setPollData] = useState({
    question: '',
    options: ['', ''],
    endsAt: ''
  });

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollData.options];
    newOptions[index] = value;
    setPollData({ ...pollData, options: newOptions });
  };

  const addOption = () => {
    setPollData({ ...pollData, options: [...pollData.options, ''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert('You must be logged in to create a poll.');
      return;
    }

    // Convert array to object: { Yes: 0, No: 0 }
    const formattedOptions = pollData.options.reduce((acc, option) => {
      if (option.trim() !== '') {
        acc[option] = 0;
      }
      return acc;
    }, {});

    try {
      await addDoc(collection(db, 'polls'), {
        question: pollData.question,
        options: formattedOptions,
        voters: [],
        createdAt: new Date(),
        endsAt: new Date(pollData.endsAt),
        status: 'active',
        createdBy: {
          uid: user.uid,
          email: user.email,
          name: user.displayName || ''
        }
      });

      alert('Poll created successfully!');
      setPollData({ question: '', options: ['', ''], endsAt: '' });
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Create New Poll</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Poll Question"
          fullWidth
          required
          margin="normal"
          value={pollData.question}
          onChange={(e) => setPollData({ ...pollData, question: e.target.value })}
        />

        <Typography variant="h6" sx={{ mt: 2 }}>Options</Typography>
        {pollData.options.map((option, index) => (
          <TextField
            key={index}
            label={`Option ${index + 1}`}
            fullWidth
            required
            margin="normal"
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
          />
        ))}

        <Button 
          variant="outlined" 
          onClick={addOption}
          sx={{ mt: 1 }}
        >
          Add Option
        </Button>

        <TextField
          label="End Date & Time"
          type="datetime-local"
          fullWidth
          required
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={pollData.endsAt}
          onChange={(e) => setPollData({ ...pollData, endsAt: e.target.value })}
        />

        <Button 
          type="submit" 
          variant="contained" 
          sx={{ mt: 3 }}
        >
          Create Poll
        </Button>
      </Box>
    </Container>
  );
}
