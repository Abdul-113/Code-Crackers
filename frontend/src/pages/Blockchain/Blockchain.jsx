import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Landmark, Key, Banknote, HelpCircle, 
  Cpu, Activity, CheckCircle2, ArrowRight, Layers, 
  Hexagon, Server, Search, FileDown, AlertTriangle, 
  Lock, RefreshCw, Zap, TrendingUp, Info, UserCheck,
  Copy, ExternalLink
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import ContentContainer from '@/components/layout/ContentContainer';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useInvoices } from '@/hooks/useInvoices';

// Reusable CountUp hook
function useCountUp(target, duration = 1200) {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

const ANALYTICS_DATA = [
  { name: '07/07', gas: 32 },
  { name: '07/08', gas: 28 },
  { name: '07/09', gas: 35 },
  { name: '07/10', gas: 38 },
  { name: '07/11', gas: 42 },
  { name: '07/12', gas: 39 },
  { name: '07/13', gas: 35 },
];

function statusToStages(inv) {
  const ts = inv.createdAt ? new Date(inv.createdAt).toLocaleString() : 'Unknown';
  const shortHash = (h) => h ? h.slice(0, 10) + '...' + h.slice(-6) : '—';
  return [
    {
      title: 'Invoice Uploaded',
      desc: `PDF parsed & stored — ${inv.invoiceNumber}`,
      hash: shortHash(inv.invoiceHash),
      fullHash: inv.invoiceHash,
      status: 'Completed',
      time: ts,
    },
    {
      title: 'AI Underwriting',
      desc: 'Credit risk parameters analysed by Llama 3.3 70B.',
      hash: inv.riskScore > 0 ? 'AI-GROQ-' + (inv.invoiceNumber || '').slice(-4) : '—',
      fullHash: null,
      status: inv.riskScore > 0 ? 'Completed' : 'Pending',
      time: inv.riskScore > 0 ? ts : 'Pending',
    },
    {
      title: 'Compliance Verified',
      desc: 'GST & duplicate hash checks passed.',
      hash: inv.verificationStatus === 'VERIFIED' ? shortHash(inv.invoiceHash) : '—',
      fullHash: inv.verificationStatus === 'VERIFIED' ? inv.invoiceHash : null,
      status: inv.verificationStatus === 'VERIFIED' ? 'Completed' : 'Pending',
      time: inv.verificationStatus === 'VERIFIED' ? ts : 'Pending',
    },
    {
      title: 'Marketplace Listing',
      desc: 'Invoice token offered for auction to global investors.',
      hash: inv.invoiceStatus === 'Listed' ? shortHash(inv.invoiceHash) : '—',
      fullHash: inv.invoiceStatus === 'Listed' ? inv.invoiceHash : null,
      status: inv.invoiceStatus === 'Listed' ? 'Completed' : 'Pending',
      time: inv.invoiceStatus === 'Listed' ? ts : 'Pending',
    },
  ];
}

export default function Blockchain() {
  const { currentUser } = useAuth();
  const { data: dbInvoices, isLoading } = useInvoices(currentUser?.uid || currentUser?.email);
  const invoices = dbInvoices || [];

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [activeStage, setActiveStage] = useState(null);

  const blockCount = useCountUp(18492021);

  const selectedInvoice = invoices.find(i => i.invoiceId === selectedInvoiceId) || invoices[0];
  const stages = selectedInvoice ? statusToStages(selectedInvoice) : [];

  const auditTrail = invoices.slice(0, 5).map(inv => ({
    event: inv.invoiceStatus === 'Listed'
      ? 'Invoice Listed on Marketplace'
      : inv.verificationStatus === 'VERIFIED'
      ? 'Compliance Verified'
      : 'Invoice Uploaded',
    actor: inv.invoiceStatus === 'Listed'
      ? 'Marketplace Engine'
      : inv.verificationStatus === 'VERIFIED'
      ? 'Verification Service'
      : 'MSME Portal',
    time: inv.createdAt ? new Date(inv.createdAt).toLocaleString() : 'Unknown',
    hash: inv.invoiceHash ? inv.invoiceHash.slice(0, 10) + '...' + inv.invoiceHash.slice(-6) : '—',
    fullHash: inv.invoiceHash,
  }));

  const handleCopy = (txt) => {
    if (!txt || txt === '—') return;
    navigator.clipboard.writeText(txt);
    toast.success('Copied to clipboard.');
  };

  return (
    <ContentContainer>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b border-gray-100 dark:border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
            Blockchain Explorer
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track every blockchain event from invoice upload to final settlement.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-success-100 dark:border-success-950 bg-success-50 dark:bg-success-950/20 text-success-600 dark:text-success-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-success-500 animate-ping" />
            <span>Polygon Amoy Testnet: Live</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full border border-gray-150 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-400 font-semibold">
            Gas Fee: <span className="text-primary-500">35 Gwei</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full border border-gray-150 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-400 font-semibold">
            Block: <span className="text-indigo-500">#{blockCount}</span>
          </div>
        </div>
      </div>

      {/* Invoice selector tabs */}
      {invoices.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Invoice:</span>
          {invoices.map(inv => (
            <button
              key={inv.invoiceId}
              onClick={() => { setSelectedInvoiceId(inv.invoiceId); setActiveStage(null); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                selectedInvoice?.invoiceId === inv.invoiceId
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-slate-800 text-gray-500 hover:border-primary-400'
              }`}
            >
              {inv.invoiceNumber}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center min-h-[200px] gap-3 text-gray-400">
          <Activity className="h-6 w-6 animate-spin text-primary-500" />
          <span className="text-xs">Loading blockchain records…</span>
        </div>
      )}

      {!isLoading && invoices.length === 0 && (
        <div className="text-center py-16 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl text-gray-400 text-xs">
          No invoices found. Upload an invoice from the MSME Portal to see blockchain activity here.
        </div>
      )}

      {!isLoading && selectedInvoice && (
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left 2 cols */}
          <div className="lg:col-span-2 space-y-8">

            {/* Journey Timeline */}
            <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary-500" />
                <h3 className="font-display font-bold text-sm">
                  Invoice Journey — {selectedInvoice.invoiceNumber}
                </h3>
              </div>

              <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-gray-100 dark:before:bg-slate-800">
                {stages.map((stage, idx) => {
                  const completed = stage.status === 'Completed';
                  const isActive = activeStage === idx;
                  return (
                    <div key={idx} className="relative group cursor-pointer" onClick={() => setActiveStage(isActive ? null : idx)}>
                      <div className={`absolute -left-[23px] h-3.5 w-3.5 rounded-full border-2 bg-white dark:bg-dark-card ${completed ? 'border-success-500' : 'border-gray-200 dark:border-slate-700'}`}>
                        {completed && <div className="h-1.5 w-1.5 rounded-full bg-success-500 m-auto mt-[2px]" />}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`font-bold ${completed ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>
                          {stage.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${completed ? 'text-success-500 bg-success-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                          {completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{stage.desc}</p>
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30 text-[10px] font-mono space-y-2 overflow-hidden"
                          >
                            <div className="flex justify-between">
                              <span className="text-gray-400">Hash:</span>
                              <span className="text-primary-500 font-bold hover:underline cursor-pointer flex items-center gap-1" onClick={() => handleCopy(stage.fullHash || stage.hash)}>
                                {stage.hash} <Copy className="h-3 w-3" />
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Timestamp:</span>
                              <span className="text-gray-300">{stage.time}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Status:</span>
                              <span className={completed ? 'text-success-500 font-bold' : 'text-amber-400 font-bold'}>
                                {completed ? 'Audit Verified ✓' : 'Awaiting Completion'}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Escrow Flow */}
            <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold">Solidity Escrow Capital Flow</h3>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {['Investor Wallet', 'Escrow Vault', 'MSME Wallet', 'Buyer Repay'].map((label, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/10 w-full sm:w-28">
                    <div className="h-10 w-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 mb-2">
                      <Hexagon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Trail */}
            <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold">Immutable Ledger Audit Trail</h3>
              {auditTrail.length === 0 ? (
                <p className="text-xs text-gray-400">No audit events found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="py-2.5">Event</th>
                        <th>Actor</th>
                        <th>Timestamp</th>
                        <th>Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/80">
                      {auditTrail.map((item, idx) => (
                        <tr key={idx} className="text-gray-700 dark:text-gray-300">
                          <td className="py-3 font-semibold">{item.event}</td>
                          <td>{item.actor}</td>
                          <td className="text-gray-400">{item.time}</td>
                          <td className="text-primary-500 font-mono font-bold hover:underline cursor-pointer" onClick={() => handleCopy(item.fullHash || item.hash)}>
                            {item.hash}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-8">

            {/* NFT Certificate */}
            <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
              <h3 className="text-sm font-bold border-b border-gray-50 dark:border-slate-800 pb-3">NFT Invoice Certificate</h3>
              <div className="relative mx-auto h-40 w-40 rounded-2xl bg-gradient-to-br from-primary-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-primary-500/20">
                <Hexagon className="h-16 w-16 animate-pulse" />
                <div className="absolute bottom-3 text-[9px] font-mono tracking-widest text-primary-200">
                  {selectedInvoice.blockchainStatus || 'UNMINTED'}
                </div>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { label: 'Invoice Number', value: selectedInvoice.invoiceNumber || '—' },
                  { label: 'Network', value: 'Polygon Amoy Testnet' },
                  { label: 'NFT Status', value: selectedInvoice.blockchainStatus || 'UNMINTED' },
                  { label: 'Seller', value: selectedInvoice.sellerName || '—' },
                  {
                    label: 'Invoice Hash',
                    value: selectedInvoice.invoiceHash ? selectedInvoice.invoiceHash.slice(0, 14) + '...' : '—',
                    full: selectedInvoice.invoiceHash,
                    click: true,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center gap-2">
                    <span className="font-semibold text-gray-400 dark:text-gray-500 flex-shrink-0">{item.label}</span>
                    <span
                      className={`font-bold text-right truncate max-w-[140px] ${item.click ? 'text-primary-500 cursor-pointer font-mono hover:underline' : 'text-gray-800 dark:text-white'}`}
                      onClick={item.click ? () => handleCopy(item.full || item.value) : undefined}
                      title={item.full || item.value}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <a
                href="https://amoy.polygonscan.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-primary-500 hover:underline mt-2"
              >
                <ExternalLink className="h-3 w-3" />
                View on PolygonScan (Amoy)
              </a>
            </div>

            {/* Invoice Status */}
            <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold border-b border-gray-50 dark:border-slate-800 pb-3">Invoice Status</h3>
              <div className="p-4 rounded-xl border border-primary-100 dark:border-primary-950 bg-primary-50/20 dark:bg-primary-950/20 space-y-3.5 text-xs">
                {[
                  { label: 'Invoice Status', value: selectedInvoice.invoiceStatus || 'PENDING' },
                  { label: 'Verification', value: selectedInvoice.verificationStatus || 'PENDING' },
                  { label: 'Invoice Amount', value: selectedInvoice.invoiceAmount ? `₹${Number(selectedInvoice.invoiceAmount).toLocaleString('en-IN')}` : '—' },
                  { label: 'Due Date', value: selectedInvoice.dueDate || '—' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="font-semibold text-primary-600 dark:text-primary-400">{item.label}</span>
                    <span className="font-bold text-primary-800 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gas Chart */}
            <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
              <h3 className="text-sm font-bold mb-4">Gas Fee Levels (Gwei)</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ANALYTICS_DATA}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={9} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="gas" stroke="#6366f1" fill="#6366f1" fillOpacity={0.05} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}
    </ContentContainer>
  );
}
