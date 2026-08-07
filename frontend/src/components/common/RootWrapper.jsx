import React from 'react';
import { Outlet } from 'react-router-dom';
import { LenisProvider } from '@/contexts/LenisContext';

/**
 * Root wrapper component that guarantees all child routes execute in the context 
 * of the Lenis smooth scroller and React Router location triggers.
 */
export default function RootWrapper() {
  return (
    <LenisProvider>
      <Outlet />
    </LenisProvider>
  );
}
