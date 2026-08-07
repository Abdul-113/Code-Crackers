import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Sparkles, ShieldCheck, Cpu, Brain, 
  ArrowRight, FileDown, Share2, HelpCircle, Activity, 
  DollarSign, CheckCircle2, ChevronRight, BarChart3, AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import ContentContainer from '@/components/layout/ContentContainer';
import PageHeader from '@/components/layout/PageHeader';
import toast from 'react-hot-toast';

const FORECAST_DATA = [
  { name: 'Today', current: 2480000, forecast: 2480000 },
  { name: '30 Days', current: null, forecast: 2950000 },
  { name: '60 Days', current: null, forecast: 3600000 },
  { name: '90 Days', current: null, forecast: 4150000 }
];

const PERFORMANCE_DATA = [
  { name: 'Feb', volume: 800000, count: 4 },
  { name: 'Mar', volume: 1100000, count: 6 },
  { name: 'Apr', volume: 1600000, count: 9 },
  { name: 'May', volume: 2480000, count: 12 }
];

const INVESTOR_ALLOCATION = [
  { name: 'AltFin Capital', value: 45, color: '#3b82f6' },
  { name: 'Nexus Yield Fund', value: 30, color: '#8b5cf6' },
  { name: 'Retail Pool', value: 15, color: '#10b981' },
  { name: 'Alpha Arbitrage', value: 10, color: '#f59e0b' }
];

