import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingOverlay({ active, message = 'Processing request...' }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-dark-bg/75 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="flex flex-col items-center gap-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border p-8 shadow-2xl text-center max-w-xs w-full"
          >
            <div className="relative flex h-12 w-12 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-20" />
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
            <span className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">{message}</span>
            <span className="text-xs text-gray-400">Please do not refresh the page.</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
