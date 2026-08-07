import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function CompletionStep({ onFinish }) {
  return (
    <div className="flex flex-col items-center text-center space-y-8 py-6">
      
      {/* Pop animation */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [1, 1.2, 1], opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 h-20 w-20 rounded-full bg-success-500 flex items-center justify-center text-white shadow-lg shadow-success-500/25"
        >
          <CheckCircle2 className="h-10 w-10" />
        </motion.div>
        
        {/* Glow rings */}
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-success-500/30 blur-sm pointer-events-none"
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
          Your Platform Is Ready
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Let's unlock your working capital.
        </p>
      </div>

      <motion.button
        onClick={onFinish}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full max-w-xs py-4 px-8 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold text-sm transition shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
      >
        <Sparkles className="h-4.5 w-4.5" />
        <span>Go to Dashboard</span>
      </motion.button>

    </div>
  );
}
