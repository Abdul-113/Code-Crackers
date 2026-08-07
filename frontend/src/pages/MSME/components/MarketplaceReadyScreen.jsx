import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Home, Landmark } from 'lucide-react';

export default function MarketplaceReadyScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center text-center space-y-8 py-6">
      
      {/* Celebration animation circle */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [1, 1.15, 1], opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 h-20 w-20 rounded-full bg-success-500 flex items-center justify-center text-white shadow-xl shadow-success-500/25"
        >
          <CheckCircle2 className="h-10 w-10" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-success-500/30 blur-md pointer-events-none"
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
          Invoice Ready For Financing
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
          Your verified invoice token is now listed on the Polygon auction marketplace for investors to fund.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md pt-4">
        <motion.button
          onClick={() => navigate('/app/marketplace')}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold text-sm transition shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2"
        >
          <Landmark className="h-4.5 w-4.5" />
          <span>Go to Marketplace</span>
        </motion.button>
        
        <motion.button
          onClick={() => navigate('/app/dashboard')}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 px-6 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center justify-center gap-2"
        >
          <Home className="h-4.5 w-4.5" />
          <span>Back to Dashboard</span>
        </motion.button>
      </div>

    </div>
  );
}
