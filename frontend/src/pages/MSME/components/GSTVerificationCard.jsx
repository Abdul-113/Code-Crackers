import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function GSTVerificationCard({ onNext }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 flex flex-col justify-center items-center py-6">
      
      {/* Verification Shield Animation */}
      <div className="relative">
        <motion.div
          animate={loading ? { scale: [1, 1.1, 1], rotate: 360 } : { scale: 1 }}
          transition={loading ? { duration: 2, repeat: Infinity } : { duration: 0.5 }}
          className={`h-20 w-20 rounded-full flex items-center justify-center text-white shadow-lg ${
            loading 
              ? 'bg-primary-600 shadow-primary-500/20' 
              : 'bg-success-500 shadow-success-500/25'
          }`}
        >
          <ShieldCheck className="h-10 w-10" />
        </motion.div>
        
        {!loading && (
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-success-500/30 blur-sm pointer-events-none"
          />
        )}
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
          {loading ? 'Government GST Handshake' : 'GST Record Verified'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? 'Syncing details with public tax databases...' : 'Tax registration matches invoice record.'}
        </p>
      </div>

      {/* Verification indicators */}
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30 p-6 space-y-4">
        {[
          { label: 'E-Way Billing Registry Match', ok: !loading },
          { label: 'Corporate GSTIN Validation', ok: !loading },
          { label: 'Tata Motors Corporate Profile Match', ok: !loading },
          { label: 'Declared Tax Amount Verification', ok: !loading }
        ].map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-600 dark:text-gray-400">{item.label}</span>
            {item.ok ? (
              <span className="text-[10px] font-bold text-success-500 uppercase tracking-wider">Matched ✓</span>
            ) : (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider animate-pulse">Checking...</span>
            )}
          </div>
        ))}
      </div>

      {!loading && (
        <motion.button
          onClick={onNext}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs py-3.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2"
        >
          <span>Run Double-Financing Audit</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </motion.button>
      )}

    </div>
  );
}
