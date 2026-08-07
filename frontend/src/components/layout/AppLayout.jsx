import React from 'react';
import DashboardLayout from './DashboardLayout';

/**
 * AppLayout acts as the route gate for the authenticated dashboard pages,
 * rendering the premium DashboardLayout architecture shell.
 */
export default function AppLayout() {
  return <DashboardLayout />;
}
