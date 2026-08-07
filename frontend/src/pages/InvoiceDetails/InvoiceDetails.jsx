import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Calendar, FileText, Landmark, ShieldCheck,
  Brain, Cpu, ArrowLeft, Download, Share2, Plus,
  Layers, Lock, Play, HelpCircle, Activity,
  DollarSign, CheckCircle2, ChevronRight, FileCode, Sparkles,
  TrendingUp, AlertTriangle, ShieldAlert, Award, FileCode2,
  Clock, Info, Check, Share, XCircle, AlertCircle, RefreshCw, Hexagon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ContentContainer from '@/components/layout/ContentContainer';
import PageHeader from '@/components/layout/PageHeader';
import toast from 'react-hot-toast';
import { 
  useInvoice, 
  useAIReport, 
  useAnalyzeInvoice,
  useVerificationReport,
  useVerifyInvoice,
  useListInvoice,
  useMintNFT
} from '@/hooks/useInvoices';
import { marketplaceService } from '@/services/marketplaceService';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const TIMELINE_STAGES = [
  { id: 'upload', name: 'Invoice Uploaded', desc: 'Metadata successfully parsed.' },
  { id: 'ai', name: 'AI Underwriting Complete', desc: 'Credit risk parameters analyzed by Llama.' },
  { id: 'verification', name: 'Compliance Verified', desc: 'Deterministic checks and rules passed.' },
  { id: 'buyer', name: 'Corporate Buyer Approval', desc: 'Counterparty buyer acknowledged delivery and liability.' },
  { id: 'nft', name: 'Asset Minted (NFT)', desc: 'Polygon Amoy ERC-721 token generated.' },
  { id: 'marketplace', name: 'List to Marketplace', desc: 'Open funding pool to global investors.' }
];

