import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from '@/constants/landingData';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Button from '@/components/ui/Button';

const ROLE_ROUTES = {
  msme:     '/app/dashboard',
  investor: '/app/investor',
  buyer:    '/app/buyer',
  admin:    '/app/admin',
};

export default function Navbar({ darkMode, onToggleDark }) {
  const { currentUser } = useAuth();
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  const portalDestination = currentUser
    ? (!currentUser.onboardingCompleted ? '/onboarding' : (ROLE_ROUTES[currentUser.role] || '/app/dashboard'))
    : '/login';

  const roleLabel = currentUser?.role 
    ? `${currentUser.role.toUpperCase()} Portal`
    : 'Dashboard';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1  }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-gray-200/60 dark:border-white/5 bg-white/80 dark:bg-dark-bg/85 backdrop-blur-xl shadow-sm'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <motion.a
              href="#hero"
              onClick={(e) => handleNavClick(e, '#hero')}
              className="flex items-center gap-2.5 group cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 shadow-glow-blue">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                Invoice<span className="gradient-text">2Credit</span>{' '}
                <span className="font-normal text-gray-500 dark:text-gray-400">AI</span>
              </span>
            </motion.a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/5 transition-all duration-150"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <ThemeToggle darkMode={darkMode} onToggle={onToggleDark} />

              {currentUser ? (
                <Link
                  to={portalDestination}
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-glow-blue/40 transition-all"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{roleLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                  >
                    Login
                  </Link>

                  <Button href="/login" size="sm" icon={ArrowRight} className="hidden sm:inline-flex shadow-glow-blue/30">
                    Get Started
                  </Button>
                </>
              )}

              {/* Mobile hamburger */}
              <motion.button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                whileTap={{ scale: 0.95 }}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 border-b border-gray-200 dark:border-dark-border bg-white/95 dark:bg-dark-bg/95 backdrop-blur-xl md:hidden"
          >
            <nav className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border flex gap-2">
                {currentUser ? (
                  <Link
                    to={portalDestination}
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-4 py-3 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Go to {roleLabel}</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
