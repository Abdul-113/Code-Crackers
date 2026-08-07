import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, CheckCircle2, Loader2 } from 'lucide-react';

const SETUP_STEPS = [
  'Configuring AI Risk Engine',
  'Preparing Invoice Intelligence',
  'Connecting Blockchain Network',
  'Initializing Smart Contracts',
  'Building Financial Profile'
];

export default function AISetupStep({ onNext }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= SETUP_STEPS.length) {
      const timeout = setTimeout(() => {
        onNext();
      }, 1000);
      return () => clearTimeout(timeout);
    }

    const interval = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 1500);

    return () => clearTimeout(interval);
  }, [currentStep, onNext]);

  return (
    <div className="space-y-8 flex flex-col justify-center items-center py-6">
      
      {/* Visual Header */}
      <div className="text-center space-y-2">
        <div className="relative mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg text-white mb-6">
          <Cpu className="h-7 w-7 animate-pulse" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
          AI Personalization
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Invoice2Credit intelligence engines are compiling your platform credentials.
        </p>
      </div>

      {/* Stepper Checklist */}
      <div className="w-full max-w-sm space-y-4">
        {SETUP_STEPS.map((step, idx) => {
          const active = idx === currentStep;
          const done = idx < currentStep;

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: done || active ? 1 : 0.4, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center justify-between p-4 rounded-xl border transition ${
                active 
                  ? 'border-indigo-200 bg-indigo-50/20 dark:border-indigo-900/30 dark:bg-indigo-950/20' 
                  : done 
                  ? 'border-success-500/20 bg-success-500/5 dark:bg-success-500/10'
                  : 'border-transparent bg-transparent'
              }`}
            >
              <span className={`text-xs font-bold leading-none ${active ? 'text-indigo-600 dark:text-indigo-400' : done ? 'text-success-600 dark:text-success-400' : 'text-gray-400'}`}>
                {step}
              </span>
              
              {done ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-success-500 flex-shrink-0" />
              ) : active ? (
                <Loader2 className="h-4.5 w-4.5 text-indigo-500 animate-spin flex-shrink-0" />
              ) : (
                <div className="h-4.5 w-4.5 rounded-full border border-gray-150 dark:border-slate-800 flex-shrink-0" />
              )}
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
