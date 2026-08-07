import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { DemoModeProvider } from './contexts/DemoModeContext';
import { Web3AuthProvider } from './contexts/Web3AuthContext';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3AuthProvider>
        <AuthProvider>
          <DemoModeProvider>
            <RouterProvider router={router} />
          </DemoModeProvider>
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 500,
            },
            success: {
              style: { background: '#10b981', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#10b981' },
            },
            error: {
              style: { background: '#ef4444', color: '#fff' },
            },
          }}
        />
        </AuthProvider>
      </Web3AuthProvider>
    </QueryClientProvider>
  );
}
