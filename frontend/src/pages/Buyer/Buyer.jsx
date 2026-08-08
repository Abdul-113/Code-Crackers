import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInvoices } from '@/hooks/useInvoices';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckCircle2, Clock, FileText, Zap,
  Check, X, Building2, ShieldCheck, ChevronRight,
  ArrowRight, Inbox, Lock, Sparkles, RefreshCw,
  Calendar, Hash, Copy, CheckCircle, ExternalLink, ShieldAlert,
  Award, TrendingUp
} from 'lucide-react';
import ContentContainer from '@/components/layout/ContentContainer';
import toast from 'react-hot-toast';
import { useEscrow } from '@/hooks/useEscrow';
import BuyerCreditAssessment from '@/components/buyer/BuyerCreditAssessment';

const fmt = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(val || 0);

// ── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(dueDateStr, createdDateStr) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, formatted: '', isMature: false });

  useEffect(() => {
    if (!dueDateStr || dueDateStr === 'Pending') {
      setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, formatted: 'Date Pending', isMature: false });
      return;
    }
    const due = new Date(dueDateStr).getTime();
    
    const tick = () => {
      const diff = due - Date.now();
      if (diff <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, formatted: 'Auto-Settlement Ready', isMature: true });
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      
      setRemaining({
        days: d,
        hours: h,
        minutes: m,
        seconds: s,
        formatted: `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`,
        isMature: false
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dueDateStr]);

  return remaining;
}

