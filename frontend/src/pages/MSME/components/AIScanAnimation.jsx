import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

const SCAN_TASKS = [
  'Reading Invoice Billing Text',
  'Extracting Line Items & Details',
  'Identifying Buyer Risk Profiles',
  'Detecting GST Registration Details',
  'Calculating Maturities & Yields',
  'Checking Financial Ledger Health',
  'Preparing DeFi Financing Profile'
];

export default function AIScanAnimation({ file, onNext }) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);

  // Trigger real backend API analysis call
  useEffect(() => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:8000/api/ai/analyze", {
      method: "POST",
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error("AI analysis failed.");
        return res.json();
      })
      .then(data => {
        setApiData(data);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      });
  }, [file]);

  useEffect(() => {
    if (taskIndex >= SCAN_TASKS.length) {
      if (apiData || error) {
        const timeout = setTimeout(() => {
          onNext(apiData);
        }, 800);
        return () => clearTimeout(timeout);
      }
      return;
    }

    const timer = setTimeout(() => {
      setTaskIndex(prev => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [taskIndex, apiData, error, onNext]);

  return (
    <div className="space-y-8 flex flex-col justify-center items-center py-6">
      
      {/* Scanner Visual Container */}
      <div className="relative w-48 h-48 rounded-3xl border border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30 overflow-hidden flex items-center justify-center shadow-inner">
        <Sparkles className="h-10 w-10 text-primary-500 animate-pulse" />
        
        {/* Animated Scanner Beam Line */}
        <motion.div
          animate={{ y: [-72, 72, -72] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent shadow-glow-blue z-10"
        />
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
          AI Invoice Extraction
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Running OCR and context scoring models on billing documentation.
        </p>
      </div>

      {/* Task Checklist */}
      <div className="w-full max-w-md space-y-3.5">
        {SCAN_TASKS.map((task, idx) => {
          const active = idx === taskIndex;
          const done = idx < taskIndex;

          return (
            <motion.div
              key={task}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: done || active ? 1 : 0.4, x: 0 }}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                active 
                  ? 'border-primary-200 bg-primary-50/20 dark:border-primary-950/20' 
                  : done 
                  ? 'border-success-500/20 bg-success-500/5 dark:bg-success-500/10'
                  : 'border-transparent bg-transparent'
              }`}
            >
              <span className={`text-xs font-semibold leading-none ${active ? 'text-primary-600 dark:text-primary-400' : done ? 'text-success-600 dark:text-success-400' : 'text-gray-400'}`}>
                {task}
              </span>
              
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-success-500 flex-shrink-0" />
              ) : active ? (
                <Loader2 className="h-4 w-4 text-primary-500 animate-spin flex-shrink-0" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-gray-150 dark:border-slate-800 flex-shrink-0" />
              )}
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
