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
  CircularProgress,
  TextField,
  MenuItem,
  Divider
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('');
  const navigate = useNavigate();

  // ---- Original Google Login ----
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

      let role = 'student';
      if (isTestAdmin) role = 'admin';
      else if (isTestOrganiser) role = 'organiser';
      else if (email.includes('_adm')) role = 'admin';
      else if (!email.includes('_')) role = 'organiser';

      // Firestore write for real users
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
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', displayName);

      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'organiser') navigate('/organiser/dashboard');
      else navigate('/dashboard');

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---- Temporary Test Login (No Firestore, works for demo/recruiters) ----
  const handleTestLogin = () => {
    if (!email || !role) {
      setError('Please enter an email and select a role');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const uid = 'test-' + Math.random().toString(36).substring(2, 10);
      const displayName = email.split('@')[0];

      // Save user info locally for testing/demo
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', displayName);

      // Navigate based on role
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'organiser') navigate('/organiser/Dashboard');
      else navigate('/Dashboard');

    } catch (err) {
      console.error(err);
      setError('Test login failed');
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
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        {/* --- Divider --- */}
        <Divider sx={{ my: 4, width: '100%' }}>OR</Divider>

        {/* ---- Test Login Form ---- */}
        <Typography variant="h6" gutterBottom>
          🔧 Test Login (For Recruiters / Demo)
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          *For testing purposes only — allows login without Google authentication.
        </Typography>

        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          select
          label="Select Role"
          fullWidth
          value={role}
          onChange={(e) => setRole(e.target.value)}
          sx={{ mb: 3 }}
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="organiser">Organiser</MenuItem>
          <MenuItem value="student">Student</MenuItem>
        </TextField>

        <Button
          variant="outlined"
          onClick={handleTestLogin}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? 'Logging in...' : 'Login as Selected Role'}
        </Button>

        <Typography variant="body2" color="textSecondary" sx={{ mt: 4 }}>
          By continuing, you agree to SRMAP's event management policies.
        </Typography>
      </Box>
    </Container>
  );
}
