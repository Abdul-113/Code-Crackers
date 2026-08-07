import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, ArrowRight, ArrowLeft } from 'lucide-react';

export default function DemoModeStep({ demoMode, onSelectDemoMode, onNext, onPrev }) {
  return (
    <div className="space-y-8 flex flex-col justify-center">
      <div className="text-center space-y-2">
        <h3 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
          Explore Mode
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose how you would like to explore the Invoice2Credit AI prototype.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 w-full">
        
        {/* Option 2: Demo Mode (Recommended) */}
        <motion.button
          onClick={() => onSelectDemoMode('demo')}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.99 }}
          className={`text-left rounded-2xl border p-6 flex gap-4 transition-all duration-300 hover:shadow-glow-blue ${
            demoMode === 'demo'
              ? 'border-primary-600 bg-primary-50/20 dark:bg-primary-950/20 shadow-lg ring-1 ring-primary-600'
              : 'border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50'
          }`}
        >
          <div className="h-11 w-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-500 to-indigo-600 shadow-md text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h4 className="font-display font-bold text-gray-900 dark:text-white text-sm">
                Demo Experience
              </h4>
              <span className="text-[9px] font-bold bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Recommended
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Pre-populates sample invoices, investor bids, analytics charts, and repayment timelines.
            </p>
          </div>
        </motion.button>

        {/* Option 1: Live Mode */}
        <motion.button
          onClick={() => onSelectDemoMode('live')}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.99 }}
          className={`text-left rounded-2xl border p-6 flex gap-4 transition-all duration-300 hover:shadow-glow-rose ${
            demoMode === 'live'
              ? 'border-primary-600 bg-primary-50/20 dark:bg-primary-950/20 shadow-lg ring-1 ring-primary-600'
              : 'border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50'
          }`}
        >
          <div className="h-11 w-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 shadow-md text-white">
            <Terminal className="h-5 w-5" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-sm">
              Fresh Sandbox
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Starts with an empty dashboard so you can upload invoices and run the system yourself.
            </p>
          </div>
        </motion.button>

      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <motion.button
          type="button"
          onClick={onPrev}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 px-6 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Back</span>
        </motion.button>

        <motion.button
          onClick={onNext}
          disabled={!demoMode}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Finish Setup</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </motion.button>
      </div>
    </div>
  );
}
