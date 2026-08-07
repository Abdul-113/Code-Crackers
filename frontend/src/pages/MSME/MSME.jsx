import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, UploadCloud, Brain, ShieldCheck, 
  Hexagon, Landmark, Key, Banknote, HelpCircle, 
  Cpu, Activity, Plus, RefreshCw, FileText, 
  TrendingUp, AlertTriangle, Calendar, FileCode, Trash2, ArrowUpRight, 
  CheckCircle2, ChevronRight, Download, Upload, Trash, Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { invoiceService } from '@/services/invoiceService';
import { marketplaceService } from '@/services/marketplaceService';
import { useInvoices, useListInvoice } from '@/hooks/useInvoices';
import ContentContainer from '@/components/layout/ContentContainer';
import PageHeader from '@/components/layout/PageHeader';
import toast from 'react-hot-toast';

// Stepper components import
import WizardStepper from './components/WizardStepper';
import InvoiceUploadZone from './components/InvoiceUploadZone';
import AIScanAnimation from './components/AIScanAnimation';
import ExtractedDataCard from './components/ExtractedDataCard';
import GSTVerificationCard from './components/GSTVerificationCard';
import DuplicateCheckAnimation from './components/DuplicateCheckAnimation';
import RiskScoreCard from './components/RiskScoreCard';
import NFTPreview from './components/NFTPreview';
import MarketplaceReadyScreen from './components/MarketplaceReadyScreen';

