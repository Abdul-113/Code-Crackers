import React from 'react';
import { motion } from 'framer-motion';
import { FileCode, ArrowRight, ArrowRightLeft } from 'lucide-react';
import { floatAnimation } from '@/constants/animations';

export default function WelcomeStep({ onNext, onSkip }) {
  return (
    <div className="flex flex-col items-center text-center space-y-8">
      {/* Dynamic welcome illustration */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Glowing background */}
        <div className="absolute inset-0 bg-primary-500/10 rounded-full blur-2xl animate-pulse-slow" />
        
        {/* Floating Invoice */}
        <motion.div
          animate={floatAnimation}
          className="relative z-10 p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl w-32"
        >
          <FileCode className="h-8 w-8 text-primary-500 mb-2 mx-auto" />
          <div className="h-2 w-16 bg-gray-200 dark:bg-slate-800 rounded mx-auto mb-1.5" />
          <div className="h-1.5 w-12 bg-gray-150 dark:bg-slate-800 rounded mx-auto" />
        </motion.div>

        {/* Orbit Node */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 border border-dashed border-primary-500/30 rounded-full"
        >
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50" />
        </motion.div>
      </div>

      {/* Copy */}
      <div className="space-y-3">
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
          Welcome to Invoice2Credit AI
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
          Let's personalize your invoice financing experience in less than one minute.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-center w-full max-w-xs pt-4 mx-auto">
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2"
        >
          <span>Get Started</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </motion.button>
      </div>
    </div>
  );
}
