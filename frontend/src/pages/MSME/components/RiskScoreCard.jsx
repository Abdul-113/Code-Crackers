import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, ArrowRight } from 'lucide-react';

export default function RiskScoreCard({ onNext }) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
          AI Risk Assessment
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Groq AI risk model audits creditworthiness and buyer repayment yields.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        
        {/* KPI 1 */}
        <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-dark-card p-5 text-center shadow-sm">
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">AI Risk Grade</div>
          <div className="text-3xl font-display font-extrabold text-success-500">A+</div>
          <div className="text-[10px] text-gray-400 mt-1 font-semibold">Low Default Probability</div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-dark-card p-5 text-center shadow-sm">
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Repayment Rate</div>
          <div className="text-3xl font-display font-extrabold text-primary-500">98.4%</div>
          <div className="text-[10px] text-gray-400 mt-1 font-semibold">Historical Buyer Match</div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-dark-card p-5 text-center shadow-sm">
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Recommended Yield</div>
          <div className="text-3xl font-display font-extrabold text-violet-500">8.2%</div>
          <div className="text-[10px] text-gray-400 mt-1 font-semibold">Optimal Bidding APY</div>
        </div>

      </div>

      {/* Audit Parameters Details */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: 'Financing Limit Available', value: '₹9,45,000' },
          { label: 'Investor Interest Level', value: 'High Demand' },
          { label: 'Tata Motors Group Payment History', value: 'Excellent' },
          { label: 'Projected Settlement Horizon', value: '60 Days' }
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-gray-100 dark:border-slate-800/80 bg-gray-50/30 dark:bg-slate-900/10 p-3.5 flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-400 dark:text-gray-500">{item.label}</span>
            <span className="font-bold text-gray-800 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>

      {/* AI Summary Statement */}
      <div className="rounded-2xl border border-primary-100 dark:border-primary-950 bg-primary-50/30 dark:bg-primary-950/20 p-5 space-y-2 flex gap-4">
        <Sparkles className="h-6 w-6 text-primary-500 dark:text-primary-400 flex-shrink-0" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">AI Audit Summary</h4>
          <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            This invoice belongs to a reliable buyer with a strong payment history. AI predicts a high likelihood of repayment, making it attractive for investors.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2"
        >
          <span>Proceed to Tokenization</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </motion.button>
      </div>

    </div>
  );
}
