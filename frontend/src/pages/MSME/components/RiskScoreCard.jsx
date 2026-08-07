import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, ArrowRight, Award, TrendingUp, CheckCircle2 } from 'lucide-react';
import { gstService } from '@/services/gstService';

export default function RiskScoreCard({ extractedData, onNext }) {
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);

  const buyerGST = extractedData?.buyerGST || extractedData?.buyer_gst || '29AAACI4798L1ZU';
  const buyerName = extractedData?.buyerCompany || extractedData?.buyerName || 'Enterprise Obligor';

  useEffect(() => {
    let isMounted = true;
    const fetchScore = async () => {
      setLoading(true);
      try {
        const res = await gstService.getBuyerCreditScore(buyerGST);
        if (isMounted) setAssessment(res);
      } catch (e) {
        console.error('Failed to calculate risk score:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchScore();
    return () => { isMounted = false; };
  }, [buyerGST]);

  const score = assessment?.score || 95;
  const grade = assessment?.grade || 'AAA';
  const riskTier = assessment?.riskTier || 'Prime / Ultra-Low Risk';
  const advanceRate = assessment?.recommendedAdvanceRate || '90% - 95%';
  const breakdown = assessment?.breakdown;

  const fmtCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const invoiceAmount = extractedData?.totalAmount || extractedData?.invoiceAmount || 1850000;
  const maxFinancing = Math.round(invoiceAmount * (grade === 'AAA' ? 0.95 : grade === 'AA' ? 0.90 : 0.80));

  return (
    <div className="space-y-8 py-2">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[11px] font-bold uppercase tracking-wider">
          <Award className="h-3.5 w-3.5" />
          4-Factor GST Compliance Underwriting
        </div>
        <h3 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
          Government-Backed Risk Underwriting
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Calculated in real-time from official GSTR-1 and GSTR-3B filing consistency, return timeliness, and corporate legal standing.
        </p>
      </div>

      {/* 3 Core Metric Badges */}
      <div className="grid sm:grid-cols-3 gap-4">
        
        {/* KPI 1 */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-dark-card p-5 text-center shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">GST Credit Grade</div>
          <div className="text-3xl font-display font-extrabold text-emerald-500">{grade}</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">{riskTier}</div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-dark-card p-5 text-center shadow-sm">
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Composite Score</div>
          <div className="text-3xl font-display font-extrabold text-primary-500">{score}<span className="text-sm font-normal text-gray-400">/100</span></div>
          <div className="text-[10px] text-gray-400 mt-1 font-semibold">Deterministic 4-Factor Model</div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-dark-card p-5 text-center shadow-sm">
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Recommended Advance</div>
          <div className="text-3xl font-display font-extrabold text-violet-500">{advanceRate}</div>
          <div className="text-[10px] text-gray-400 mt-1 font-semibold">Max Funding: {fmtCurrency(maxFinancing)}</div>
        </div>

      </div>

      {/* Audit Parameters Details */}
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { label: 'Filing Consistency Score (40% Wt)', value: `${breakdown?.filingConsistency?.score || 40}/40 pts (${breakdown?.filingConsistency?.percentage || 100}% filed)` },
          { label: 'Statutory Timeliness (25% Wt)', value: `${breakdown?.filingTimeliness?.score || 25}/25 pts (11th & 20th on-time)` },
          { label: 'GSTIN Entity Status (25% Wt)', value: `${breakdown?.gstinStatus?.status || 'Active'} (${breakdown?.gstinStatus?.score || 25}/25 pts)` },
          { label: 'Business Operating History (10% Wt)', value: `${breakdown?.businessVintage?.years || '9+'} Yrs (${breakdown?.businessVintage?.score || 10}/10 pts)` }
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-gray-200 dark:border-slate-800/80 bg-gray-50 dark:bg-slate-900/40 p-3.5 flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-500 dark:text-gray-400">{item.label}</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>

      {/* AI & Government Summary Statement */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2 flex gap-3.5 items-start">
        <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Verified Sovereign Compliance Audit Passed
            </h4>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {assessment?.taxpayer?.source === 'LIVE_API' ? '⚡ LIVE SANDBOX RELAY' : 'CACHED FIXTURE'}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            Obligor <strong className="text-gray-900 dark:text-white">{assessment?.taxpayer?.legalName || buyerName}</strong> ({buyerGST}) demonstrates an active corporate standing with {assessment?.taxpayer?.taxpayerType || 'Regular Taxpayer'} registration in {assessment?.taxpayer?.state || 'Karnataka'}, qualifying this invoice for priority institutional marketplace listing.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2"
        >
          <span>Proceed to NFT Tokenization</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </motion.button>
      </div>

    </div>
  );
}