export default function MSME() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // View controller states
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [listingInvoiceId, setListingInvoiceId] = useState(null);

  // Workspace states
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDocCategory, setSelectedDocCategory] = useState('Invoices');

  // Document mock items
  const [documents, setDocuments] = useState([
    { name: 'Tata_Motors_Q2_Invoice.pdf', size: '1.2 MB', category: 'Invoices', date: 'Jul 08' },
    { name: 'Purchase_Order_MHD-884.pdf', size: '840 KB', category: 'Purchase Orders', date: 'Jul 06' },
    { name: 'Corporate_GST_Return_Q1.pdf', size: '2.4 MB', category: 'GST Documents', date: 'Jul 01' }
  ]);

  // Load user invoices
  const { data: dbInvoices, refetch: refetchInvoices } = useInvoices(currentUser?.uid || currentUser?.email);
  const invoices = dbInvoices || [];
  
  const [listings, setListings] = useState([]);
  
  useEffect(() => {
    const unsub = marketplaceService.subscribeListings(data => {
      setListings(data);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'upload') {
      setShowWizard(true);
      // Clean up the URL so it doesn't reopen on refresh
      window.history.replaceState({}, '', '/app/msme');
    }
  }, []);

  // List on marketplace mutation
  const { mutate: listInvoice } = useListInvoice();

  const handleListMarketplace = (inv) => {
    if (inv.verificationStatus !== 'VERIFIED') {
      toast.error('Please run Compliance Verification on the invoice detail page first.');
      return;
    }
    setListingInvoiceId(inv.invoiceId);
    listInvoice(
      { invoiceId: inv.invoiceId },
      {
        onSuccess: () => {
          setListingInvoiceId(null);
          refetchInvoices();
        },
        onError: () => setListingInvoiceId(null),
      }
    );
  };


  const handleNextStep = (data) => {
    if (wizardStep === 1 && data) setFile(data);
    if (wizardStep === 2 && data) setExtractedData(data);
    setWizardStep(prev => prev + 1);
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    setWizardStep(1);
    setFile(null);
    setExtractedData(null);
  };

  const handleDocumentDelete = (name) => {
    setDocuments(prev => prev.filter(doc => doc.name !== name));
    toast.success("Document removed from file center.");
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <ContentContainer>
      
      {/* 1. Full-screen Upload Onboarding Wizard */}
      <AnimatePresence>
        {showWizard ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-3xl mx-auto w-full pt-4"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Wizard Pipeline</span>
              <button 
                onClick={handleCloseWizard}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                Close &amp; Return
              </button>
            </div>

            <WizardStepper step={wizardStep} />

            <div className="rounded-3xl border border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card p-8 sm:p-12 shadow-2xl backdrop-blur-md relative">
              {wizardStep === 1 && (
                <InvoiceUploadZone onNext={handleNextStep} />
              )}
              {wizardStep === 2 && (
                <AIScanAnimation file={file} onNext={handleNextStep} />
              )}
              {wizardStep === 3 && (
                <ExtractedDataCard initialData={extractedData} onNext={handleNextStep} />
              )}
              {wizardStep === 4 && (
                <GSTVerificationCard extractedData={extractedData} onNext={handleNextStep} />
              )}
              {wizardStep === 5 && (
                <DuplicateCheckAnimation onNext={handleNextStep} />
              )}
              {wizardStep === 6 && (
                <RiskScoreCard extractedData={extractedData} onNext={handleNextStep} />
              )}
              {wizardStep === 7 && (
                <NFTPreview onNext={handleNextStep} />
              )}
              {wizardStep === 8 && (
                <MarketplaceReadyScreen />
              )}
            </div>
          </motion.div>
        ) : (
          
          /* 2. Operational MSME Workspace Dashboard */
          <div className="space-y-8">
            
            {/* Header section with statuses */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-gray-100 dark:border-slate-800/80 pb-6">
              <div>
                <h1 className="text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
                  MSME Workspace
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage invoices, funding requests, and business documents.
                </p>
              </div>

              {/* Status Tags Row */}
              <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wider">
                <span className="px-3 py-1.5 rounded-full border border-success-100 dark:border-success-950 bg-success-50 dark:bg-success-950/20 text-success-600 dark:text-success-400">
                  GST Verified ✓
                </span>
                <span className="px-3 py-1.5 rounded-full border border-primary-100 dark:border-primary-950 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400">
                  Eligibility: A+ Grade
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-3 items-center justify-between border-b border-gray-50 dark:border-slate-800/50 pb-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowWizard(true)}
                  className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-primary-500/10"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>Upload New Invoice</span>
                </button>
                <button 
                  onClick={() => toast.success('Reports updated')}
                  className="px-4 py-2.5 rounded-xl border border-gray-150 dark:border-slate-800 text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  Generate AI Report
                </button>
              </div>

              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Active Wallet: <span className="text-indigo-500">0x32bF...94dE</span>
              </div>
            </div>

            {/* Split Workspace Layout */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left Column: Invoices list & Document Center */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Invoice Cards list */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Invoices</h3>
                  {invoices.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {invoices.map((inv) => {
                        const status = inv.invoiceStatus || inv.status || 'PENDING';
                        const isFunded = status === 'Funded' || status === 'FUNDED' || inv.blockchainStatus === 'ESCROWED' || inv.isFunded === true;
                        const isListed = !isFunded && (status === 'Listed' || status === 'LISTED' || status === 'Auction Live');
                        const isBuyerApproved = inv.buyerApproved === true || inv.verificationStatus === 'BUYER_APPROVED';
                        const isVerified = inv.verificationStatus === 'BUYER_APPROVED' || inv.verificationStatus === 'VERIFIED' || isBuyerApproved;
                        const isMinted = ['TOKENIZED', 'MINTED', 'ESCROWED'].includes(inv.blockchainStatus);
                        const isReadyToList = isBuyerApproved && isMinted && !isFunded;
                        const isListingThis = listingInvoiceId === (inv.docId || inv.invoiceId || inv.id);

                        const matchedListing = listings.find(l => 
                          (l.invoiceId && (l.invoiceId === inv.invoiceId || l.invoiceId === inv.id || l.invoiceId === inv.docId)) ||
                          (l.docId && (l.docId === inv.docId || l.docId === inv.id || l.docId === inv.invoiceId)) ||
                          (l.id && (l.id === inv.invoiceNumber || l.id === inv.id || l.id === inv.invoiceId))
                        );

                        const bidsList = Array.isArray(inv.bids) && inv.bids.length > 0 ? inv.bids : (matchedListing?.bids || []);
                        const highestBid = inv.highestBid || matchedListing?.highestBid || (bidsList.length > 0 ? Math.max(...bidsList.map(b => b.bid || 0)) : 0);
                        const bidCount = bidsList.length;

                        const statusConfig = isFunded
                          ? { bg: 'bg-emerald-500/10 border border-emerald-500/20', text: 'text-emerald-400', label: 'FUNDED ✓' }
                          : isListed
                          ? { bg: 'bg-primary-500/10 border border-primary-500/20', text: 'text-primary-400', label: 'LIVE AUCTION' }
                          : isVerified
                          ? { bg: 'bg-indigo-500/10 border border-indigo-500/20', text: 'text-indigo-400', label: 'VERIFIED' }
                          : { bg: 'bg-amber-500/10 border border-amber-500/20', text: 'text-amber-400', label: 'PENDING' };

                        return (
                          <div 
                            key={inv.docId || inv.invoiceId || inv.id}
                            className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-5 shadow-sm space-y-4 hover:shadow-md transition"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-xs text-gray-900 dark:text-white">{inv.buyerName || inv.buyer || inv.buyerCompany}</h4>
                                <span className="text-[9px] text-gray-400 block mt-0.5">{inv.invoiceNumber || inv.invoiceId || inv.id}</span>
                              </div>
                              <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusConfig.bg} ${statusConfig.text}`}>
                                {statusConfig.label}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] pt-3 border-t border-gray-50 dark:border-slate-800/80">
                              <div>
                                <span className="text-gray-400 block">Amount</span>
                                <span className="font-bold text-gray-800 dark:text-white">
                                  {typeof inv.invoiceAmount === 'number' ? formatCurrency(inv.invoiceAmount) : inv.amount ? formatCurrency(inv.amount) : '—'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400 block">Verification</span>
                                <span className={`font-bold ${isVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
                                  {inv.verificationStatus || 'PENDING'}
                                </span>
                              </div>
                              
                              {isFunded && (
                                <div className="col-span-2 pt-2 mt-1 border-t border-gray-50 dark:border-slate-800/80">
                                  <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-emerald-400 font-medium tracking-wide uppercase">Settlement Vault</span>
                                      <span className="text-[11px] font-bold text-emerald-300">Escrow Locked & Funded</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                      <span className="text-[9px] text-emerald-400 font-medium tracking-wide uppercase">Disbursed</span>
                                      <span className="text-[11px] font-bold text-emerald-300">
                                        {highestBid > 0 ? formatCurrency(highestBid) : typeof inv.invoiceAmount === 'number' ? formatCurrency(inv.invoiceAmount) : 'Active ✓'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {isListed && !isFunded && (
                                <div className="col-span-2 pt-2 mt-1 border-t border-gray-50 dark:border-slate-800/80">
                                  <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-gray-400 font-medium tracking-wide uppercase">Highest Bid</span>
                                      <span className="text-[11px] font-bold text-primary-500">{highestBid > 0 ? formatCurrency(highestBid) : 'Awaiting Bids'}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                      <span className="text-[9px] text-gray-400 font-medium tracking-wide uppercase">Bids Placed</span>
                                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{bidCount}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 pt-2">
                              {isFunded ? (
                                <button 
                                  onClick={() => navigate(`/app/invoice/${inv.docId || inv.invoiceId || inv.id}`)}
                                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/20"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Funded (View Escrow)
                                </button>
                              ) : isListed ? (
                                <>
                                  <button 
                                    onClick={() => navigate(`/app/invoice/${inv.docId || inv.invoiceId || inv.id}`)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-white text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                                      bidCount > 0 
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20' 
                                        : 'bg-primary-600 hover:bg-primary-700'
                                    }`}
                                  >
                                    {bidCount > 0 ? `⚡ Review & Accept Bids (${bidCount})` : 'Live Auction Vault →'}
                                  </button>
                                  <button 
                                    onClick={() => navigate('/app/marketplace')}
                                    className="py-2 px-3 rounded-lg border border-gray-150 dark:border-slate-800 text-[10px] font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition"
                                  >
                                    Marketplace
                                  </button>
                                </>
                              ) : (
                                <button 
                                  onClick={() => handleListMarketplace(inv)}
                                  disabled={isListingThis || !isReadyToList}
                                  title={!isBuyerApproved ? 'Awaiting Corporate Buyer Approval' : !isMinted ? 'Mint NFT on-chain first (open Details)' : 'List on Marketplace'}
                                  className="flex-1 py-2 px-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[10px] font-bold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                >
                                  {isListingThis ? 'Listing…' : !isBuyerApproved ? '⏳ Awaiting Buyer' : !isMinted ? '🔒 Mint NFT First' : 'List Marketplace'}
                                </button>
                              )}
                              <button 
                                onClick={() => navigate(`/app/invoice/${inv.docId || inv.invoiceId || inv.id}`)}
                                className="py-2 px-3 rounded-lg border border-gray-150 dark:border-slate-800 text-[10px] font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed border-gray-150 dark:border-slate-800 rounded-2xl text-gray-400 text-xs">
                      No invoices uploaded yet.
                    </div>
                  )}
                </div>

                {/* Document Center */}
                <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-slate-800 pb-3">Document Center</h3>
                  
                  {/* Category Chips */}
                  <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-wider">
                    {['Invoices', 'Purchase Orders', 'GST Documents'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedDocCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg border transition ${
                          selectedDocCategory === cat 
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400' 
                            : 'border-gray-150 dark:border-slate-800 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Documents list */}
                  <div className="space-y-2.5">
                    {documents.filter(d => d.category === selectedDocCategory).map((doc) => (
                      <div key={doc.name} className="p-3.5 rounded-xl border border-gray-150 dark:border-slate-800/80 bg-gray-50/30 dark:bg-slate-900/10 flex justify-between items-center gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <FileCode className="h-4.5 w-4.5 text-primary-500" />
                          <div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300 block">{doc.name}</span>
                            <span className="text-[10px] text-gray-400">{doc.size} • {doc.date}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDocumentDelete(doc.name)}
                          className="p-1.5 rounded-lg border border-gray-100 dark:border-slate-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Business Health, AI Recommendations & Payment Calendar */}
              <div className="space-y-8">
                
                {/* Business Health KPIs */}
                <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold border-b border-gray-50 dark:border-slate-800 pb-3">Business Health</h3>
                  <div className="space-y-4 text-xs">
                    {[
                      { label: 'Liquidity Health Score', value: '92/100', color: 'text-success-500 font-bold' },
                      { label: 'Funding Approval Rate', value: '94.2%' },
                      { label: 'Average Settlement Delay', value: '1.2 Days' }
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center">
                        <span className="font-semibold text-gray-400 dark:text-gray-500">{item.label}</span>
                        <span className={item.color || 'text-gray-800 dark:text-white font-semibold'}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Business Assistant Panel */}
                <div className="rounded-2xl border border-primary-100 dark:border-primary-950 bg-gradient-to-b from-primary-50/30 to-white dark:from-primary-950/20 dark:to-dark-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="font-display font-bold text-sm">AI Copilot insights</h3>
                  </div>
                  <div className="space-y-3 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                    <div className="p-3 rounded-xl border border-gray-100/50 dark:border-slate-800/80 bg-white/50 dark:bg-dark-card/50">
                      Your liquidity index is positive. Auto-financing could yield 8.4% interest rates today.
                    </div>
                    <div className="p-3 rounded-xl border border-gray-100/50 dark:border-slate-800/80 bg-white/50 dark:bg-dark-card/50">
                      Upload missing Wipro purchase orders to unlock full A+ credit eligibility.
                    </div>
                  </div>
                </div>

                {/* Payment Calendar Visual */}
                <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold border-b border-gray-50 dark:border-slate-800 pb-3">Upcoming Milestones</h3>
                  <div className="space-y-3.5 text-xs">
                    {[
                      { title: 'Tata Motors Settlement due', date: 'Jul 15', type: 'repayment' },
                      { title: 'Reliance Retail Auction closes', date: 'Jul 18', type: 'funding' }
                    ].map((cal, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 dark:border-slate-800/80 bg-gray-50/50 dark:bg-slate-900/30">
                        <div>
                          <span className="font-semibold block">{cal.title}</span>
                          <span className="text-[10px] text-gray-400">{cal.date}</span>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${cal.type === 'funding' ? 'text-primary-500' : 'text-success-500'}`}>
                          {cal.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}
      </AnimatePresence>

    </ContentContainer>
  );
}
