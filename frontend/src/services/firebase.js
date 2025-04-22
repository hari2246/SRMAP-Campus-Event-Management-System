// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDSGvA8n778Q6ha-sLNOx_E3-VeI07SeAg",
  authDomain: "festi-flow-d1123.firebaseapp.com",
  databaseURL: "https://festi-flow-d1123-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "festi-flow-d1123",
  storageBucket: "festi-flow-d1123.firebasestorage.app",
  messagingSenderId: "628348455578",
  appId: "1:628348455578:web:2075b63d35911f3c886d23",
  measurementId: "G-48W9JNFNZM"
};

// Initialize Firebase app first
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

// Create collection references AFTER initializing db
export const eventsRef = collection(db, 'events');
export const usersRef = collection(db, 'users');
export const notificationsRef = collection(db, 'notifications');

// Export other services
export { db, auth };
export const googleProvider = new GoogleAuthProvider();