/* ─── Premium AI Underwriting Loading Component ───────────────────────────── */
const AIAnalysisLoader = ({ onComplete }) => {
  const stages = [
    { label: 'Reading Invoice', desc: 'Ingesting raw text & structure…' },
    { label: 'Understanding Business', desc: 'Evaluating buyer-seller relationships…' },
    { label: 'Evaluating Credit', desc: 'Running comparative risk matrices…' },
    { label: 'Checking Risk', desc: 'Detecting fraud & GST compliance…' },
    { label: 'Generating Insights', desc: 'Compiling yields and optimal funding caps…' },
    { label: 'Building Report', desc: 'Formatting underwriting dossier…' }
  ];

  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentStage < stages.length - 1) {
            setCurrentStage(curr => curr + 1);
            return 0;
          } else {
            clearInterval(progressInterval);
            return 100;
          }
        }
        return prev + 8;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [currentStage]);

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-dark-card/90 p-8 shadow-2xl space-y-6 relative overflow-hidden animate-fade-in backdrop-blur-md">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />

      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 animate-pulse">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Underwriting Engine</h3>
          <p className="text-[10px] text-gray-400">Underwriting model: Llama 3.3 70B (Groq Protocol)</p>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage, idx) => {
          const isDone = idx < currentStage;
          const isActive = idx === currentStage;

          return (
            <div
              key={stage.label}
              className={`p-3.5 rounded-xl border transition-all duration-300 ${
                isActive
                  ? 'border-blue-500/30 bg-blue-950/20'
                  : isDone
                  ? 'border-emerald-500/20 bg-emerald-950/5'
                  : 'border-transparent opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] ${
                    isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-800 text-gray-500'
                  }`}>
                    {isDone ? <Check className="h-3 w-3" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-bold ${isActive ? 'text-blue-400' : isDone ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {stage.label}
                  </span>
                </div>
                {isActive && (
                  <span className="text-[10px] text-blue-400 font-mono font-bold">{progress}%</span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 pl-6">{stage.desc}</p>
              {isActive && (
                <div className="h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Main Details Page ─────────────────────────────────────────────────────── */
export default function InvoiceDetails() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Queries & Mutations
  const { data: dbInvoice, isLoading: invoiceLoading, refetch: refetchInvoice } = useInvoice(invoiceId);
  const { data: reportEnvelope, isLoading: reportLoading, refetch: refetchReport } = useAIReport(invoiceId);
  const { data: verEnvelope, isLoading: verLoading, refetch: refetchVerification } = useVerificationReport(invoiceId);
  
  const { mutate: analyze } = useAnalyzeInvoice();
  const { mutate: runVerify } = useVerifyInvoice();
  const { mutate: listInvoice } = useListInvoice();
  const { mutate: mintNFT } = useMintNFT();

  // Timeline & UI state
  const [activeStage, setActiveStage] = useState('upload');
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [listingData, setListingData] = useState(null);

  useEffect(() => {
    const unsub = marketplaceService.subscribeListings(data => {
      const match = data.find(l => 
        l.invoiceId === invoiceId || 
        l.id === invoiceId || 
        l.docId === invoiceId ||
        (dbInvoice?.invoiceNumber && (l.id === dbInvoice.invoiceNumber || l.invoiceId === dbInvoice.invoiceNumber)) ||
        (dbInvoice?.invoiceId && (l.invoiceId === dbInvoice.invoiceId || l.id === dbInvoice.invoiceId))
      );
      setListingData(match || null);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [invoiceId, dbInvoice]);

  const report = reportEnvelope?.report;
  const verReport = verEnvelope?.report;

  const invoice = dbInvoice || {
    invoiceId: invoiceId || 'INV-2026-085',
    invoiceNumber: 'INV-2026-085',
    buyerName: 'Tata Motors Group',
    sellerName: 'TextilePro Industries Ltd',
    invoiceAmount: 1240000,
    invoiceDate: '2026-07-09',
    dueDate: '2026-09-09',
    sellerGST: '27AAAAA0000A1Z5',
    buyerGST: '27BBBBB0000B1Z6',
    invoiceStatus: 'PENDING_AI',
    riskScore: 0,
    createdAt: new Date().toISOString()
  };

  // Derived status states
  const isBuyerApproved = invoice.buyerApproved === true || invoice.verificationStatus === 'BUYER_APPROVED';
  const isMinted = ['MINTED', 'TOKENIZED', 'ESCROWED'].includes(invoice.blockchainStatus);
  const isListed = invoice.invoiceStatus === 'Listed' || invoice.invoiceStatus === 'LISTED';

  // Compute per-stage pass/active status from real data
  const stageStatus = React.useMemo(() => {
    const hasInvoice     = !!dbInvoice;
    const hasAI          = !!report;
    const hasVerify      = !!verReport;

    return {
      upload:       { done: hasInvoice,        active: hasInvoice && !hasAI },
      ai:           { done: hasAI,             active: hasAI && !hasVerify },
      verification: { done: hasVerify,         active: hasVerify && !isBuyerApproved },
      buyer:        { done: isBuyerApproved,   active: hasVerify && !isBuyerApproved },
      nft:          { done: isMinted,          active: isBuyerApproved && !isMinted },
      marketplace:  { done: isListed,          active: isMinted && !isListed },
    };
  }, [dbInvoice, report, verReport, isBuyerApproved, isMinted, isListed]);


  const handleTriggerAnalysis = () => {
    setShowLoadingAnimation(true);
    analyze(
      { invoiceId },
      {
        onSuccess: () => {
          setTimeout(() => {
            setShowLoadingAnimation(false);
            refetchReport();
          }, 1500);
        },
        onError: () => {
          setShowLoadingAnimation(false);
        }
      }
    );
  };

  const handleTriggerVerification = () => {
    setVerifying(true);
    runVerify(
      { invoiceId },
      {
        onSuccess: () => {
          setVerifying(false);
          refetchVerification();
          refetchReport();
        },
        onError: () => {
          setVerifying(false);
        }
      }
    );
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const handleListMarketplace = () => {
    listInvoice(
      { invoiceId },
      {
        onSuccess: () => {
          refetchVerification();
          refetchInvoice();
        }
      }
    );
  };

  const handleMintNFT = () => {
    mintNFT(
      { invoiceId },
      {
        onSuccess: () => {
          refetchInvoice();
          refetchVerification();
        }
      }
    );
  };

  const handleApproveInvoice = async () => {
    setApprovingId(invoiceId);
    try {
      await axios.post(`${API_BASE}/v1/admin/invoices/${invoiceId}/approve`);
      toast.success('Invoice approved, tokenized, and escrowed!');
      // Refetch everything
      refetchVerification();
      refetchReport();
    } catch (err) {
      toast.error('Approval failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setApprovingId(null);
    }
  };

  const handleAcceptBid = async (bidData) => {
    try {
      const targetId = listingData?.id || listingData?.invoiceId || listingData?.docId || invoiceId;
      toast.loading('Accepting investor bid...', { id: 'accept-bid' });
      await marketplaceService.acceptBid(targetId, bidData);
      setListingData(prev => prev ? {
        ...prev,
        status: 'Funded',
        progress: 100,
        acceptedBid: bidData
      } : prev);
      toast.success('🎉 Bid accepted! Escrow locked & invoice status updated to FUNDED.', { id: 'accept-bid', duration: 5000 });
      refetchInvoice();
      refetchVerification();
    } catch (err) {
      toast.error('Failed to accept bid: ' + err.message, { id: 'accept-bid' });
    }
  };

  if (invoiceLoading || reportLoading || verLoading) {
    return (
      <ContentContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-gray-400">
          <Activity className="h-8 w-8 text-primary-500 animate-spin" />
          <p className="text-xs">Fetching transaction registers & report vaults…</p>
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Workspace</span>
        </button>

        <div className="flex gap-2">
          <button onClick={() => toast.success('Report PDF downloaded')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-150 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-white/5 transition text-xs font-semibold text-gray-600 dark:text-gray-400">
            <Download className="h-4 w-4" />
            <span>PDF Report</span>
          </button>
          <button onClick={() => toast.success('Share link copied')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-150 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-white/5 transition text-xs font-semibold text-gray-600 dark:text-gray-400">
            <Share2 className="h-4 w-4" />
            <span>Share Report</span>
          </button>

          {currentUser?.role === 'admin' && invoice.invoiceStatus !== 'Listed' && invoice.invoiceStatus !== 'Funded' && invoice.blockchainStatus !== 'ESCROWED' && invoice.blockchainStatus !== 'TOKENIZED' && (
            <button
              onClick={handleApproveInvoice}
              disabled={approvingId === invoiceId}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20 disabled:opacity-60"
            >
              {approvingId === invoiceId ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              <span>Admin: Approve & Tokenize</span>
            </button>
          )}
          
          {verReport && verReport.eligibleForMarketplace && !isMinted && (
            isBuyerApproved ? (
              <button
                onClick={handleMintNFT}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white text-xs font-bold transition shadow-lg shadow-violet-500/20 animate-pulse"
              >
                <Hexagon className="h-4 w-4" />
                <span>Mint NFT</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold" title="Awaiting Corporate Buyer Approval">
                <Clock className="h-4 w-4 animate-spin text-amber-400" />
                <span>Awaiting Buyer Approval</span>
              </div>
            )
          )}

          {verReport && verReport.eligibleForMarketplace && isMinted && isBuyerApproved && !isListed && invoice.invoiceStatus !== 'Funded' && (
            <button
              onClick={handleListMarketplace}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition shadow-lg shadow-blue-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>List on Marketplace</span>
            </button>
          )}
        </div>
      </div>

      {/* Invoice Title */}
      <div className="border-b border-gray-150 dark:border-slate-800/80 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
            {invoice.invoiceNumber || invoice.id}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Buyer Counterparty: <span className="font-semibold text-gray-700 dark:text-gray-300">{invoice.buyerCompany || invoice.buyerName || invoice.buyer}</span>
          </p>
        </div>

        {/* Dynamic status badges */}
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
          <span className={`px-2.5 py-1 rounded ${
            report ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
          }`}>
            Risk: {report ? `${report.creditGrade} (${report.paymentRiskScore}/100)` : 'PENDING'}
          </span>
          <span className={`px-2.5 py-1 rounded ${
            (invoice.buyerApproved === true || invoice.verificationStatus === 'BUYER_APPROVED')
              ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
          }`}>
            Buyer: {(invoice.buyerApproved === true || invoice.verificationStatus === 'BUYER_APPROVED') ? 'APPROVED ✓' : 'AWAITING APPROVAL'}
          </span>
          <span className={`px-2.5 py-1 rounded ${
            verReport?.eligibleForMarketplace ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
          }`}>
            Marketplace: {verReport?.eligibleForMarketplace ? 'READY' : 'INELIGIBLE'}
          </span>
          <span className="px-2.5 py-1 rounded bg-violet-500/10 text-violet-500">
            NFT Status: {invoice.blockchainStatus || 'UNMINTED'}
          </span>
        </div>
      </div>

      {/* Main Content split */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Hybrid Decision & Verification Report Checklist Widget */}
          {verReport && (
            <div className="rounded-2xl border border-gray-150 dark:border-slate-800/80 bg-white dark:bg-dark-card p-6 shadow-sm space-y-6">
              
              {/* Heading */}
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Marketplace Compliance Dossier
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-medium">Readiness Score:</span>
                  <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${
                    verReport.readinessScore >= 80 ? 'bg-emerald-500/10 text-emerald-400' : verReport.readinessScore >= 60 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {verReport.readinessScore} / 100
                  </span>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                verReport.overallStatus === 'Approved'
                  ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400'
                  : verReport.overallStatus === 'Needs Review'
                  ? 'border-amber-500/20 bg-amber-950/10 text-amber-400'
                  : 'border-rose-500/20 bg-rose-950/10 text-rose-400'
              }`}>
                <div className="flex items-center gap-3">
                  {verReport.overallStatus === 'Approved' ? (
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
                  ) : verReport.overallStatus === 'Needs Review' ? (
                    <AlertCircle className="h-6 w-6 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">
                      Overall Status: {verReport.overallStatus} ({verReport.riskLevel} Risk)
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Next step: {verReport.nextStep}</p>
                  </div>
                </div>
                {verReport.eligibleForMarketplace && (
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30">
                    Marketplace Ready
                  </span>
                )}
              </div>

              {/* Rules Checklist Grid */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Rule Check Verification Log
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(verReport.ruleValidation || {}).map(([ruleKey, data]) => {
                    const passed = data.passed;
                    return (
                      <div 
                        key={ruleKey} 
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-colors duration-200 ${
                          passed
                            ? 'border-emerald-500/10 bg-emerald-950/5'
                            : 'border-rose-500/10 bg-rose-950/5'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {passed ? (
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4.5 w-4.5 text-rose-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white capitalize">
                            {ruleKey.replace(/_/g, ' ')}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5" title={data.message}>
                            {data.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendation bullets */}
              {verReport.recommendations && verReport.recommendations.length > 0 && (
                <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-slate-900/10 border border-gray-100 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                    Underwriter Action Items
                  </span>
                  <ul className="space-y-1 text-[11px] text-gray-400">
                    {verReport.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-blue-500">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trigger Re-run */}
              <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                <button
                  disabled={verifying}
                  onClick={handleTriggerVerification}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 text-xs font-semibold text-white transition disabled:opacity-40"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${verifying ? 'animate-spin' : ''}`} />
                  <span>Run Verification Pipeline</span>
                </button>
              </div>

            </div>
          )}

          {/* Trigger Verification Banner (if report doesn't exist) */}
          {!verReport && report && (
            <div className="rounded-2xl border border-blue-500/20 bg-dark-card p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-sm font-bold text-white">Verification Check Pending</h3>
                <p className="text-xs text-gray-400">Run deterministic validation checks to verify buyer metadata & duplicate hashes.</p>
              </div>
              <button
                disabled={verifying}
                onClick={handleTriggerVerification}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="h-4.5 w-4.5" />
                <span>{verifying ? 'Verifying…' : 'Verify Compliance'}</span>
              </button>
            </div>
          )}

          {/* AI Underwriting Loading/Form Banner */}
          <AnimatePresence mode="wait">
            {showLoadingAnimation ? (
              <AIAnalysisLoader key="loader" />
            ) : !report ? (
              <motion.div 
                key="analyze-banner"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-950/20 to-dark-card p-6 shadow-xl space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400">
                    <Brain className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Underwriting Pending</h3>
                    <p className="text-xs text-gray-400">Extract deeper liquidity parameters and delay predictions.</p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Generate an institutional credit analysis including payment delay probability, maximum safe funding caps,expected yields, and fraud indicator records using Llama 3.3 70B model logic.
                </p>

                <button
                  onClick={handleTriggerAnalysis}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <Cpu className="h-4 w-4" />
                  <span>Analyze Invoice with AI</span>
                </button>
              </motion.div>
            ) : (
              /* AI Credit Intelligence Report display */
              <motion.div
                key="report-card"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Score */}
                  <div className="rounded-2xl border border-white/5 bg-dark-card p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Credit Risk Score</span>
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke={report.paymentRiskScore < 30 ? '#10b981' : report.paymentRiskScore < 60 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * report.paymentRiskScore) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-xl font-extrabold text-white">{report.paymentRiskScore}</span>
                        <span className="text-[9px] text-gray-400">/ 100</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-2 font-medium">Lower is safer</span>
                  </div>

                  {/* AI Grade Card */}
                  <div className="rounded-2xl border border-white/5 bg-dark-card p-5 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Underwriting Grade</span>
                    <div className="h-16 w-16 rounded-full bg-blue-500/10 ring-1 ring-blue-500/20 flex items-center justify-center mb-2">
                      <span className="text-2xl font-black text-blue-400">{report.creditGrade}</span>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider">
                      {report.probabilityOfOnTimePayment * 100}% On-Time Prob.
                    </span>
                  </div>

                  {/* Funding recommendation card */}
                  <div className="rounded-2xl border border-white/5 bg-dark-card p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Funding Cap</span>
                      <span className="text-2xl font-extrabold text-white block">{report.recommendedMaximumFundingPercentage}%</span>
                      <span className="text-[10px] text-gray-400 block mt-1">Recommended Max Advance</span>
                    </div>
                    <div className="border-t border-white/5 pt-2 mt-2 flex justify-between text-[10px]">
                      <span className="text-gray-500">Expected Yield</span>
                      <span className="text-emerald-400 font-bold">+{report.expectedInvestorYield}% APR</span>
                    </div>
                  </div>
                </div>

                {/* Summaries & Recommendation text */}
                <div className="rounded-2xl border border-white/5 bg-dark-card p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <Sparkles className="h-4.5 w-4.5 text-blue-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Executive Assessment</h3>
                  </div>

                  <div className="space-y-3.5 text-xs text-gray-300 leading-relaxed">
                    <div>
                      <span className="font-bold text-white block mb-0.5">Business Profile</span>
                      <p>{report.businessSummary}</p>
                    </div>
                    <div>
                      <span className="font-bold text-white block mb-0.5">Invoice Scope</span>
                      <p>{report.invoiceSummary}</p>
                    </div>
                    <div>
                      <span className="font-bold text-white block mb-0.5">Underwriter Recommendation</span>
                      <p className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/10 text-blue-300">
                        {report.investmentRecommendation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Signal analysis split panel */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-emerald-500/10 bg-emerald-950/5 p-5 space-y-3">
                    <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Positive Indicators</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-gray-400">
                      {report.positiveIndicators.map((s, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <span className="text-emerald-500 mt-0.5">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-rose-500/10 bg-rose-950/5 p-5 space-y-3">
                    <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Risk Factors</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-gray-400">
                      {report.riskFactors.map((f, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <span className="text-rose-500 mt-0.5">⚠</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Fraud & Confidence details */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/5 bg-dark-card p-5 space-y-3">
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <span>Fraud Indicator Logs</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-gray-400">
                      {report.fraudIndicators.length === 0 || (report.fraudIndicators.length === 1 && report.fraudIndicators[0] === "") ? (
                        <li className="text-gray-500 italic text-[11px]">No duplicate billing or entity conflicts flagged</li>
                      ) : (
                        report.fraudIndicators.map((flag, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-rose-400 mt-0.5">•</span>
                            <span>{flag}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-dark-card p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Activity className="h-4 w-4 text-blue-400" />
                        <span>Underwriter Confidence Meter</span>
                      </h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Evaluates source text readability, GST validation, and amount compliance.
                      </p>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-xs font-bold text-white">
                        <span>Confidence Level</span>
                        <span>{Math.round(report.confidenceScore * 100)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                          style={{ width: `${report.confidenceScore * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Underwriter Explanation */}
                <div className="rounded-2xl border border-white/5 bg-dark-card p-6 space-y-3">
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-blue-400" />
                    <span>Detailed Underwriting Rationale</span>
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                    {report.aiExplanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Bill Details Cards */}
          <div className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-dark-card p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 pb-3">Bill Particulars</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              {[
                { label: 'Seller Entity', value: invoice.sellerName },
                { label: 'Buyer Entity', value: invoice.buyerName },
                { label: 'Seller GSTIN Number', value: invoice.sellerGST || '27AAAAA0000A1Z5' },
                { label: 'Buyer GSTIN Number', value: invoice.buyerGST || '27BBBBB0000B1Z6' },
                { label: 'Invoice Date', value: invoice.invoiceDate },
                { label: 'Due Maturity Date', value: invoice.dueDate },
                { label: 'Ingested Time', value: invoice.createdAt ? new Date(invoice.createdAt).toLocaleString() : 'N/A' }
              ].map((info) => (
                <div key={info.label} className="p-3.5 rounded-xl border border-gray-100 dark:border-slate-800/80 bg-gray-50/30 dark:bg-slate-900/10">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{info.label}</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{info.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Live Auction & Bids Section */}
        {(listingData || (invoice.bids && invoice.bids.length > 0)) && (
          <div className="rounded-2xl border border-primary-500/20 bg-primary-950/5 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-primary-500/20 pb-3">
              <Landmark className="h-5 w-5 text-primary-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Live Auction Bids</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-auto ${
                (listingData?.status || invoice.invoiceStatus) === 'Funded' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary-500/20 text-primary-500'
              }`}>
                {listingData?.status || invoice.invoiceStatus || 'Live Auction'}
              </span>
            </div>

            {((listingData?.status === 'Funded' && listingData?.acceptedBid) || (invoice.invoiceStatus === 'Funded' && invoice.acceptedBid)) && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <p className="text-xs font-bold mb-1">Bid Accepted</p>
                <p className="text-[10px]">
                  You accepted the bid from <strong>{(listingData?.acceptedBid || invoice.acceptedBid).investor}</strong> for <strong>{formatCurrency((listingData?.acceptedBid || invoice.acceptedBid).bid)}</strong> at <strong>{(listingData?.acceptedBid || invoice.acceptedBid).yield}% APY</strong>.
                </p>
              </div>
            )}

            {((listingData?.bids || invoice.bids || []).length === 0) ? (
              <p className="text-xs text-gray-500 italic py-4 text-center">Waiting for investor bids...</p>
            ) : (
              <div className="space-y-3">
                {(listingData?.bids || invoice.bids || []).map((bid, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-dark-card flex justify-between items-center gap-4 hover:border-primary-500/50 transition">
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white">{bid.investor}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">{bid.date || 'Recent'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-primary-600 dark:text-primary-400">{formatCurrency(bid.bid)}</p>
                      <p className="text-[10px] font-semibold text-emerald-500 mt-0.5">{bid.yield}% APY</p>
                    </div>
                    {(listingData?.status !== 'Funded' && invoice.invoiceStatus !== 'Funded') && (
                      <button
                        onClick={() => handleAcceptBid(bid)}
                        className="ml-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[10px] font-bold transition shadow-md shadow-primary-500/20 cursor-pointer"
                      >
                        Accept Bid
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Timeline */}
          <div className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-dark-card p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Underwriting Journey</h3>
            <div className="space-y-4">
              {TIMELINE_STAGES.map((stage) => {
                const s = stageStatus[stage.id] || {};
                const isDone   = !!s.done;
                const isActive = !!s.active;

                return (
                  <div
                    key={stage.id}
                    className={`flex items-start gap-4 p-3 rounded-xl border transition duration-200 ${
                      isActive && !isDone
                        ? 'border-blue-500/30 bg-blue-950/5'
                        : isDone
                        ? 'border-emerald-500/10'
                        : 'border-transparent'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-blue-500 text-white animate-pulse'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                    }`}>
                      {isDone ? '✓' : '○'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white">{stage.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial summary KPIs */}
          <div className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-dark-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold border-b border-gray-100 dark:border-slate-800 pb-3 text-gray-900 dark:text-white">Projections</h3>
            <div className="space-y-4 text-xs">
              {[
                { label: 'Face Value (Gross)', value: formatCurrency(invoice.invoiceAmount) },
                { label: 'Recommended Advance', value: formatCurrency(report ? (invoice.invoiceAmount * report.recommendedMaximumFundingPercentage / 100) : (invoice.invoiceAmount * 0.80)) },
                { label: 'Platform Protocol Fee (2%)', value: formatCurrency(invoice.invoiceAmount * 0.02) },
                { label: 'Investor Net Return (Est)', value: formatCurrency(invoice.invoiceAmount * 0.78), color: 'text-blue-500 font-bold' }
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="font-semibold text-gray-400 dark:text-gray-500">{item.label}</span>
                  <span className={item.color || 'text-gray-800 dark:text-white font-semibold'}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </ContentContainer>
  );
}
