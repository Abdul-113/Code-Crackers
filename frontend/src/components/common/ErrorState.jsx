import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ErrorState({ 
  title = 'An error occurred', 
  desc = 'Failed to retrieve platform data. Please check your network and retry.', 
  onRetry 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-8 border border-rose-100 dark:border-rose-950 rounded-2xl bg-rose-50/20 dark:bg-rose-950/5 backdrop-blur-sm space-y-4"
    >
      <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="space-y-1 max-w-xs">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{title}</h4>
        <p className="text-[11px] text-gray-500 leading-normal">{desc}</p>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Action</span>
        </button>
      )}
    </motion.div>
  );
}
