import React from 'react';
import { motion } from 'framer-motion';

const WIZARD_STEPS = [
  'Upload',
  'Scan',
  'Review',
  'GST Verification',
  'Duplicate Check',
  'AI Audit',
  'Mint NFT',
  'Ready'
];

export default function WizardStepper({ step }) {
  return (
    <div className="w-full space-y-4 mb-8">
      {/* Percentage line indicator */}
      <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        <span>Invoice Tokenization Pipeline</span>
        <span className="text-primary-500">Step {step} of {WIZARD_STEPS.length}</span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
        <motion.div 
          className="h-full rounded-full bg-gradient-to-r from-primary-500 via-indigo-500 to-emerald-500 shadow-glow-blue"
          animate={{ width: `${(step / WIZARD_STEPS.length) * 100}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      {/* Label Steps */}
      <div className="hidden md:grid grid-cols-8 gap-1 text-center">
        {WIZARD_STEPS.map((label, idx) => {
          const active = idx + 1 === step;
          const done = idx + 1 < step;
          return (
            <div 
              key={label}
              className={`text-[9px] font-bold uppercase tracking-wider truncate transition ${
                active 
                  ? 'text-primary-600 dark:text-primary-400 scale-105' 
                  : done 
                  ? 'text-emerald-500' 
                  : 'text-gray-400 dark:text-gray-600'
              }`}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
