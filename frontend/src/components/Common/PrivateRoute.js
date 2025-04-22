// components/Common/PrivateRoute.js
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';


export default function PrivateRoute({ children, adminOnly = false, organiserOnly = false }) {
  
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;

  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  if (organiserOnly && user.role !== 'organiser') return <Navigate to="/" />;

  return children;

}
