import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ darkMode, onToggle, className = '' }) {
  return (
    <motion.button
      onClick={onToggle}
      className={`relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/5 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.span
        key={darkMode ? 'moon' : 'sun'}
        initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0,   opacity: 1, scale: 1   }}
        exit={{    rotate:  30, opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </motion.span>
    </motion.button>
  );
}
