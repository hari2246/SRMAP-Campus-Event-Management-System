// frontend/src/components/Auth/LoginPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, db } from '../../services/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Button,
  Container,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      const uid = result.user.uid;
      const displayName = result.user.displayName;

      const isTestAdmin = email === 'harisuddamalla24@gmail.com';
      const isTestOrganiser = email === 'bhavajna_madivada@srmap.edu.in';
      const isSRMAPEmail = email.endsWith('@srmap.edu.in');

      if (!isSRMAPEmail && !isTestAdmin) {
        await signOut(auth);
        throw new Error('Only SRMAP emails are allowed');
      }

      // Determine role
      let role = 'student';
      if (isTestAdmin) {
        role = 'admin';
      } else if (isTestOrganiser) {
        role = 'organiser';
      } else if (email.includes('_adm')) {
        role = 'admin';
      } else if (!email.includes('_')) {
        role = 'organiser';
      }

      // Store or update user in Firestore
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid,
          email,
          name: displayName,
          role,
          createdAt: new Date().toISOString()
        });
      }

      localStorage.setItem('userRole', role);

      // Navigate after Firestore save
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'organiser') {
        navigate('/organiser/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" gutterBottom>
          SRMAP Event System
        </Typography>

        <Typography variant="body1" color="textSecondary" paragraph>
          Please sign in with your SRMAP Google account
        </Typography>

        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={loading}
          sx={{ mt: 3, mb: 2 }}
        >
          {loading ? 'Signing In...' : 'Continue with Google'}
        </Button>

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        <Typography variant="body2" color="textSecondary" sx={{ mt: 4 }}>
          By continuing, you agree to SRMAP's event management policies.
        </Typography>
      </Box>
    </Container>
  );
}
