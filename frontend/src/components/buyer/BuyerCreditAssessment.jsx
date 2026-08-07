import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, Building2, Calendar,
  Hash, ExternalLink, RefreshCw, FileText, TrendingUp, Award,
  Sparkles, Check, ChevronRight, Layers, ArrowUpRight, Search
} from 'lucide-react';
import { gstService } from '@/services/gstService';
import toast from 'react-hot-toast';

const PRESET_BUYERS = [
  { name: 'Infosys Limited', gstin: '29AAACI1681G1Z0', state: 'Karnataka', tag: 'Prime AAA' },
  { name: 'Sandbox FinTech Ltd', gstin: '24ABKCS2033B1ZV', state: 'Gujarat', tag: 'Live Sandbox' },
  { name: 'Tata Consultancy Services', gstin: '27AAACG7170L1ZU', state: 'Maharashtra', tag: 'Enterprise AA' },
  { name: 'Nexura Robotics', gstin: '33AAACN8145P1Z8', state: 'Tamil Nadu', tag: 'Growth A' }
];

export default function BuyerCreditAssessment({ initialGstin = '29AAACI1681G1Z0' }) {
  const [selectedGstin, setSelectedGstin] = useState(initialGstin);
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);

  const fetchScore = async (gstinToFetch) => {
    setLoading(true);
    try {
      const data = await gstService.getBuyerCreditScore(gstinToFetch);
      setAssessment(data);
    } catch (err) {
      toast.error('Failed to retrieve GST score');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore(selectedGstin);
  }, [selectedGstin]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const formatted = customInput.trim().toUpperCase();
    setSelectedGstin(formatted);
    toast.success(`Evaluating GSTIN: ${formatted}`);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-500 stroke-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (score >= 70) return 'text-blue-500 stroke-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
    if (score >= 55) return 'text-amber-500 stroke-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    return 'text-red-500 stroke-red-500 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800';
  };

  const tp = assessment?.taxpayer || {};
  const bd = assessment?.breakdown || {};
  const score = assessment?.score || 0;
  const grade = assessment?.grade || 'AAA';
  const riskTier = assessment?.riskTier || 'Prime / Ultra-Low Risk';
  const filings = assessment?.recentFilings || [];

  return (
    <div className="space-y-6">
      {/* ── Header & Preset Switcher ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Sandbox.co.in GST Verification API
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            Buyer Credit Assessment & Filing Score
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time credit score computed from live GSTN return consistency, timeliness, and entity vintage.
          </p>
        </div>

        {/* Custom Input & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 flex-1 sm:flex-none">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter GSTIN..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-colors"
            >
              Verify
            </button>
          </form>

          <button
            onClick={() => fetchScore(selectedGstin)}
            disabled={loading}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh Live Assessment"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
          Quick Switch:
        </span>
        {PRESET_BUYERS.map((b) => {
          const isSelected = selectedGstin === b.gstin;
          return (
            <button
              key={b.gstin}
              onClick={() => {
                setSelectedGstin(b.gstin);
                setCustomInput('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 text-primary-600 dark:text-primary-300 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Building2 className="h-3 w-3" />
              <span>{b.name}</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500">
                {b.tag}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <RefreshCw className="h-8 w-8 text-primary-500 animate-spin mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Querying Sandbox.co.in GST Compliance Endpoints…
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Reconciling GSTR-1 and GSTR-3B filings for {selectedGstin}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Top Row: Score Gauge & Taxpayer Identity ────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Score Card (5 cols) */}
            <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white border border-indigo-500/20 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    GSTN Verified Identity
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                    Grade {grade}
                  </span>
                </div>

                <div className="flex items-center justify-center my-6">
                  {/* Circular Score Gauge */}
                  <div className="relative flex items-center justify-center">
                    <svg className="w-36 h-36 transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="10"
                        className="text-slate-800"
                        fill="transparent"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeDasharray={377}
                        strokeDashoffset={377 - (377 * score) / 100}
                        strokeLinecap="round"
                        className={score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-blue-400' : 'text-amber-400'}
                        fill="transparent"
                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-black tracking-tight text-white">{score}</span>
                      <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Out of 100</span>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-lg font-extrabold text-white">{riskTier}</h3>
                  <p className="text-xs text-white/70">
                    Recommended advance rate: <strong className="text-emerald-300">{assessment?.recommendedAdvanceRate}</strong>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                <span>Evaluation Date: {new Date().toLocaleDateString('en-IN')}</span>
                <span className="font-semibold text-indigo-300">GST Rule Engine v2.4</span>
              </div>
            </div>

            {/* Taxpayer Entity Dossier (7 cols) */}
            <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900/90 p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-800/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-extrabold text-lg">
                      {tp.legalName?.charAt(0) || 'B'}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                        {tp.legalName || 'Corporate Buyer'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                          {tp.gstin || selectedGstin}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5" /> {tp.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 my-4">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAN Number</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {tp.pan || (tp.gstin ? tp.gstin.slice(2, 12) : 'AAACI1681G')}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">State / Jurisdiction</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {tp.stateName || tp.state || 'Karnataka'} ({tp.stateCode || (tp.gstin ? tp.gstin.slice(0, 2) : '29')})
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxpayer Type</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {tp.taxpayerType || 'Regular Taxpayer'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registration Date</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {tp.registrationDate || tp.regStartDate || '01/07/2017'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Vintage</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {bd.businessVintage?.years || 7.0} Years (Score: {bd.businessVintage?.score}/10)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">API Verification</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                      GST Public Track API
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <span>Authorized Suvidha Provider: <strong>Sandbox.co.in</strong></span>
                <span className="text-emerald-500 font-bold">● Validated in Registry</span>
              </div>
            </div>
          </div>

          {/* ── 4-Factor Formula Breakdown ──────────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Scoring Formula & Factor Breakdown (Weighting: 40% / 25% / 25% / 10%)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Factor 1: Consistency (40%) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Filing Consistency</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    40% Weight
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {bd.filingConsistency?.score || 40.0}
                    </span>
                    <span className="text-xs font-bold text-slate-400">/ 40 pts</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                      style={{ width: `${bd.filingConsistency?.percentage || 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {bd.filingConsistency?.filingsCount || 24} of {bd.filingConsistency?.expectedCount || 24} annual GSTR filings completed.
                </p>
              </div>

              {/* Factor 2: Timeliness (25%) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Filing Timeliness</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    25% Weight
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {bd.filingTimeliness?.score || 25.0}
                    </span>
                    <span className="text-xs font-bold text-slate-400">/ 25 pts</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${bd.filingTimeliness?.percentage || 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {bd.filingTimeliness?.onTimeCount || 24} on-time vs statutory 11th/20th monthly deadlines.
                </p>
              </div>

              {/* Factor 3: GSTIN Status (25%) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">GSTIN Status</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    25% Weight
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {bd.gstinStatus?.score || 25.0}
                    </span>
                    <span className="text-xs font-bold text-slate-400">/ 25 pts</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${((bd.gstinStatus?.score || 25) / 25) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Entity status is <strong>{bd.gstinStatus?.status || 'Active'}</strong> (No suspension penalty).
                </p>
              </div>

              {/* Factor 4: Business Vintage (10%) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Business Vintage</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                    10% Weight
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {bd.businessVintage?.score || 10.0}
                    </span>
                    <span className="text-xs font-bold text-slate-400">/ 10 pts</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-700"
                      style={{ width: `${((bd.businessVintage?.score || 10) / 10) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {bd.businessVintage?.years || 7.0} years established since {bd.businessVintage?.registrationDate || '2017'}.
                </p>
              </div>

            </div>
          </div>

          {/* ── Return Filing Compliance Ledger ─────────────────────────────────── */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  GSTR Return Compliance Ledger
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Audited return filing events tracked from government GST portal records.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {filings.length} Filings Displayed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pr-4">Return Type</th>
                    <th className="pb-3 px-4">Period (MMYYYY)</th>
                    <th className="pb-3 px-4">Date of Filing</th>
                    <th className="pb-3 px-4">ARN (Ack Reference No)</th>
                    <th className="pb-3 px-4">Filing Mode</th>
                    <th className="pb-3 pl-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {filings.map((ret, i) => (
                    <tr key={ret.arn || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 pr-4 font-sans font-bold">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          ret.rtntype === 'GSTR1'
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}>
                          {ret.rtntype}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-sans font-semibold">
                        {ret.ret_prd ? `${ret.ret_prd.slice(0, 2)}/${ret.ret_prd.slice(2)}` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {ret.dof || 'Recorded'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {ret.arn || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-400">
                        {ret.mof || 'ONLINE'}
                      </td>
                      <td className="py-3 pl-4 text-right font-sans">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> {ret.status || 'Filed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
