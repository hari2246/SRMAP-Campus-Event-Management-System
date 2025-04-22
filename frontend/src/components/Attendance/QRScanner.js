import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../services/firebase';
import QrReader from 'react-qr-scanner';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert, Box } from '@mui/material';

export default function QRScanner() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanningError, setScanningError] = useState('');
  const [scannedData, setScannedData] = useState(null);

  const handleScan = async (result) => {
    if (result?.text) {
      try {
        console.log('Starting scan process...');
        console.log('Raw scanned data:', result.text);

        const auth = getAuth();
        const user = auth.currentUser;
        console.log('Current user:', user?.email);
        
        if (!user) throw new Error('User not logged in.');

        const scannedEventId = result.text.split('/').pop();
        console.log('Extracted event ID:', scannedEventId);

        const eventRef = doc(db, 'events', scannedEventId);
        console.log('Fetching event details...');
        
        const eventSnap = await getDoc(eventRef);
        console.log('Event exists:', eventSnap.exists());
        
        if (!eventSnap.exists()) {
          throw new Error('Event not found');
        }

        const eventData = eventSnap.data();
        console.log('Event data:', eventData);

        const attendanceRef = doc(db, 'attendance', `${scannedEventId}_${user.uid}`);
        const attendanceSnap = await getDoc(attendanceRef);
        console.log('Attendance already exists:', attendanceSnap.exists());

        if (attendanceSnap.exists()) {
          alert('Attendance already marked for this event.');
        } else {
          await setDoc(attendanceRef, {
            eventId: scannedEventId,
            userId: user.uid,
            email: user.email,
            timestamp: new Date(),
            eventTitle: eventData.title,
            userName: user.displayName || user.email,
            venue: eventData.venue,
            category: eventData.category,
            status: 'present',
          });
          alert('Attendance marked successfully!');
        }

        setScannerOpen(false);
      } catch (err) {
        console.error('Scanning error:', err);
        setScanningError(err.message);
        alert('Error: ' + err.message);
      }
    }
  };

  const handleError = (error) => {
    console.error('Scanner error:', error);
    setScanningError(error?.message || 'Failed to scan QR code');
  };

  useEffect(() => {
    console.log('Scanner component mounted');
    setScannerOpen(true);
    
    return () => {
      console.log('Scanner component unmounting');
    };
  }, []);

  useEffect(() => {
    console.log('Scanned data updated:', scannedData);
    if (scannedData) {
      console.log('Processing scanned data...');
      handleScan(scannedData);
    }
  }, [scannedData]);

  return (
    <Box>
      <Dialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Scan QR Code to Mark Attendance</DialogTitle>
        <DialogContent>
        <QrReader
        delay={300}
        onError={handleError}
        onResult={(result, error) => {
            if (result) {
            setScannedData(result);
            }
            if (error) {
            handleError(error);
            }
        }}
        constraints={{
            video: { facingMode: "environment" }  // or "user" for front
        }}
        style={{ width: '100%', minHeight: '300px' }}
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
    </Box>
  );
}