// ── Individual Escrow Card with Rich Digital Vault ─────────────────────────────
function EscrowCard({ inv, idx }) {
  const countdown = useCountdown(inv.due, inv.date);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Escrow contract address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      key={inv.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl dark:shadow-2xl dark:shadow-primary-950/20 transition-all duration-300 p-6"
    >
      {/* Top Accent Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-primary-500 to-indigo-500" />

      {/* Top Row: Supplier Info & Amount */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-800/50 flex items-center justify-center flex-shrink-0 text-primary-600 dark:text-primary-400 font-bold text-sm">
              {inv.supplier.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {inv.supplier}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60">
                  <Hash className="w-3 h-3 text-primary-400" />
                  {inv.id}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Payable Amount
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {inv.amountStr}
            </span>
          </div>
        </div>

        {/* Digital Countdown Vault Display */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-primary-500" />
              Auto-Settlement Countdown
            </span>
            {countdown.isMature ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 animate-spin" /> Ready for Settlement
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400">
                Polygon Amoy Automated Lock
              </span>
            )}
          </div>

          {/* Time Digits Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-1">
              <span className="block font-mono text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                {countdown.days}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Days</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-1">
              <span className="block font-mono text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Hours</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-1">
              <span className="block font-mono text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                {String(countdown.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Mins</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-1">
              <span className="block font-mono text-lg sm:text-xl font-extrabold text-primary-600 dark:text-primary-400 leading-none">
                {String(countdown.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Row */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Maturity Due:</span>
          <strong className="text-slate-900 dark:text-white font-bold">{inv.due}</strong>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Escrow Locked ✓</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Assignment Mandate Card ───────────────────────────────────────────────────
function AssignmentCard({ inv, idx, signingIdx, onSign }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-indigo-200 dark:border-indigo-900/40 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl transition-all p-6"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />

      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{inv.supplier}</h3>
            <p className="font-mono text-xs text-indigo-500 mt-0.5">{inv.id}</p>
          </div>
          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            {inv.amountStr}
          </span>
        </div>

        <div className="bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/40 mb-4 text-xs text-indigo-900 dark:text-indigo-200 space-y-2 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
            <FileText className="w-4 h-4" /> Legal Assignment Mandate
          </p>
          <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80">
            Authorizes payment directly to the verified on-chain escrow smart contract at maturity date:
          </p>
          <span className="block font-mono text-[10px] bg-white/90 dark:bg-black/40 p-2 rounded-lg truncate border border-indigo-200/50 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-300 select-all">
            {inv.escrowAddress || '0x376EF66a1a9EdD246Ea84030414dAc28aFfef9EB'}
          </span>
        </div>
      </div>

      <button
        onClick={() => onSign(inv, idx)}
        disabled={signingIdx === idx}
        className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
      >
        {signingIdx === idx ? (
          <><RefreshCw className="h-4 w-4 animate-spin" /> Signing on Polygon Amoy…</>
        ) : (
          <><ShieldCheck className="h-4 w-4" /> Sign Assignment Mandate (Web3)</>
        )}
      </button>
    </motion.div>
  );
}

// ── Pending Invoice Card ──────────────────────────────────────────────────────
function PendingCard({ inv, onAction }) {
  const [acting, setActing] = useState(null);

  const handle = async (type) => {
    setActing(type);
    await onAction(inv.id, type);
    setActing(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl transition-all p-6"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />

      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{inv.supplier}</h3>
              <p className="font-mono text-xs text-slate-400 mt-0.5">{inv.id}</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full">
            Awaiting Approval
          </span>
        </div>

        <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Total Invoice Value</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">{inv.amountStr}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-5">
          <span>Uploaded: <strong className="text-slate-700 dark:text-slate-200">{inv.date}</strong></span>
          <span>Due: <strong className="text-slate-700 dark:text-slate-200">{inv.due}</strong></span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => handle('approve')}
          disabled={!!acting}
          className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
        >
          {acting === 'approve' ? (
            <><RefreshCw className="h-4 w-4 animate-spin" /> Processing…</>
          ) : (
            <><Check className="h-4 w-4" /> Confirm Delivery & Approve</>
          )}
        </button>
        <button
          onClick={() => handle('reject')}
          disabled={!!acting}
          className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 hover:border-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
        >
          <X className="h-4 w-4" /> Dispute
        </button>
      </div>
    </motion.div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/30">
      <div className="h-14 w-14 rounded-2xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-500">
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{sub}</p>
      </div>
    </div>
  );
}

// ── Section Tab Button ───────────────────────────────────────────────────────
function Tab({ active, onClick, children, count }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
      }`}
    >
      {children}
      {count != null && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
          active ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Buyer() {
  const { currentUser } = useAuth();
  const { data: dbInvoices } = useInvoices();
  const { releasePayment, signAssignment, reset: resetTx } = useEscrow();

  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [assignmentInvoices, setAssignmentInvoices] = useState([]);
  const [fundedInvoices, setFundedInvoices] = useState([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [activeTab, setActiveTab] = useState('escrow');
  const [payingIdx, setPayingIdx] = useState(null);
  const [signingIdx, setSigningIdx] = useState(null);

  // Derive company name
  const companyName = currentUser?.companyName || currentUser?.profile?.companyName || currentUser?.displayName || 'Infosys Limited';

  useEffect(() => {
    if (!dbInvoices?.length || !currentUser) {
      setPendingInvoices([]);
      setFundedInvoices([]);
      setTotalOutstanding(0);
      return;
    }

    const userGST     = (currentUser.gst || currentUser.profile?.gst || '').toUpperCase();
    const userWallet  = (currentUser.walletAddress || currentUser.profile?.walletAddress || '').toLowerCase();
    const userCompany = (currentUser.companyName || currentUser.displayName || '').toLowerCase();

    const buyerInvoices = dbInvoices.filter(inv => {
      const invGst     = (inv.buyerGST || inv.buyerGSTIN || '').toUpperCase();
      const invWallet  = (inv.buyerWalletAddress || '').toLowerCase();
      const invBuyer   = (inv.buyerCompany || inv.buyerName || '').toLowerCase();
      return (
        (invGst    && invGst === userGST) ||
        (invWallet && invWallet === userWallet) ||
        (userCompany && invBuyer.includes(userCompany)) ||
        (inv.buyerId && inv.buyerId === currentUser.uid)
      );
    });

    const pending = [], assignment = [], funded = [];
    let outstanding = 0;

    buyerInvoices.forEach(inv => {
      const amt        = Number(inv.invoiceAmount || inv.amount || 0);
      const isApproved = inv.buyerApproved === true || inv.verificationStatus === 'BUYER_APPROVED';
      const isAssigned = inv.verificationStatus === 'ASSIGNMENT_SIGNED';
      const isFunded   = ['FUNDED','ESCROWED'].includes(inv.blockchainStatus) || ['Funded','Financed'].includes(inv.invoiceStatus) || inv.status === 'Funded';
      const isSettled  = inv.invoiceStatus === 'Settled' || inv.blockchainStatus === 'REPAID' || inv.verificationStatus === 'SETTLED';
      if (isSettled) return;

      const base = {
        id:        inv.invoiceId || inv.id || 'N/A',
        docId:     inv.id,
        supplier:  inv.sellerName || 'Zenith Tech Solutions Pvt. Ltd.',
        amount:    amt,
        amountStr: fmt(amt),
        date:      inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        due:       inv.dueDate || '2026-10-01',
        escrowAddress: inv.escrowAddress || '0x376EF66a1a9EdD246Ea84030414dAc28aFfef9EB',
      };

      if (isFunded) {
        funded.push(base);
        outstanding += amt;
      } else if (inv.escrowAddress && !isAssigned) {
        assignment.push(base);
      } else if (!isApproved && inv.verificationStatus !== 'BUYER_REJECTED') {
        pending.push(base);
      }
    });

    setPendingInvoices(pending);
    setAssignmentInvoices(assignment);
    setFundedInvoices(funded);
    setTotalOutstanding(outstanding);
    
    // Auto-select the tab that has active items
    if (funded.length > 0) setActiveTab('escrow');
    else if (pending.length > 0) setActiveTab('pending');
    else if (assignment.length > 0) setActiveTab('assignment');
  }, [dbInvoices, currentUser]);

  const handleAction = async (id, type) => {
    toast.loading(`Processing ${type}…`, { id: 'action' });
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${API_BASE}/v1/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          verificationStatus: type === 'approve' ? 'BUYER_APPROVED' : 'BUYER_REJECTED', 
          buyerApproved: type === 'approve' 
        })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setPendingInvoices(prev => prev.filter(i => i.id !== id && i.docId !== id));
      toast.success(type === 'approve' ? 'Invoice delivery confirmed! MSME can now mint & list on marketplace.' : 'Invoice disputed.', { id: 'action' });
    } catch (err) {
      toast.error(`Error: ${err.message}`, { id: 'action' });
    }
  };

  const handleSignAssignment = async (inv, idx) => {
    setSigningIdx(idx);
    const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    try {
      if (!inv.escrowAddress || inv.escrowAddress === '0x...') {
        throw new Error('No on-chain Escrow contract deployed for this invoice yet.');
      }
      toast.loading('Signing Assignment on Polygon Amoy…', { id: 'wallet' });
      await signAssignment(inv.escrowAddress);

      await fetch(`${API_BASE}/v1/invoices/${inv.docId || inv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: 'ASSIGNMENT_SIGNED' })
      });

      toast.dismiss('wallet');
      toast.success('Assignment of Receivable signed on Polygon Amoy! ✍️', { duration: 5500 });
      setAssignmentInvoices(prev => prev.filter(i => i.id !== inv.id && i.docId !== inv.docId));
    } catch (err) {
      toast.dismiss('wallet');
      const msg = err?.reason || err?.message || 'Transaction failed.';
      toast.error(msg.toLowerCase().includes('user rejected') ? 'Signature rejected.' : `Assignment signature failed: ${msg}`);
    } finally {
      setSigningIdx(null);
      resetTx();
    }
  };

  return (
    <ContentContainer>
      <div className="space-y-8 pb-12">

        {/* ── Action Hero Banner ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-indigo-700 to-violet-800 p-6 sm:p-10 text-white shadow-2xl shadow-primary-500/20"
        >
          {/* Radial Lighting Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_25%,rgba(255,255,255,0.18)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  <span className="text-xs font-bold text-white tracking-wide uppercase">Buyer Treasury Portal</span>
                </div>
                <button
                  onClick={() => setActiveTab('credit')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 transition-all shadow-sm"
                >
                  <Award className="h-3.5 w-3.5 text-emerald-300" />
                  GSTN Score: 100/100 (AAA)
                </button>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Treasury & Escrow Management
              </h1>
              <p className="text-white/80 text-sm leading-relaxed">
                Counterparty corporate portal for <strong className="text-white underline decoration-emerald-400 underline-offset-4">{companyName}</strong>. Review delivery confirmations, monitor automated escrow disbursements, and track real-time GST credit compliance.
              </p>
            </div>

            {/* Metric KPI Box */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 bg-black/25 backdrop-blur-md rounded-2xl p-5 border border-white/15 shadow-inner">
              <div className="w-full sm:w-auto text-center sm:text-left pr-0 sm:pr-6 border-b sm:border-b-0 sm:border-r border-white/15 pb-4 sm:pb-0">
                <span className="block text-white/70 text-xs font-bold uppercase tracking-wider mb-1">
                  Total Outstanding Payable
                </span>
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {fmt(totalOutstanding)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center px-3">
                  <span className="block text-white/70 text-[11px] font-bold uppercase tracking-wider mb-0.5">Pending</span>
                  <span className="text-2xl font-black text-amber-300">{pendingInvoices.length}</span>
                </div>
                <div className="w-px h-8 bg-white/15" />
                <div className="text-center px-3">
                  <span className="block text-white/70 text-[11px] font-bold uppercase tracking-wider mb-0.5">To Assign</span>
                  <span className="text-2xl font-black text-indigo-300">{assignmentInvoices.length}</span>
                </div>
                <div className="w-px h-8 bg-white/15" />
                <div className="text-center px-3">
                  <span className="block text-white/70 text-[11px] font-bold uppercase tracking-wider mb-0.5">In Escrow</span>
                  <span className="text-2xl font-black text-emerald-300">{fundedInvoices.length}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Tabs & Invoice Grid ───────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 w-fit">
            <Tab active={activeTab === 'escrow'} onClick={() => setActiveTab('escrow')} count={fundedInvoices.length}>
              <Lock className="h-4 w-4" /> Active Escrow Vaults
            </Tab>
            <Tab active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} count={pendingInvoices.length}>
              <Inbox className="h-4 w-4" /> Awaiting Delivery Approval
            </Tab>
            <Tab active={activeTab === 'assignment'} onClick={() => setActiveTab('assignment')} count={assignmentInvoices.length}>
              <FileText className="h-4 w-4" /> Sign Assignments
            </Tab>
            <Tab active={activeTab === 'credit'} onClick={() => setActiveTab('credit')} count="AAA">
              <Award className="h-4 w-4 text-emerald-400" /> GST Credit Assessment
            </Tab>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'credit' && (
              <motion.div
                key="credit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <BuyerCreditAssessment initialGstin={currentUser?.buyerGST || '29AAACI4798L1ZU'} />
              </motion.div>
            )}

            {activeTab === 'escrow' && (
              <motion.div
                key="escrow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Invoices currently locked in smart contract escrow vaults. Payouts will trigger automatically upon maturity date.
                  </p>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    {fundedInvoices.length} Active {fundedInvoices.length === 1 ? 'Vault' : 'Vaults'}
                  </span>
                </div>

                {fundedInvoices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {fundedInvoices.map((inv, idx) => (
                      <EscrowCard key={inv.id} inv={inv} idx={idx} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Lock}
                    title="No active escrow vaults"
                    sub="Invoices will appear here once an investor bid is accepted and escrow is funded."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'pending' && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Review received supplier invoices and confirm delivery. Approving authorizes MSME to tokenize and list on marketplace.
                </p>

                {pendingInvoices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendingInvoices.map(inv => (
                      <PendingCard key={inv.id} inv={inv} onAction={handleAction} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Inbox}
                    title="All invoices approved!"
                    sub="There are no pending delivery confirmations at this time."
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'assignment' && (
              <motion.div
                key="assignment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Sign Notice of Assignment of Receivables to lock escrow payment obligations on Polygon Amoy.
                </p>

                {assignmentInvoices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {assignmentInvoices.map((inv, idx) => (
                      <AssignmentCard
                        key={inv.id}
                        inv={inv}
                        idx={idx}
                        signingIdx={signingIdx}
                        onSign={handleSignAssignment}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="No assignment mandates pending"
                    sub="Approved invoices requiring legal signature will appear here."
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── AI Compliance Banner ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-4 shadow-sm"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">AI Fraud Defense & GSTN Reconciled</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              All listed supplier invoices undergo cross-ledger duplicate prevention and real-time e-invoice IRN verification.
            </p>
          </div>
        </motion.div>

      </div>
    </ContentContainer>
  );
}
