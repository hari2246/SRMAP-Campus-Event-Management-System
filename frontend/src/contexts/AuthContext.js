import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const email = user.email || '';
        const isSRMAPEmail = email.endsWith('@srmap.edu.in');
        const isAdminEmail = email === 'harisuddamalla24@gmail.com';

        if (isSRMAPEmail || isAdminEmail) {
          const role = determineUserRole(email);
          setUser({
            uid: user.uid,
            email,
            role
          });
        } else {
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
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
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
