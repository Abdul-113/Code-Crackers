import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';

const LOG_ITEMS = [
  { text: 'Hashing invoice parameters: MD5(INV-2026-089)', delay: 500 },
  { text: 'Generated SHA-256 Checksum: 8f4c2e...88ab', delay: 1000 },
  { text: 'Scanning registry: Polygon smart contracts', delay: 1800 },
  { text: 'Querying: Central double-financing registry', delay: 2400 },
];

export default function DuplicateCheckAnimation({ onNext }) {
  const [logs, setLogs] = useState([]);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    LOG_ITEMS.forEach((item) => {
      setTimeout(() => {
        setLogs(prev => [...prev, item.text]);
      }, item.delay);
    });

    setTimeout(() => {
      setComplete(true);
    }, 3200);
  }, []);

  return (
    <div className="space-y-8 flex flex-col justify-center items-center py-6">
      
      {/* Visual Hash Comparison Box */}
      <div className="relative w-full max-w-sm rounded-2xl border border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30 p-6 font-mono text-[10px] space-y-2 select-none overflow-hidden h-36">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="text-gray-400 dark:text-gray-600 border-b border-gray-100 dark:border-slate-800 pb-2 flex justify-between font-sans font-bold">
          <span>Double-Financing Audit Log</span>
          <span className={complete ? 'text-success-500' : 'text-primary-500 animate-pulse'}>
            {complete ? 'Idle' : 'Running...'}
          </span>
        </div>
        <div className="space-y-1.5 max-h-24 overflow-y-auto pt-2">
          {logs.map((log, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, x: -5 }} 
              animate={{ opacity: 1, x: 0 }}
              className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5"
            >
              <span className="text-primary-500 font-bold">&gt;</span>
              <span>{log}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
          {complete ? 'No Duplicates Found' : 'Auditing Double-Financing'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {complete ? 'This invoice hasn\'t been financed on Polygon networks.' : 'Comparing hashes across smart contracts and bank registries.'}
        </p>
      </div>

      {complete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-6"
        >
          <div className="flex items-center gap-2 rounded-xl bg-success-500/10 border border-success-500/30 px-4 py-2 text-success-600 dark:text-success-400 font-semibold text-xs">
            <ShieldCheck className="h-4 w-4" />
            <span>Audit Passed: Unique Invoice Checksum</span>
          </div>

          <motion.button
            onClick={onNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto py-3.5 px-10 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2"
          >
            <span>Proceed to AI Financing Audit</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </motion.button>
        </motion.div>
      )}

    </div>
  );
}
