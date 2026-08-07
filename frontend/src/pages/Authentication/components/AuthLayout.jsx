import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function AuthLayout({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

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
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Left split-screen (illustration) - Desktop only */}
      <div className="hidden lg:block lg:w-1/2 xl:w-5/12 h-screen sticky top-0">
        <AnimatedBackground />
      </div>

      {/* Right split-screen (forms) */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex flex-col min-h-screen relative">
        
        {/* Navigation / Actions Bar - Pinned at top with glass blur */}
        <div className="sticky top-0 w-full px-6 py-4 sm:px-12 flex justify-between items-center z-35 border-b border-gray-100 dark:border-slate-800/80 bg-white/80 dark:bg-dark-bg/85 backdrop-blur-md transition-colors duration-300">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} />
        </div>

        {/* Content body containing card */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-8 shadow-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
