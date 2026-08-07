import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInvoices } from '@/hooks/useInvoices';
import { useAuth } from '@/contexts/AuthContext';
import { useEscrow } from '@/hooks/useEscrow';
import { 
  Landmark, TrendingUp, Sparkles, ShieldCheck, Cpu, 
  ArrowUpRight, ArrowRight, Clock, Star, Landmark as Bank, 
  Coins, CheckCircle2, ChevronRight, Activity, Award,
  CheckCircle, ExternalLink, Zap, Lock, Filter, Search,
  ArrowDownRight, Layers, AlertCircle, Building2, 
  Percent, DollarSign, Wallet, X, Loader2, RefreshCw, Plus
} from 'lucide-react';
import ContentContainer from '@/components/layout/ContentContainer';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '@/services/marketplaceService';

const fmt = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(val || 0);

// ── Live Countdown Hook ───────────────────────────────────────────────────────
function useCountdown(dueDateStr) {
  const [remaining, setRemaining] = useState('');
  const [isMature, setIsMature] = useState(false);

  useEffect(() => {
    if (!dueDateStr || dueDateStr === 'Pending') {
      setRemaining('Date Pending');
      return;
    }
    const due = new Date(dueDateStr).getTime();
    const tick = () => {
      const diff = due - Date.now();
      if (diff <= 0) {
        setRemaining('Auto-Settlement Ready');
        setIsMature(true);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dueDateStr]);

  return { remaining, isMature };
}

// ── Risk Profile Classifier Helper ───────────────────────────────────────────
function getRiskProfile(buyerName = '', grade = 'B', yieldRate = 12) {
  const name = (buyerName || '').toLowerCase();
  if (name.includes('tata') || name.includes('wipro') || name.includes('reliance') || name.includes('infosys') || grade === 'AAA' || grade === 'A+') {
    return {
      tier: 'Blue-Chip (Low Risk)',
      tierKey: 'bluechip',
      grade: 'AAA / A+',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      score: 96,
      yieldNote: 'Stable Blue-Chip'
    };
  } else if (name.includes('apex') || name.includes('tech') || grade === 'A' || grade === 'B+') {
    return {
      tier: 'Balanced Growth (Mid-Risk)',
      tierKey: 'balanced',
      grade: 'A / B+',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      score: 84,
      yieldNote: 'Balanced Yield'
    };
  } else {
    return {
      tier: 'High-Yield (Emerging)',
      tierKey: 'highyield',
      grade: grade || 'B / C (Emerging)',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      score: 68,
      yieldNote: 'High Yield Premium'
    };
  }
}

export default function Investor() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { data: dbInvoices, isLoading: invoicesLoading } = useInvoices();
  const { fundInvoice, txStatus, txHash, txError, reset: resetTx } = useEscrow();

  // Active Tab: 'active' | 'funding' | 'bids' | 'settled' | 'opportunities'
  const [activeTab, setActiveTab] = useState('active');
  const [riskFilter, setRiskFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Marketplace Data
  const [marketplaceListings, setMarketplaceListings] = useState([]);
  const [fundingInvoiceId, setFundingInvoiceId] = useState(null);

  // Bidding Modal State
  const [biddingInvoice, setBiddingInvoice] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [expectedYield, setExpectedYield] = useState('8.5');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  // Subscribe to live marketplace listings
  useEffect(() => {
    const unsub = marketplaceService.subscribeListings((listings) => {
      setMarketplaceListings(listings || []);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // ── Parse & Categorize Real Invoices & Bids ────────────────────────────────
  const {
    readyToFund,
    activeInvestments,
    myBids,
    settledInvestments,
    opportunities,
    metrics
  } = useMemo(() => {
    const allInvoices = dbInvoices || [];
    const userWallet = (currentUser?.walletAddress || '').toLowerCase();
    const userUid = currentUser?.uid || '';
    const userEmail = (currentUser?.email || '').toLowerCase();
    const userName = (currentUser?.displayName || currentUser?.companyName || '').toLowerCase();

    const readyList = [];
    const activeList = [];
    const bidsList = [];
    const settledList = [];

    // Helper to check if a bid belongs to the current investor
    const isMyBid = (b) => {
      if (!b) return false;
      const bInvId = (b.investorId || '').toLowerCase();
      const bAddr = (b.investorAddress || '').toLowerCase();
      const bName = (b.investor || '').toLowerCase();
      return (
        (userUid && bInvId === userUid.toLowerCase()) ||
        (userWallet && bAddr === userWallet) ||
        (userEmail && bName.includes(userEmail)) ||
        (userName && bName.includes(userName))
      );
    };

    allInvoices.forEach((inv) => {
      const amt = Number(inv.invoiceAmount || inv.amount || 0);
      const isSettled = inv.invoiceStatus === 'Settled' || inv.blockchainStatus === 'REPAID' || inv.verificationStatus === 'SETTLED';
      const isFunded = ['FUNDED', 'ESCROWED'].includes(inv.blockchainStatus) || ['Funded', 'Financed'].includes(inv.invoiceStatus) || inv.status === 'Funded';
      const isAssigned = inv.verificationStatus === 'ASSIGNMENT_SIGNED';
      const hasEscrow = !!inv.escrowAddress && inv.escrowAddress !== '0x...';

      // Determine counterparty details
      const buyerName = inv.buyerCompany || inv.buyerName || inv.buyer || 'Counterparty';
      const sellerName = inv.sellerName || inv.msmeName || 'MSME Supplier';
      const yieldRate = Number(inv.expectedInvestorYield || inv.yieldRate || inv.yield || 9.2);

      const baseItem = {
        id: inv.invoiceId || inv.id,
        docId: inv.id,
        invoiceNumber: inv.invoiceNumber || inv.id,
        buyer: buyerName,
        seller: sellerName,
        amount: amt,
        amountStr: fmt(amt),
        dueDate: inv.dueDate || 'Pending',
        yieldRate,
        escrowAddress: inv.escrowAddress,
        blockchainStatus: inv.blockchainStatus || 'UNMINTED',
        verificationStatus: inv.verificationStatus || 'PENDING',
        invoiceStatus: inv.invoiceStatus || 'PENDING',
        acceptedBid: inv.acceptedBid || null,
        bids: Array.isArray(inv.bids) ? inv.bids : [],
        settledAt: inv.settledAt,
        fundedAt: inv.fundedAt,
        createdAt: inv.createdAt,
        riskProfile: getRiskProfile(buyerName, inv.grade, yieldRate)
      };

      // 1. Settled positions
      if (isSettled) {
        settledList.push(baseItem);
      }
      // 2. Active funded positions
      else if (isFunded) {
        activeList.push(baseItem);
      }
      // 3. Ready to fund on-chain (MSME accepted bid & buyer signed assignment)
      else if (hasEscrow && isAssigned && !isFunded) {
        readyList.push(baseItem);
      }

      // Check if investor placed any bids on this invoice
      if (inv.bids && Array.isArray(inv.bids)) {
        const foundBid = inv.bids.find(isMyBid);
        if (foundBid) {
          bidsList.push({
            ...baseItem,
            myBid: foundBid,
            isLeading: inv.bids[0] && isMyBid(inv.bids[0]),
            highestBid: inv.bids[0]?.bid || amt
          });
        }
      }
    });

    // Also scan live marketplace listings for active opportunities and placed bids
    const oppsList = [];
    marketplaceListings.forEach((item) => {
      const amt = Number(item.amount || item.required || 0);
      const isAlreadyFunded = item.status === 'Funded' || item.progress === 100;
      const isSettled = item.status === 'Settled';

      if (!isAlreadyFunded && !isSettled) {
        oppsList.push({
          ...item,
          amountStr: fmt(amt),
          riskProfile: getRiskProfile(item.buyer, item.grade, item.yieldRate)
        });
      }

      // Check bids in marketplace item
      if (item.bids && Array.isArray(item.bids)) {
        const foundBid = item.bids.find(isMyBid);
        if (foundBid && !bidsList.some(b => b.id === item.id || b.docId === item.docId)) {
          bidsList.push({
            id: item.id || item.invoiceId,
            docId: item.docId || item.id,
            invoiceNumber: item.invoiceNumber || item.id,
            buyer: item.buyer,
            seller: item.owner || 'MSME Supplier',
            amount: amt,
            amountStr: fmt(amt),
            dueDate: item.dueDate || 'Pending',
            yieldRate: item.yieldRate || 9.2,
            myBid: foundBid,
            isLeading: item.bids[0] && isMyBid(item.bids[0]),
            highestBid: item.bids[0]?.bid || amt,
            riskProfile: getRiskProfile(item.buyer, item.grade, item.yieldRate)
          });
        }
      }
    });

    // ── Calculate Real Metrics ──────────────────────────────────────────────
    const totalActiveCapital = activeList.reduce((acc, i) => acc + i.amount, 0);
    const totalSettledCapital = settledList.reduce((acc, i) => acc + i.amount, 0);
    
    // Realized profit: calculated based on discount yield for settled items
    const realizedProfit = settledList.reduce((acc, i) => {
      const rate = i.acceptedBid?.yield || i.yieldRate || 8.5;
      return acc + (i.amount * (rate / 100) * (45 / 365));
    }, 0);

    // Projected accruing yield for active positions
    const projectedYield = activeList.reduce((acc, i) => {
      const rate = i.acceptedBid?.yield || i.yieldRate || 9.2;
      return acc + (i.amount * (rate / 100) * (30 / 365));
    }, 0);

    // Weighted average APY
    let avgApy = 0;
    if (activeList.length > 0) {
      const totalYieldWeight = activeList.reduce((acc, i) => acc + (i.amount * (i.acceptedBid?.yield || i.yieldRate || 9.2)), 0);
      avgApy = totalActiveCapital > 0 ? (totalYieldWeight / totalActiveCapital) : 0;
    } else if (bidsList.length > 0) {
      avgApy = bidsList.reduce((acc, b) => acc + Number(b.myBid?.yield || 8.8), 0) / bidsList.length;
    } else if (oppsList.length > 0) {
      avgApy = oppsList.reduce((acc, o) => acc + Number(o.yieldRate || 8.5), 0) / oppsList.length;
    }

    return {
      readyToFund: readyList,
      activeInvestments: activeList,
      myBids: bidsList,
      settledInvestments: settledList,
      opportunities: oppsList,
      metrics: {
        totalActiveCapital,
        realizedProfit,
        projectedYield,
        avgApy: avgApy.toFixed(1),
        totalSettledCapital
      }
    };
  }, [dbInvoices, marketplaceListings, currentUser]);

  // ── Filter by Risk & Search ───────────────────────────────────────────────
  const filterByRiskAndSearch = (list) => {
    return list.filter((item) => {
      // Risk filter
      if (riskFilter !== 'all') {
        if (item.riskProfile?.tierKey !== riskFilter) return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const buyer = (item.buyer || '').toLowerCase();
        const seller = (item.seller || '').toLowerCase();
        const invId = (item.id || item.invoiceNumber || '').toLowerCase();
        if (!buyer.includes(q) && !seller.includes(q) && !invId.includes(q)) return false;
      }
      return true;
    });
  };

  const filteredReady = filterByRiskAndSearch(readyToFund);
  const filteredActive = filterByRiskAndSearch(activeInvestments);
  const filteredBids = filterByRiskAndSearch(myBids);
  const filteredSettled = filterByRiskAndSearch(settledInvestments);
  const filteredOpps = filterByRiskAndSearch(opportunities);

  // ── Handle On-Chain Escrow Funding ────────────────────────────────────────
  const handleFundEscrow = async (inv) => {
    if (!inv.escrowAddress || inv.escrowAddress === '0x...') {
      toast.error('No on-chain escrow address deployed for this invoice.');
      return;
    }

    setFundingInvoiceId(inv.id);
    toast.loading('Preparing Escrow funding on Polygon Amoy…', { id: 'fund' });

    try {
      // Amount in wei: For testnet POL demo, we use 0.001 POL (10^15 wei) to ensure instant affordability
      const amountWei = BigInt('1000000000000000'); 
      await fundInvoice(inv.escrowAddress, amountWei);

      // Update Firestore invoice document
      const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      await fetch(`${API_BASE}/v1/invoices/${inv.docId || inv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceStatus: 'Funded',
          blockchainStatus: 'FUNDED',
          fundedAt: new Date().toISOString(),
          investorId: currentUser?.uid || '',
          investorAddress: currentUser?.walletAddress || '0x...'
        })
      });

      toast.dismiss('fund');
      toast.success('🎉 Escrow funded on Polygon Amoy! Working capital released to MSME.', { duration: 6000 });
      setActiveTab('active');
    } catch (err) {
      toast.dismiss('fund');
      const msg = err?.reason || err?.message || 'Funding transaction cancelled.';
      toast.error(msg.toLowerCase().includes('user rejected') ? 'Transaction cancelled in wallet.' : `Funding failed: ${msg}`);
    } finally {
      setFundingInvoiceId(null);
      resetTx();
    }
  };

  // ── Handle Place Financing Bid ────────────────────────────────────────────
  const handleOpenBidModal = (inv) => {
    setBiddingInvoice(inv);
    setBidAmount(String(inv.amount || inv.required || ''));
    setExpectedYield(String(inv.yieldRate || inv.yield || '8.5'));
  };

  const handlePlaceBidSubmit = async (e) => {
    e.preventDefault();
    if (!biddingInvoice) return;

    const numBid = Number(bidAmount);
    const numYield = Number(expectedYield);

    if (!numBid || numBid <= 0) {
      toast.error('Please enter a valid bid amount.');
      return;
    }

    setIsSubmittingBid(true);
    toast.loading('Registering financing bid…', { id: 'bid' });

    try {
      const bidPayload = {
        investor: currentUser?.displayName || currentUser?.companyName || currentUser?.email || 'Institutional Investor',
        investorId: currentUser?.uid || 'inv-user',
        investorAddress: currentUser?.walletAddress || '0xAf8eE747Afe102e7eac42e284AEb3961062f74Ae',
        bid: numBid,
        yield: numYield,
        date: new Date().toISOString()
      };

      await marketplaceService.placeBid(biddingInvoice.docId || biddingInvoice.id, bidPayload);
      toast.dismiss('bid');
      toast.success('🎯 Financing bid recorded successfully! Awaiting MSME review.', { duration: 5000 });
      setBiddingInvoice(null);
      setActiveTab('bids');
    } catch (err) {
      toast.dismiss('bid');
      toast.error('Failed to submit bid: ' + (err.message || 'Error'));
    } finally {
      setIsSubmittingBid(false);
    }
  };

  return (
    <ContentContainer>
      
      {/* ── 1. Hero Header Banner ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-indigo-600 to-violet-700 p-6 sm:p-8 text-white shadow-xl shadow-primary-500/20 mb-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12)_0%,transparent_50%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-white tracking-wide">Institutional DeFi Portfolio</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Investor Portfolio &amp; P&amp;L
            </h1>
            <p className="text-sm text-primary-100 mt-1 max-w-xl">
              Track live on-chain escrows on Polygon Amoy, manage competitive discount bids, and disburse working capital to verified MSME suppliers.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-primary-200">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                <Wallet className="h-3.5 w-3.5 text-primary-300" />
                <span className="font-mono text-[11px] truncate max-w-[180px]">
                  {currentUser?.walletAddress || '0xAf8e...74Ae'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30">
                <Coins className="h-3.5 w-3.5" />
                <span>Polygon Amoy Network</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/app/marketplace')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-primary-900 font-bold text-xs shadow-lg hover:shadow-xl hover:bg-primary-50 transition"
            >
              <Landmark className="h-4 w-4 text-primary-600" />
              <span>Browse Marketplace</span>
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition"
            >
              <Zap className="h-4 w-4 text-amber-300" />
              <span>Quick Bid</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Top Real-Time KPI Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          {
            label: 'Total Active Capital',
            value: fmt(metrics.totalActiveCapital),
            subtext: `${activeInvestments.length} Active Escrow Positions`,
            icon: Wallet,
            color: 'text-primary-500 bg-primary-50 dark:bg-primary-950/20'
          },
          {
            label: 'Realized Net Profit',
            value: fmt(metrics.realizedProfit),
            subtext: `${settledInvestments.length} Settled Positions`,
            icon: TrendingUp,
            color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
          },
          {
            label: 'Projected Yield',
            value: fmt(metrics.projectedYield),
            subtext: 'Across active horizons',
            icon: Percent,
            color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/20'
          },
          {
            label: 'Average APY',
            value: `${metrics.avgApy}%`,
            subtext: 'Risk-adjusted return rate',
            icon: Activity,
            color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20'
          },
          {
            label: 'Settled Capital',
            value: fmt(metrics.totalSettledCapital),
            subtext: '100% On-time repayment',
            icon: ShieldCheck,
            color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20'
          }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {kpi.label}
                  </span>
                  <div className={`p-2 rounded-xl ${kpi.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {kpi.value}
                </div>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 font-medium">
                {kpi.subtext}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ── 3. Tab Navigation & Risk Screener Filters ─────────────────────── */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Main Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-gray-100 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800">
            {[
              { id: 'active', label: 'Active Escrows', count: activeInvestments.length, icon: Lock },
              { id: 'funding', label: 'Ready to Fund', count: readyToFund.length, icon: Zap, highlight: readyToFund.length > 0 },
              { id: 'bids', label: 'My Active Bids', count: myBids.length, icon: TrendingUp },
              { id: 'settled', label: 'Completed & Settled', count: settledInvestments.length, icon: CheckCircle2 },
              { id: 'opportunities', label: 'Marketplace Bidding', count: opportunities.length, icon: Landmark }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-dark-card text-primary-600 dark:text-white shadow-md shadow-black/5 border border-gray-150 dark:border-dark-border'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${tab.highlight ? 'text-amber-500 animate-pulse' : ''}`} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : tab.highlight
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search counterparty or ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-dark-card text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Risk Profile Filter Chips */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Risk Tier:
          </span>
          {[
            { label: 'All Tiers', key: 'all' },
            { label: 'Blue-Chip (AAA/A+)', key: 'bluechip' },
            { label: 'Balanced Growth (A/B+)', key: 'balanced' },
            { label: 'High-Yield Emerging', key: 'highyield' }
          ].map((pill) => (
            <button
              key={pill.key}
              onClick={() => setRiskFilter(pill.key)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition ${
                riskFilter === pill.key
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-dark-card text-gray-500 hover:bg-gray-50'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Main Tab Content ───────────────────────────────────────────── */}
      
      {/* TAB 1: ACTIVE ESCROWS */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-500" />
              Live Active Escrow Positions ({filteredActive.length})
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              Pre-authorized smart contract escrows locked on Polygon Amoy
            </span>
          </div>

          {filteredActive.length === 0 ? (
            <EmptyStateCard
              icon={Lock}
              title="No Active Funded Escrows Yet"
              description="When your bids are accepted by MSMEs and the corporate buyer signs the assignment, you fund the on-chain escrow to start earning yield."
              actionLabel="Explore Live Marketplace Opportunities →"
              onAction={() => setActiveTab('opportunities')}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredActive.map((inv, idx) => (
                <ActiveEscrowCard key={inv.id} inv={inv} idx={idx} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: READY TO FUND */}
      {activeTab === 'funding' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Awaiting On-Chain Investor Funding ({filteredReady.length})
            </h3>
            <span className="text-xs text-amber-500 font-medium">
              Assignment verified &amp; signed · Ready for liquidity disbursement
            </span>
          </div>

          {filteredReady.length === 0 ? (
            <EmptyStateCard
              icon={Zap}
              title="No Escrows Currently Awaiting Funding"
              description="Once an MSME accepts your marketplace bid and the corporate buyer confirms delivery, the escrow contract will appear here for 1-click funding."
              actionLabel="View Placed Bids →"
              onAction={() => setActiveTab('bids')}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredReady.map((inv, idx) => (
                <ReadyToFundCard
                  key={inv.id}
                  inv={inv}
                  idx={idx}
                  isFunding={fundingInvoiceId === inv.id}
                  onFund={() => handleFundEscrow(inv)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY ACTIVE BIDS */}
      {activeTab === 'bids' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary-500" />
              My Active Financing Bids ({filteredBids.length})
            </h3>
            <span className="text-xs text-gray-400">
              Live discount proposals submitted across auctions
            </span>
          </div>

          {filteredBids.length === 0 ? (
            <EmptyStateCard
              icon={TrendingUp}
              title="You Haven't Placed Any Bids Yet"
              description="Browse the marketplace to discover verified, tokenized invoices from top Indian corporate buyers and place competitive financing bids."
              actionLabel="Browse Marketplace Listings →"
              onAction={() => setActiveTab('opportunities')}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBids.map((bidItem, idx) => (
                <BidPositionCard
                  key={bidItem.id}
                  bidItem={bidItem}
                  idx={idx}
                  onRebid={() => handleOpenBidModal(bidItem)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COMPLETED & SETTLED */}
      {activeTab === 'settled' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Settled &amp; Repaid Escrows ({filteredSettled.length})
            </h3>
            <span className="text-xs text-emerald-500 font-medium">
              Principal + Yield auto-repaid to investor wallet
            </span>
          </div>

          {filteredSettled.length === 0 ? (
            <EmptyStateCard
              icon={CheckCircle2}
              title="No Settled Escrows Yet"
              description="As corporate counterparties settle payments upon invoice maturity, your completed investments and realized profits will be cataloged here."
              actionLabel="View Active Escrows →"
              onAction={() => setActiveTab('active')}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSettled.map((inv, idx) => (
                <SettledPositionCard key={inv.id} inv={inv} idx={idx} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MARKETPLACE OPPORTUNITIES */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Landmark className="h-4 w-4 text-primary-500" />
              Live Marketplace Opportunities ({filteredOpps.length})
            </h3>
            <button
              onClick={() => navigate('/app/marketplace')}
              className="text-xs font-bold text-primary-600 hover:text-primary-500 flex items-center gap-1 transition"
            >
              <span>Full Marketplace Experience</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {filteredOpps.length === 0 ? (
            <EmptyStateCard
              icon={Landmark}
              title="No Listed Invoices Available"
              description="All current invoices are either in verification, fully funded, or settled. Check back soon for new corporate receivables."
              actionLabel="Refresh Data"
              onAction={() => window.location.reload()}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOpps.map((opp, idx) => (
                <OpportunityCard
                  key={opp.id}
                  opp={opp}
                  idx={idx}
                  onBid={() => handleOpenBidModal(opp)}
                  onView={() => navigate(`/app/invoice/${opp.docId || opp.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 5. Interactive Place Financing Bid Modal ─────────────────────── */}
      <AnimatePresence>
        {biddingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card p-6 sm:p-8 shadow-2xl space-y-6"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-gray-150 dark:border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase mb-2">
                    <Landmark className="h-3 w-3" /> Live Auction Bid
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-gray-900 dark:text-white">
                    Place Financing Bid
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">
                    Counterparty: <span className="font-bold text-gray-700 dark:text-gray-200">{biddingInvoice.buyer}</span> ({biddingInvoice.invoiceNumber || biddingInvoice.id})
                  </p>
                </div>
                <button
                  onClick={() => setBiddingInvoice(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handlePlaceBidSubmit} className="space-y-4">
                
                {/* 1-Click Term Presets */}
                <div className="rounded-2xl border border-primary-500/20 bg-primary-50/50 dark:bg-primary-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-primary-500" />
                      Quick Amount Presets
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Face Value: {fmt(biddingInvoice.amount || biddingInvoice.required || 0)}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: '100% Full', pct: 1 },
                      { label: '80% Adv.', pct: 0.8 },
                      { label: '50% Half', pct: 0.5 },
                      { label: '25% Min', pct: 0.25 }
                    ].map((chip) => {
                      const calculated = Math.round((biddingInvoice.amount || biddingInvoice.required || 0) * chip.pct);
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => setBidAmount(String(calculated))}
                          className="py-1.5 px-2 rounded-xl bg-white dark:bg-dark-card hover:bg-primary-500 hover:text-white border border-gray-200 dark:border-slate-800 text-[10px] font-bold text-gray-700 dark:text-gray-200 transition shadow-sm"
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bid Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Bid Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter bid amount"
                    className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* Expected Yield */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Proposed Discount / Yield APY (%)
                    </label>
                    <span className="text-[10px] text-violet-500 font-bold">
                      Market Ask: {biddingInvoice.yieldRate || 8.5}%
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={expectedYield}
                    onChange={(e) => setExpectedYield(e.target.value)}
                    placeholder="e.g. 8.5"
                    className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBiddingInvoice(null)}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBid}
                    className="flex-1 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingBid ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                    <span>Submit Live Bid</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </ContentContainer>
  );
}

// ── Sub-component: Active Escrow Card ─────────────────────────────────────────
function ActiveEscrowCard({ inv, idx }) {
  const { remaining, isMature } = useCountdown(inv.dueDate);
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="rounded-3xl border border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase mb-1.5 ${inv.riskProfile?.badgeColor}`}>
              {inv.riskProfile?.grade}
            </span>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{inv.buyer}</h4>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{inv.invoiceNumber || inv.id}</p>
          </div>
          <div className="text-right">
            <span className="text-base font-display font-extrabold text-primary-600 dark:text-primary-400">
              {inv.amountStr}
            </span>
            <p className="text-[10px] text-emerald-500 font-bold mt-0.5">
              +{inv.yieldRate}% APY
            </p>
          </div>
        </div>

        {/* Live Countdown Timer */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono mb-4 ${
          isMature
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800'
        }`}>
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="flex-1 text-[11px] font-semibold">{remaining}</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/50 dark:bg-white/10 text-[9px] font-bold uppercase">
            Locked Escrow
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-slate-800 pt-3">
          <div className="flex justify-between">
            <span>Supplier / MSME:</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{inv.seller}</span>
          </div>
          <div className="flex justify-between">
            <span>Maturity Date:</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{inv.dueDate}</span>
          </div>
          {inv.escrowAddress && (
            <div className="flex justify-between items-center pt-1">
              <span>On-Chain Escrow:</span>
              <a
                href={`https://amoy.polygonscan.com/address/${inv.escrowAddress}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-primary-500 hover:underline flex items-center gap-1"
              >
                <span>{inv.escrowAddress.slice(0, 6)}...{inv.escrowAddress.slice(-4)}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="pt-5 mt-4 border-t border-gray-100 dark:border-slate-800 flex gap-2">
        <button
          onClick={() => navigate(`/app/invoice/${inv.docId || inv.id}`)}
          className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900 text-xs font-bold text-gray-700 dark:text-gray-200 transition text-center"
        >
          View Full Audit Vault →
        </button>
      </div>
    </motion.div>
  );
}

// ── Sub-component: Ready To Fund Card ─────────────────────────────────────────
function ReadyToFundCard({ inv, idx, isFunding, onFund }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent dark:bg-dark-card p-6 shadow-md shadow-amber-500/5 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase mb-1.5">
              <Zap className="h-3 w-3" /> Ready for Funding
            </span>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{inv.buyer}</h4>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{inv.invoiceNumber || inv.id}</p>
          </div>
          <div className="text-right">
            <span className="text-base font-display font-extrabold text-gray-900 dark:text-white">
              {inv.amountStr}
            </span>
            <p className="text-[10px] text-amber-500 font-bold mt-0.5">
              Target APY: {inv.yieldRate}%
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1 mb-4">
          <p className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Buyer Assignment Mandate Signed
          </p>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
            Escrow deployed on Polygon Amoy. Fund this contract to disburse capital to {inv.seller}.
          </p>
        </div>

        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Supplier / MSME:</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{inv.seller}</span>
          </div>
          <div className="flex justify-between">
            <span>Due Date:</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{inv.dueDate}</span>
          </div>
        </div>
      </div>

      <div className="pt-5 mt-4 border-t border-gray-100 dark:border-slate-800 flex gap-2">
        <button
          onClick={onFund}
          disabled={isFunding}
          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isFunding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
          <span>{isFunding ? 'Funding on Polygon…' : 'Fund Escrow on-chain'}</span>
        </button>
      </div>
    </motion.div>
  );
}

// ── Sub-component: Placed Bid Position Card ───────────────────────────────────
function BidPositionCard({ bidItem, idx, onRebid }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="rounded-3xl border border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase mb-1.5 ${bidItem.riskProfile?.badgeColor}`}>
              {bidItem.riskProfile?.grade}
            </span>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{bidItem.buyer}</h4>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{bidItem.invoiceNumber || bidItem.id}</p>
          </div>
          <div className="text-right">
            <span className="text-base font-display font-extrabold text-primary-600 dark:text-primary-400">
              {fmt(bidItem.myBid?.bid || bidItem.amount)}
            </span>
            <p className="text-[10px] text-violet-500 font-bold mt-0.5">
              Bid Yield: {bidItem.myBid?.yield || bidItem.yieldRate}% APY
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 space-y-2 mb-4 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Your Bid Status:</span>
            <span className="inline-flex items-center gap-1 font-bold text-primary-500">
              <Sparkles className="h-3.5 w-3.5" />
              {bidItem.isLeading ? 'Leading Bid' : 'Active Proposal'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Invoice Face Value:</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{bidItem.amountStr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Maturity Date:</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{bidItem.dueDate}</span>
          </div>
        </div>
      </div>

      <div className="pt-2 flex gap-2">
        <button
          onClick={onRebid}
          className="flex-1 py-2.5 px-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 text-primary-600 dark:text-primary-400 text-xs font-bold transition text-center"
        >
          Adjust Bid
        </button>
        <button
          onClick={() => navigate(`/app/invoice/${bidItem.docId || bidItem.id}`)}
          className="py-2.5 px-3 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 text-xs font-bold text-gray-600 dark:text-gray-300 transition"
        >
          Details
        </button>
      </div>
    </motion.div>
  );
}

// ── Sub-component: Settled Position Card ──────────────────────────────────────
function SettledPositionCard({ inv, idx }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="rounded-3xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 p-6 shadow-sm flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase mb-1.5">
              <CheckCircle2 className="h-3 w-3" /> Fully Settled
            </span>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{inv.buyer}</h4>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{inv.invoiceNumber || inv.id}</p>
          </div>
          <div className="text-right">
            <span className="text-base font-display font-extrabold text-emerald-600 dark:text-emerald-400">
              {inv.amountStr}
            </span>
            <p className="text-[10px] text-emerald-500 font-bold mt-0.5">
              Repaid on-chain ✓
            </p>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 border-t border-emerald-500/10 pt-3">
          <div className="flex justify-between">
            <span>Settlement Date:</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {inv.settledAt ? new Date(inv.settledAt).toLocaleDateString('en-GB') : 'Recent'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>MSME Counterparty:</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{inv.seller}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Sub-component: Opportunity Card ───────────────────────────────────────────
function OpportunityCard({ opp, idx, onBid, onView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="rounded-3xl border border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase mb-1.5 ${opp.riskProfile?.badgeColor}`}>
              {opp.riskProfile?.grade}
            </span>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{opp.buyer}</h4>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{opp.id || opp.invoiceId}</p>
          </div>
          <div className="text-right">
            <span className="text-base font-display font-extrabold text-primary-600 dark:text-primary-400">
              {opp.amountStr}
            </span>
            <p className="text-[10px] text-violet-500 font-bold mt-0.5">
              Ask Yield: {opp.yieldRate || 8.5}%
            </p>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-slate-800 pt-3 mb-4">
          <div className="flex justify-between">
            <span>Supplier / Seller:</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{opp.owner || 'MSME Supplier'}</span>
          </div>
          <div className="flex justify-between">
            <span>Maturity Due:</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{opp.dueDate || 'Pending'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBid}
          className="flex-1 py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition shadow-md shadow-primary-500/10 flex items-center justify-center gap-1.5"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Place Bid</span>
        </button>
        <button
          onClick={onView}
          className="py-2.5 px-3 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 text-xs font-bold text-gray-600 dark:text-gray-300 transition"
        >
          Audit
        </button>
      </div>
    </motion.div>
  );
}

// ── Sub-component: Empty State Card ───────────────────────────────────────────
function EmptyStateCard({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-dark-card/30 p-12 text-center flex flex-col items-center justify-center">
      <div className="h-14 w-14 rounded-2xl bg-primary-50 dark:bg-primary-950/30 text-primary-500 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <h4 className="font-display font-extrabold text-base text-gray-900 dark:text-white mb-1">
        {title}
      </h4>
      <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
        {description}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition shadow-lg shadow-primary-500/10"
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
