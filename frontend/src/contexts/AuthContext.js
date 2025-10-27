import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        const isSRMAPEmail = email.endsWith('@srmap.edu.in');
        const isAdminEmail = email === 'harisuddamalla24@gmail.com';

        if (isSRMAPEmail || isAdminEmail) {
          const role = determineUserRole(email);
          setUser({
            uid: firebaseUser.uid,
            email,
            role,
            isTestUser: false
          });
        } else {
          await signOut(auth);
          setUser(null);
        }
      } else {
        // 🔹 Check localStorage for test login
        const storedEmail = localStorage.getItem('userEmail');
        const storedRole = localStorage.getItem('userRole');
        const storedName = localStorage.getItem('userName');

        if (storedEmail && storedRole) {
          setUser({
            uid: 'test-local',
            email: storedEmail,
            role: storedRole,
            name: storedName,
            isTestUser: true
          });
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const determineUserRole = (email) => {
    if (email === 'harisuddamalla24@gmail.com') return 'admin';
    if (email === 'bhavajna_madivada@srmap.edu.in') return 'organiser';
    if (email.includes('_adm')) return 'admin';
    if (email.endsWith('@srmap.edu.in') && !email.includes('_')) return 'organiser';
    return 'student';
  };

  const logout = async () => {
    // 🔹 Clear both Firebase and localStorage users
    await signOut(auth);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
