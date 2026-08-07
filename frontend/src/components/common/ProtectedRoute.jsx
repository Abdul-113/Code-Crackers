import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Role-to-allowed-pages mapping.
 * If a user navigates to a page they don't have access to,
 * they are bounced back to their role home.
 */
const ROLE_ALLOWED_PATHS = {
  msme:     ['/app/dashboard', '/app/msme', '/app/analytics', '/app/copilot', '/app/profile', '/app/invoice', '/app/activity', '/app/marketplace'],
  investor: ['/app/investor', '/app/marketplace', '/app/blockchain', '/app/profile', '/app/invoice', '/app/activity', '/app/analytics'],
  buyer:    ['/app/buyer', '/app/profile', '/app/invoice', '/app/activity', '/app/blockchain'],
  admin:    ['/app/admin', '/app/profile', '/app/activity', '/app/invoice', '/app/marketplace', '/app/blockchain', '/app/analytics', '/app/dashboard', '/app/msme', '/app/investor', '/app/buyer'],
};

const ROLE_HOME = {
  msme:     '/app/dashboard',
  investor: '/app/investor',
  buyer:    '/app/buyer',
  admin:    '/app/admin',
};

/**
 * Guard component to enforce session verification, correct role setup,
 * and role-based page access control without dropping active sessions.
 */
export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-dark-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          <span className="text-sm font-semibold text-gray-500">Verifying secure session...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding only for brand-new users who haven't chosen a role yet.
  // Existing users who already have a role skip onboarding entirely.
  const isNewUser = !currentUser.onboardingCompleted && !currentUser.role;
  if (isNewUser && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Role-based access guard: prevent users from visiting pages outside their role
  const role = currentUser?.role;
  const allowedPaths = ROLE_ALLOWED_PATHS[role];
  const roleHome = ROLE_HOME[role] ?? '/app/dashboard';

  if (allowedPaths && location.pathname.startsWith('/app/')) {
    // Check if the current path is allowed for this role
    const isAllowed = allowedPaths.some((allowed) =>
      location.pathname.startsWith(allowed)
    );
    if (!isAllowed) {
      return <Navigate to={roleHome} replace />;
    }
  }

  return children;
}
