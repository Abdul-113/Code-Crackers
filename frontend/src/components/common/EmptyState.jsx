import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({ 
  icon: Icon = HelpCircle, 
  title = 'No records found', 
  desc = 'There is currently no data to display in this section.', 
  actionLabel, 
  onAction 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-150 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-dark-card/20 backdrop-blur-sm space-y-4"
    >
      <div className="h-12 w-12 rounded-2xl bg-gray-50 dark:bg-slate-900 flex items-center justify-center text-gray-400 dark:text-gray-600">
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-1 max-w-xs">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{title}</h4>
        <p className="text-[11px] text-gray-500 leading-normal">{desc}</p>
      </div>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition shadow-md shadow-primary-500/10"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}
