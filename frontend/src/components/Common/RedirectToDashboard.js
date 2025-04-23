import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RedirectToDashboard = () => {
  const { currentUser, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'organiser') {
        navigate('/organiser/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  }, [currentUser, role, navigate]);

  return null; // or a spinner if you want
};

export default RedirectToDashboard;
