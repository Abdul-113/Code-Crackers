import React, { useState, useEffect } from 'react';
import { Hexagon, LogOut } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function OnboardingLayout({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white flex flex-col justify-between p-6 sm:p-10 transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Mesh Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Header bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 shadow-md">
            <Hexagon className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-display text-base font-extrabold tracking-tight">
            Invoice<span className="text-primary-600 dark:text-primary-400">2Credit</span> AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-dark-border" />
          <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} />
        </div>
      </header>

      {/* Main card box */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-2xl rounded-3xl border border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card p-8 sm:p-12 shadow-2xl backdrop-blur-md">
          {children}
        </div>
      </main>

      {/* Footer bar */}
      <footer className="relative z-10 text-center text-xs text-gray-400 dark:text-gray-600 uppercase tracking-widest mt-6">
        Invoice2Credit protocol onboarding • Polygon Amoy
      </footer>
      
    </div>
  );
}
