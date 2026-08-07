import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Maps each user role to their designated landing page inside /app.
 * This ensures every role lands on a contextually relevant home screen.
 */
const ROLE_HOME = {
  msme:     '/app/dashboard',
  investor: '/app/investor',
  buyer:    '/app/buyer',
  admin:    '/app/admin',
};

export default function RoleHome() {
  const { currentUser } = useAuth();

  const role = currentUser?.role;
  const destination = ROLE_HOME[role] ?? '/app/dashboard';

  return <Navigate to={destination} replace />;
}