export default function Analytics() {
  const [forecastDays, setForecastDays] = useState(30);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <ContentContainer>
      {/* Page Header */}
      <PageHeader 
        title="Business Intelligence" 
        description="Monitor credit health metrics, cash projections, and AI fraud audits."
      />

      {/* SECTION 1: Analytics Hero */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Business Health Score', value: '92/100', text: 'Top 5% of Industry MSMEs', color: 'from-emerald-500 to-teal-500' },
          { label: 'AI Financial Grade', value: 'A+', text: 'Minimal default probability', color: 'from-blue-500 to-indigo-500' },
          { label: 'Monthly Growth', value: '+18.4%', text: 'Financing velocity surge', color: 'from-violet-500 to-purple-500' },
          { label: 'Funding Success Rate', value: '94.2%', text: 'High investor bidding response', color: 'from-pink-500 to-rose-500' }
        ].map((hero, idx) => (
          <div 
            key={idx} 
            className="rounded-3xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm relative overflow-hidden"
          >
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{hero.label}</span>
              <div className="text-3xl font-display font-extrabold text-gray-900 dark:text-white">{hero.value}</div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{hero.text}</p>
            </div>
            <div className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r ${hero.color}`} />
          </div>
        ))}
      </div>

      {/* SECTION 2: Financial KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Working Capital', value: '₹24,80,000', icon: DollarSign, color: 'text-blue-500' },
          { label: 'Total Funded', value: '₹18,40,000', icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Average Invoice Value', value: '₹9,45,000', icon: BarChart3, color: 'text-violet-500' },
          { label: 'Pending Settlement', value: '₹12,40,000', icon: Activity, color: 'text-amber-500' },
          { label: 'Investor Interest', value: '92.4%', icon: Brain, color: 'text-pink-500' },
          { label: 'Settlement Rate', value: '99.8%', icon: ShieldCheck, color: 'text-cyan-500' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="rounded-2xl border border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card p-5 shadow-sm space-y-2.5">
              <div className={`h-8 w-8 rounded-xl bg-gray-50 dark:bg-slate-900 flex items-center justify-center ${kpi.color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-tight">{kpi.label}</div>
                <div className="text-sm font-bold mt-0.5">{kpi.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Double Column Grid: Forecast & Charts */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left 2 Columns: Projections & Volume charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 3: Cash Flow Forecast Area Chart */}
          <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold">AI Cash Flow Forecast</h3>
                <p className="text-[10px] text-gray-400">Projection model calculates net cash values after matching active invoices.</p>
              </div>
              <div className="flex gap-1.5 text-[9px] font-bold uppercase tracking-wider">
                {[30, 60, 90].map(days => (
                  <button
                    key={days}
                    onClick={() => setForecastDays(days)}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      forecastDays === days 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400' 
                        : 'border-gray-150 dark:border-slate-800 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={FORECAST_DATA}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="forecast" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.05} strokeWidth={2} />
                  <Area type="monotone" dataKey="current" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SECTION 4: Monthly Funding Volume Bar Chart */}
          <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold">Funding Velocity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PERFORMANCE_DATA}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Sidebar: Risk, Buyers & Investors allocation */}
        <div className="space-y-8">
          
          {/* SECTION 7: Investor Allocation Pie Chart */}
          <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold">Investor Allocation</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={INVESTOR_ALLOCATION}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {INVESTOR_ALLOCATION.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              {INVESTOR_ALLOCATION.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 8: AI Insights Panel */}
          <div className="rounded-2xl border border-primary-100 dark:border-primary-950 bg-gradient-to-b from-primary-50/30 to-white dark:from-primary-950/20 dark:to-dark-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-display font-bold text-sm">AI Business Insights</h3>
            </div>
            <div className="space-y-3">
              {[
                'Your average payment settlement cycle improved by 18% this month.',
                'Tata Motors invoices are ideal for instant funding auctions due to low yield expectations.',
                'Uploading GST verified invoices has reduced verification auditing delay by 4 hours.'
              ].map((insight, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-gray-100/50 dark:border-slate-800/80 bg-white/50 dark:bg-dark-card/50 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                  {insight}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 9: Fraud Detection Metrics */}
          <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold">Security &amp; Registry Integrations</h3>
            <div className="space-y-3.5 text-xs">
              {[
                { label: 'Duplicate Check Audit', value: 'Passed (100%)', color: 'text-success-500' },
                { label: 'Polygon Hash Verification', value: 'Healthy (14/14)', color: 'text-success-500' },
                { label: 'Solidity Escrow Status', value: 'Active (8 Locked)', color: 'text-primary-500' }
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="font-semibold text-gray-400 dark:text-gray-500">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 5: Risk Heatmap Table */}
      <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-4 mb-8">
        <h3 className="text-sm font-bold">Active Risk Ledger Heatmap</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 pb-3 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-2.5">Invoice ID</th>
                <th>Buyer</th>
                <th>Risk Rating</th>
                <th>Default Probability</th>
                <th>AI Confidence Score</th>
                <th>Escrow Protected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/80">
              {[
                { id: 'INV-2026-084', buyer: 'Tata Motors Group', risk: 'A+', prob: '1.2%', conf: '99.4%', ok: 'Yes' },
                { id: 'INV-2026-085', buyer: 'Reliance Retail Ltd', risk: 'A', prob: '1.8%', conf: '98.2%', ok: 'Yes' },
                { id: 'INV-2026-086', buyer: 'Infosys Tech Corp', risk: 'A+', prob: '0.9%', conf: '99.8%', ok: 'Yes' },
                { id: 'INV-2026-087', buyer: 'Wipro Enterprises', risk: 'B+', prob: '3.4%', conf: '96.5%', ok: 'Yes' }
              ].map((item, idx) => (
                <tr key={idx} className="text-gray-700 dark:text-gray-300">
                  <td className="py-3 font-semibold">{item.id}</td>
                  <td>{item.buyer}</td>
                  <td>
                    <span className="inline-block px-2 py-0.5 rounded bg-success-500/10 text-success-500 text-[10px] font-bold">
                      {item.risk}
                    </span>
                  </td>
                  <td>{item.prob}</td>
                  <td>{item.conf}</td>
                  <td className="text-success-500 font-semibold">{item.ok}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 6: Buyer Intelligence Dashboard */}
      <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-4 mb-8">
        <h3 className="text-sm font-bold">Buyer Reliability Intelligence</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { name: 'Tata Motors Group', delay: 'Average Delay: 1.2 Days', score: '99.4%', status: 'Excellent' },
            { name: 'Reliance Retail Ltd', delay: 'Average Delay: 2.8 Days', score: '98.2%', status: 'Excellent' },
            { name: 'Infosys Tech Corp', delay: 'Average Delay: 0.8 Days', score: '99.8%', status: 'Excellent' }
          ].map((buyer, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30 space-y-1.5">
              <h4 className="font-bold text-xs text-gray-900 dark:text-white">{buyer.name}</h4>
              <div className="text-[10px] text-gray-400">{buyer.delay}</div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-emerald-500 font-bold">{buyer.status}</span>
                <span className="text-[10px] text-gray-400 font-semibold">Reliability: {buyer.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 10: Export Center */}
      <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h4 className="font-bold text-xs text-gray-900 dark:text-white">Export Finance Reports</h4>
          <p className="text-[10px] text-gray-400">Download formatted financial analytics ledgers as CSV or Excel sheets.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => toast.success('CSV Export download started.')}
            className="px-4 py-2 rounded-xl border border-gray-100 dark:border-slate-800 text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            <span>CSV Ledger</span>
          </button>
          <button 
            onClick={() => toast.success('PDF Audit summary downloaded.')}
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            <span>PDF Summary</span>
          </button>
        </div>
      </div>

    </ContentContainer>
  );
}
