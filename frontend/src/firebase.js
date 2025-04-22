import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const messaging = getMessaging(app);