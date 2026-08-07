import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressStepper({ step, totalSteps }) {
  const percentage = (step / totalSteps) * 100;

  return (
    <div className="w-full space-y-4 mb-10">
      {/* Top Details */}
      <div className="flex justify-between items-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        <span>Personalization Flow</span>
        <span className="text-primary-500">Step {step} of {totalSteps}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-slate-800/80 overflow-hidden">
        <motion.div 
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 shadow-glow-blue"
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
