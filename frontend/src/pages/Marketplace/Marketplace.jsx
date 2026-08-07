import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hexagon, ShieldCheck, Landmark, Key, Banknote, 
  HelpCircle, Cpu, Search, Sparkles, Filter, CheckCircle2, 
  ArrowRight, X, Clock, HelpCircle as HelpIcon, PieChart as ChartIcon, Plus, ArrowUpRight,
  Loader2, AlertTriangle, ExternalLink, Zap
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import ContentContainer from '@/components/layout/ContentContainer';
import PageHeader from '@/components/layout/PageHeader';
import toast from 'react-hot-toast';
import { useEscrow } from '@/hooks/useEscrow';

import { marketplaceService } from '@/services/marketplaceService';
import { useEffect } from 'react';

export default function Marketplace() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  
  const [drawerInvoice, setDrawerInvoice] = useState(null);
  const [bidInvoice, setBidInvoice]       = useState(null);
  const [bidSuccess, setBidSuccess]       = useState(false);
  const [confirmedTxHash, setConfirmedTxHash] = useState(null);

  // Form State
  const [bidAmount,     setBidAmount]     = useState('');
  const [expectedYield, setExpectedYield] = useState('');
  const [reputationScore, setReputationScore] = useState(null);

  // On-chain escrow hook
  const { fundInvoice, getReputationScore, txStatus, txHash, txError, reset: resetTx } = useEscrow();

  useEffect(() => {
    if (drawerInvoice) {
      // Mock msme address for the demo, since we don't store it in the mock data yet
      const mockMsmeAddress = '0x1234567890123456789012345678901234567890';
      const registryAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
      getReputationScore(registryAddress, mockMsmeAddress).then(score => {
        if (score !== null) setReputationScore(score);
        else setReputationScore(100); // Default fallback
      });
    } else {
      setReputationScore(null);
    }
  }, [drawerInvoice, getReputationScore]);

  useEffect(() => {
    const unsub = marketplaceService.subscribeListings((data) => {
      setInvoices(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const [selectedRiskTier, setSelectedRiskTier] = useState('All');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  // Helper to resolve Stock-Market style Corporate Risk Profile
  const getRiskProfile = (buyerName = '', grade = 'B', yieldRate = 12) => {
    const name = (buyerName || '').toLowerCase();
    if (name.includes('tata') || name.includes('wipro') || name.includes('reliance') || name.includes('infosys') || grade === 'A+') {
      return {
        tier: 'Blue-Chip (Low Risk)',
        tierKey: 'bluechip',
        grade: 'AAA / A+',
        badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        score: 96,
        yieldNote: 'Stable Low-Risk'
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
        grade: 'B / C (Emerging)',
        badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        score: 68,
        yieldNote: 'High Yield Premium'
      };
    }
  };

  // Filter logic including Industry, Search, and Stock Market Risk Tier
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = (inv.buyer || '').toLowerCase().includes(search.toLowerCase()) || (inv.id || '').toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || inv.industry === selectedIndustry;
    const matchesGrade = selectedGrade === 'All' || inv.grade === selectedGrade;
    
    const risk = getRiskProfile(inv.buyer, inv.grade, inv.yieldRate);
    const matchesRisk = selectedRiskTier === 'All' || risk.tierKey === selectedRiskTier;

    return matchesSearch && matchesIndustry && matchesGrade && matchesRisk;
  });

  /**
   * Two-phase bid flow:
   * Phase 1: Record bid intent in Firestore (off-chain, fast).
   * Phase 2: Trigger MetaMask → fundInvoice() on-chain. Firestore status only
   *          updates to "Financed" AFTER the tx confirms on Polygon.
   */
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!bidAmount || !expectedYield) {
      return toast.error('Please fill in the bid amount and yield APY.');
    }

    // Check if this invoice has an escrow contract address stored
    const escrowAddress = bidInvoice?.escrowAddress;

    const offChainBid = {
      investor: 'You (MetaMask)',
      bid:      Number(bidAmount),
      yield:    Number(expectedYield),
      date:     'Just now',
      status:   escrowAddress ? 'Pending On-chain Confirmation' : 'Recorded'
    };

    try {
      // Phase 1: Record bid in Firestore immediately
      await marketplaceService.placeBid(bidInvoice.docId || bidInvoice.id, offChainBid);

      if (!escrowAddress || escrowAddress === '0x...') {
        // No escrow deployed yet (demo mode) — treat as pure off-chain bid
        setBidSuccess(true);
        setConfirmedTxHash(null);
        return;
      }

      // Phase 2: Trigger real MetaMask transaction
      // Convert INR bid amount → MATIC wei for demo (using nominal 0.001 MATIC)
      // In production this would use an oracle price or a fixed MATIC invoice amount
      const amountWei = BigInt('1000000000000000'); // 0.001 MATIC demo amount

      toast.loading('Opening MetaMask… please confirm the transaction.', { id: 'wallet-prompt' });

      const { txHash: hash } = await fundInvoice(escrowAddress, amountWei);

      toast.dismiss('wallet-prompt');
      toast.success('Transaction confirmed on Polygon! ⛓️', { duration: 5000 });

      setConfirmedTxHash(hash);
      setBidSuccess(true);

    } catch (err) {
      toast.dismiss('wallet-prompt');
      // User rejected or tx failed — show clear error, don't flip status
      const msg = err?.reason || err?.message || 'Transaction failed.';
      if (!msg.toLowerCase().includes('user rejected')) {
        toast.error(`Funding failed: ${msg}`);
      } else {
        toast.error('Transaction cancelled in MetaMask.');
      }
    }
  };

  const handleAutoMatchTerms = (pct = 1) => {
    if (!bidInvoice) return;
    const baseAmount = Number(bidInvoice.amount || bidInvoice.required || 0);
    const targetAmount = Math.round(baseAmount * pct);
    const targetYield = bidInvoice.yieldRate ?? bidInvoice.yield ?? 8.5;
    
    setBidAmount(String(targetAmount));
    setExpectedYield(String(targetYield));
    toast.success(`Matched asked terms: ${formatCurrency(targetAmount)} @ ${targetYield}% APY!`);
  };

  const handleCloseBidFlow = () => {
    setBidSuccess(false);
    setBidInvoice(null);
    setBidAmount('');
    setExpectedYield('');
    setDrawerInvoice(null);
    setConfirmedTxHash(null);
    resetTx();
  };

  // Dynamic Marketplace Stats & Allocation Data
  const portfolioStats = React.useMemo(() => {
    const totalVolume = invoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const avgApy = invoices.length > 0
      ? (invoices.reduce((sum, i) => sum + (Number(i.yieldRate || i.yield || 8.5)), 0) / invoices.length).toFixed(1)
      : '0.0';
    const totalBidsCount = invoices.reduce((sum, i) => sum + (Array.isArray(i.bids) ? i.bids.length : 0), 0);

    return {
      totalVolume,
      avgApy,
      totalBidsCount
    };
  }, [invoices]);

  const allocationData = React.useMemo(() => {
    const buyerMap = {};
    const colors = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'];
    invoices.forEach((inv) => {
      const b = inv.buyer || 'Other';
      buyerMap[b] = (buyerMap[b] || 0) + (Number(inv.amount) || 0);
    });
    return Object.entries(buyerMap).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }, [invoices]);

  return (
    <ContentContainer>
      {/* Top Hero */}
      <PageHeader 
        title="Invoice Marketplace" 
        description="Browse, audit, and fund verified invoice token assets on the Polygon testnet."
      />

      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Invoices', value: filteredInvoices.length, color: 'text-primary-500 bg-primary-50 dark:bg-primary-950/20' },
          { label: 'Marketplace Value', value: formatCurrency(filteredInvoices.reduce((a, b) => a + b.amount, 0)), color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Average Yield Rate', value: `${portfolioStats.avgApy}% APY`, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/20' },
          { label: 'Active Auctions', value: filteredInvoices.filter(i => i.status === 'Live Auction').length, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' }
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-5 shadow-sm">
            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{stat.label}</div>
            <div className="text-xl font-display font-extrabold text-gray-900 dark:text-white mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search buyers, invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-xl border border-gray-150 dark:border-dark-border pl-10 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-dark-card/50 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            />
          </div>

          {/* Industry Filter Chips */}
          <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {['All', 'Manufacturing', 'Retail', 'IT Services', 'Healthcare', 'Logistics'].map(ind => (
              <button 
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3 py-1.5 rounded-full border transition ${
                  selectedIndustry === ind 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400' 
                    : 'border-gray-150 dark:border-slate-800 bg-white dark:bg-dark-card hover:bg-gray-50'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* Stock-Market Risk & Yield Profile Selector */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-800/80">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="h-3 w-3 text-violet-500" />
            <span>Stock-Market Risk Profile:</span>
          </span>
          {[
            { label: 'All Risk Tiers', key: 'All' },
            { label: '🏛️ Blue-Chip (8.0% - 9.8% APY)', key: 'bluechip' },
            { label: '📈 Balanced Growth (10.5% - 13.5% APY)', key: 'balanced' },
            { label: '🚀 High-Yield Emerging (14.5% - 18.5%+ APY)', key: 'highyield' }
          ].map(pill => (
            <button
              key={pill.key}
              onClick={() => setSelectedRiskTier(pill.key)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${
                selectedRiskTier === pill.key
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                  : 'border border-gray-200 dark:border-slate-800 bg-white dark:bg-dark-card text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-900'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Listings, Right Sidebar Portfolio */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Investment Cards List */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            /* Skeleton loader while fetching */
            <div className="grid sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                      <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-24" />
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-14" />
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-slate-800" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><div className="h-2 bg-gray-200 dark:bg-slate-700 rounded w-16" /><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" /></div>
                    <div className="space-y-1.5"><div className="h-2 bg-gray-200 dark:bg-slate-700 rounded w-16" /><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16" /></div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full" />
                  <div className="h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {filteredInvoices.length === 0 ? (
              <div className="col-span-2 text-center py-16 text-gray-400 text-xs">
                No marketplace listings match the selected filter criteria.
              </div>
            ) : filteredInvoices.map((inv) => {
              const risk = getRiskProfile(inv.buyer, inv.grade, inv.yieldRate);
              return (
                <div 
                  key={inv.id}
                  className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-display font-bold text-sm text-gray-900 dark:text-white">{inv.buyer}</h4>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{inv.id} • {inv.industry}</span>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest ${risk.badgeColor}`}>
                        {risk.grade}
                      </span>
                      <span className="text-[8px] text-gray-400 block mt-0.5 font-medium">{risk.yieldNote}</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 border-y border-gray-100 dark:border-slate-800/80 py-4 mb-4">
                    <div>
                      <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Invoice Value</div>
                      <div className="text-sm font-bold mt-0.5">{formatCurrency(inv.amount)}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Yield Rate</div>
                      <div className="text-sm font-bold text-violet-500 mt-0.5">{inv.yieldRate}% APY</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5 mb-6">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-gray-400">Funding Progress</span>
                      <span className="text-primary-500">{inv.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${inv.progress}%` }} />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setDrawerInvoice(inv)}
                      className="flex-1 py-2 px-4 rounded-xl border border-gray-100 dark:border-slate-800 text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => setBidInvoice(inv)}
                      disabled={inv.status === 'Funded'}
                      className="flex-1 py-2 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Place Bid
                    </button>
                  </div>
                </div>
              );
            })}</div>
          )}
        </div>

        {/* Right Sidebar: Investor Portfolio Summary */}
        <div className="space-y-8">
          
          {/* Portfolio Summary Card */}
          <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold border-b border-gray-50 dark:border-slate-800 pb-3">Marketplace Liquidity</h3>
            
            <div className="space-y-4">
              {[
                { label: 'Total Volume Listed', value: formatCurrency(portfolioStats.totalVolume) },
                { label: 'Avg Investor Yield', value: `${portfolioStats.avgApy}% APY` },
                { label: 'Active Invoices Listed', value: `${invoices.length} Invoices` },
                { label: 'Total Bids Placed', value: `${portfolioStats.totalBidsCount} Live Bids` }
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-400 dark:text-gray-500">{item.label}</span>
                  <span className="font-bold text-gray-800 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Recharts allocation diagram */}
            {allocationData.length > 0 && (
              <div className="pt-4 border-t border-gray-50 dark:border-slate-800">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-4">Corporate Buyer Exposure</div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {allocationData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 text-[9px] font-bold text-gray-500 uppercase tracking-wider pt-2">
                  {allocationData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Invoice Detail Side Drawer */}
      <AnimatePresence>
        {drawerInvoice && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm p-4">
            
            {/* Backdrop close */}
            <div className="absolute inset-0" onClick={() => setDrawerInvoice(null)} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10 w-full max-w-lg bg-white dark:bg-dark-card border-l border-gray-150 dark:border-dark-border shadow-2xl h-full flex flex-col justify-between p-6 sm:p-8 overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">{drawerInvoice.buyer}</h3>
                    <span className="text-[10px] text-gray-400 font-semibold">{drawerInvoice.id}</span>
                  </div>
                  <button 
                    onClick={() => setDrawerInvoice(null)}
                    className="p-1.5 rounded-lg border border-gray-100 dark:border-slate-800 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Summary Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Amount', value: formatCurrency(drawerInvoice.amount) },
                    { label: 'Yield Expectation', value: `${drawerInvoice.yieldRate}% APY`, color: 'text-violet-500' },
                    { label: 'Due Date', value: drawerInvoice.dueDate },
                    { label: 'AI Risk Grade', value: drawerInvoice.grade, color: 'text-success-500' },
                    { label: 'Blockchain hash', value: drawerInvoice.tokenUrl },
                    { label: 'Auction status', value: drawerInvoice.status },
                    { label: 'On-chain Repayment History', value: reputationScore !== null ? `${reputationScore}% On-Time` : 'Loading...', color: 'text-blue-500' }
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl border border-gray-100 dark:border-slate-800/80 bg-gray-50/50 dark:bg-slate-900/30 text-xs">
                      <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
                      <div className={`font-bold ${item.color || 'text-gray-800 dark:text-white'}`}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Blockchain Proof */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    Blockchain Proof <CheckCircle2 className="h-3 w-3 text-success-500" />
                  </h4>
                  <div className="p-4 rounded-xl border border-gray-100 dark:border-slate-800/80 bg-gray-50/50 dark:bg-slate-900/30 text-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Invoice NFT Contract</span>
                      <a href={`https://amoy.polygonscan.com/address/${import.meta.env.VITE_NFT_CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-bold hover:underline flex items-center gap-1">
                        View on Polygonscan <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Escrow Factory</span>
                      <a href={`https://amoy.polygonscan.com/address/${import.meta.env.VITE_ESCROW_FACTORY_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-bold hover:underline flex items-center gap-1">
                        View on Polygonscan <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bid History */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Bids History</h4>
                  {drawerInvoice.bids.length > 0 ? (
                    <div className="space-y-2">
                      {drawerInvoice.bids.map((b, i) => (
                        <div key={i} className="p-3 rounded-xl border border-gray-100 dark:border-slate-800/50 bg-white dark:bg-dark-card flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-gray-800 dark:text-white">{b.investor}</div>
                            <span className="text-[10px] text-gray-400">{b.date}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(b.bid)}</div>
                            <span className="text-[10px] font-bold text-violet-500">{b.yield}% APY</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 py-3 text-center border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">No active bids yet. Be the first to place a bid!</div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="border-t border-gray-100 dark:border-slate-800 pt-6 mt-6 flex gap-4">
                <button 
                  onClick={() => setBidInvoice(drawerInvoice)}
                  disabled={drawerInvoice.status === 'Funded'}
                  className="flex-1 py-3 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-500/10 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Bid
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bid Modal Dialog */}
      <AnimatePresence>
        {bidInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-2xl space-y-6"
            >
              {bidSuccess ? (
                /* ── Success Screen ─────────────────────────────────────── */
                <div className="text-center space-y-6 py-4">
                  <div className="relative mx-auto h-16 w-16 rounded-full bg-success-500 flex items-center justify-center text-white shadow-lg shadow-success-500/25">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-extrabold text-xl">
                      {confirmedTxHash ? 'Investment Confirmed On-chain!' : 'Bid Recorded'}
                    </h3>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto">
                      {confirmedTxHash
                        ? 'Your MATIC has been locked in the escrow smart contract on Polygon Amoy.'
                        : 'Your bid intent has been recorded. Blockchain settlement pending admin approval.'}
                    </p>
                  </div>

                  {confirmedTxHash && (
                    <a
                      href={`https://amoy.polygonscan.com/tx/${confirmedTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary-500 hover:text-primary-600 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View on Polygonscan
                    </a>
                  )}

                  <button 
                    onClick={handleCloseBidFlow}
                    className="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition"
                  >
                    Back to Marketplace
                  </button>
                </div>
              ) : (
                /* Place bid form details */
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-display font-bold text-base text-gray-900 dark:text-white">Place Financing Bid</h3>
                      <span className="text-[10px] text-gray-400 font-semibold">{bidInvoice.buyer} • {bidInvoice.id}</span>
                    </div>
                    <button 
                      onClick={() => setBidInvoice(null)}
                      className="text-xs font-bold text-gray-400 hover:text-gray-600 transition"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    {/* Quick Match Asked Terms Card */}
                    <div className="rounded-xl border border-primary-500/30 bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-transparent p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-primary-500/20 text-primary-400">
                            <Zap className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span>Quick Match Asked Terms</span>
                              <span className="inline-block px-1.5 py-0.2 text-[9px] rounded bg-primary-500/20 text-primary-400 font-semibold uppercase">1-Click</span>
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                              Asking: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(bidInvoice.amount || 0)}</span> • Target: <span className="font-semibold text-violet-400">{bidInvoice.yieldRate ?? bidInvoice.yield ?? 8.5}% APY</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAutoMatchTerms(1)}
                          className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition shadow-md shadow-primary-500/20 flex items-center gap-1 flex-shrink-0"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Match 100%</span>
                        </button>
                      </div>

                      {/* Percentage funding presets */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-primary-500/10">
                        {[
                          { label: '100% Full', pct: 1 },
                          { label: '80% Adv.', pct: 0.8 },
                          { label: '50% Half', pct: 0.5 },
                          { label: '25% Entry', pct: 0.25 }
                        ].map((chip) => (
                          <button
                            key={chip.label}
                            type="button"
                            onClick={() => handleAutoMatchTerms(chip.pct)}
                            className="py-1 px-1.5 rounded-lg bg-gray-100 dark:bg-slate-800/90 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-[10px] font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition border border-transparent hover:border-primary-500/30 text-center"
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Bid Amount (INR)</label>
                        <button
                          type="button"
                          onClick={() => setBidAmount(String(bidInvoice.amount || ''))}
                          className="text-[10px] font-bold text-primary-500 hover:text-primary-400 underline transition"
                        >
                          Fill Max ({formatCurrency(bidInvoice.amount || 0)})
                        </button>
                      </div>
                      <input
                        type="number"
                        placeholder="e.g. 500000"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="block w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 p-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Expected Yield APY (%)</label>
                        <button
                          type="button"
                          onClick={() => setExpectedYield(String(bidInvoice.yieldRate ?? bidInvoice.yield ?? 8.5))}
                          className="text-[10px] font-bold text-violet-500 hover:text-violet-400 underline transition"
                        >
                          Match Target ({bidInvoice.yieldRate ?? bidInvoice.yield ?? 8.5}%)
                        </button>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 8.2"
                        value={expectedYield}
                        onChange={(e) => setExpectedYield(e.target.value)}
                        className="block w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 p-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition"
                        required
                      />
                    </div>

                    {/* Transaction Status Banner */}
                  {txStatus === 'awaiting_wallet' && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-400">
                      <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                      <span>Waiting for MetaMask confirmation…</span>
                    </div>
                  )}
                  {txStatus === 'pending' && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-400">
                      <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                      <div>
                        <div className="font-bold">Transaction Submitted</div>
                        <div className="text-[10px] opacity-80">Waiting for Polygon Amoy confirmation (10–30s)…</div>
                        {txHash && (
                          <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                            className="underline text-[10px] font-bold">Track on Polygonscan ↗</a>
                        )}
                      </div>
                    </div>
                  )}
                  {txStatus === 'failed' && txError && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Transaction Failed</div>
                        <div className="text-[10px] opacity-80 break-words">{txError}</div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={txStatus === 'awaiting_wallet' || txStatus === 'pending'}
                    className="w-full py-3.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {txStatus === 'awaiting_wallet' ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Waiting for MetaMask…</>
                    ) : txStatus === 'pending' ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Confirming on Polygon…</>
                    ) : (
                      <><span>Sign &amp; Fund via MetaMask</span></>
                    )}
                  </button>
                  </form>
                </>
              )}
            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </ContentContainer>
  );
}
