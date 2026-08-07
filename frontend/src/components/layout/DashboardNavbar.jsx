import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, ChevronRight } from 'lucide-react';
import SearchBar from './SearchBar';
import NotificationDropdown from './NotificationDropdown';
import UserMenu from './UserMenu';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function DashboardNavbar({ setMobileOpen }) {
  const location = useLocation();
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

  // Construct breadcrumbs
  const pathnames = location.pathname.split('/').filter(x => x && x !== 'app');

  return (
    <header className="sticky top-0 z-20 w-full h-16 border-b border-gray-100 dark:border-dark-border bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 transition-colors duration-300">
      
      {/* Left Menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          <Link to="/" className="hover:text-primary-600 transition">Portal</Link>
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/app/${pathnames.slice(0, index + 1).join('/')}`;

            return (
              <React.Fragment key={to}>
                <ChevronRight className="h-3 w-3 text-gray-300 dark:text-gray-600" />
                {last ? (
                  <span className="text-gray-800 dark:text-white font-bold">{value}</span>
                ) : (
                  <Link to={to} className="hover:text-primary-600 transition">{value}</Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <SearchBar className="hidden sm:block" />
        <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} />
        <NotificationDropdown />
        <div className="h-6 w-px bg-gray-100 dark:bg-dark-border hidden sm:block" />
        <UserMenu />
      </div>

    </header>
  );
}
