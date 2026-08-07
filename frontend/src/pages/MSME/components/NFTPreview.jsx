import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hexagon, CheckCircle2, ArrowRight, Layers, FileCode, Landmark } from 'lucide-react';

const STEPS = [
  { label: 'Serializing invoice variables...', icon: FileCode },
  { label: 'Signing transaction hashes...', icon: Layers },
  { label: 'Minting ERC-721 token...', icon: Hexagon },
  { label: 'Adding block to chain...', icon: Landmark }
];

export default function NFTPreview({ onNext }) {
  const [activeStep, setActiveStep] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (activeStep >= STEPS.length) {
      setComplete(true);
      return;
    }
    const timer = setTimeout(() => {
      setActiveStep(prev => prev + 1);
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeStep]);

  return (
    <div className="space-y-8 flex flex-col justify-center items-center py-6">
      
      {/* Visual Tokenizing Card Box */}
      <div className="relative w-56 h-56 rounded-3xl border border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30 flex items-center justify-center overflow-hidden shadow-inner">
        <motion.div
          animate={complete ? { rotateY: 360 } : { rotate: 360 }}
          transition={complete ? { duration: 2, repeat: Infinity, ease: 'linear' } : { duration: 10, repeat: Infinity, ease: 'linear' }}
          className={`h-24 w-24 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-xl ${
            complete ? 'shadow-primary-500/35' : 'shadow-none'
          }`}
        >
          <Hexagon className="h-10 w-10" />
        </motion.div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
          {complete ? 'Invoice Tokenized' : 'Tokenizing Invoice'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {complete ? 'ERC-721 asset successfully minted on Polygon.' : 'Converting verified invoice records to digital smart contract tokens.'}
        </p>
      </div>

      {/* Checklist progress */}
      {!complete ? (
        <div className="w-full max-w-xs space-y-3">
          {STEPS.map((step, idx) => {
            const active = idx === activeStep;
            const done = idx < activeStep;
            return (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className={`font-semibold ${active ? 'text-primary-500 font-bold' : done ? 'text-success-500' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-success-500" />
                ) : active ? (
                  <div className="h-4 w-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-gray-200 dark:border-slate-800" />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6 flex flex-col items-center"
        >
          <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-dark-card p-5 w-full space-y-3.5 shadow-sm text-xs">
            {[
              { label: 'Token Asset ID', value: 'ERC721-INV-0089' },
              { label: 'Blockchain Network', value: 'Polygon Amoy' },
              { label: 'Owner Address', value: '0x32bF...94dE (You)' },
              { label: 'DeFi Security status', value: 'Ready for Auction' }
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="font-semibold text-gray-400 dark:text-gray-500">{item.label}</span>
                <span className="font-bold text-gray-800 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>

          <motion.button
            onClick={onNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-xs py-3.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2"
          >
            <span>Preview Marketplace Listing</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </motion.button>
        </motion.div>
      )}

    </div>
  );
}
