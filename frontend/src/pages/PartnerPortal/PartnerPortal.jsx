import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Code, ShieldCheck, Cpu, Database, 
  Terminal, Check, FileText, Send, Server, Play,
  Copy, CheckCircle2, Sparkles, KeyRound, ExternalLink,
  Layers, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PartnerPortal() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: 'TReDS Platform',
    volume: '5,000 - 20,000',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [runningEndpoint, setRunningEndpoint] = useState(null);
  const [liveResponses, setLiveResponses] = useState({});

  // Preset sample testing data
  const samplePresets = [
    {
      label: 'RXIL (TReDS Platform)',
      name: 'Pooja Subramanian',
      email: 'pooja.s@rxil.in',
      company: 'Receivables Exchange of India (RXIL)',
      role: 'TReDS Platform',
      volume: '20,000+',
      notes: 'Need automated AI GST verification and Polygon escrow settlement for our licensed MSME exchange discounting flow.'
    },
    {
      label: 'M1xchange Factor',
      name: 'Aditya Mathur',
      email: 'aditya.m@m1xchange.com',
      company: 'Mynd Solutions / M1xchange',
      role: 'TReDS Platform',
      volume: '5,000 - 20,000',
      notes: 'Evaluating smart contract escrow hooks for instant cross-border supplier payouts.'
    },
    {
      label: 'Bajaj Finserv NBFC',
      name: 'Vikram Mehta',
      email: 'v.mehta@bajajfinserv.in',
      company: 'Bajaj Finance Factor Division',
      role: 'NBFC-Factor',
      volume: '5,000 - 20,000',
      notes: 'Integrating AI duplicate prevention and credit intelligence into our corporate factoring underwriting.'
    }
  ];

  const handleApplyPreset = (preset) => {
    setFormData({
      name: preset.name,
      email: preset.email,
      company: preset.company,
      role: preset.role,
      volume: preset.volume,
      notes: preset.notes
    });
    toast.success(`Loaded "${preset.label}" test sample!`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const mockKey = `sk_sandbox_${formData.role.toLowerCase().replace(/[^a-z]/g, '')}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 8)}`;
      setGeneratedKey(mockKey);
      toast.success('Sandbox API Credentials issued successfully! Test key generated.', { duration: 5000 });
      setSubmitting(false);
    }, 1200);
  };

  const endpoints = [
    {
      id: 'verify',
      method: 'POST',
      path: '/api/v1/verify-invoice',
      title: 'AI Verification & Deduplication API',
      desc: 'Verify invoice data against GSTN, e-Way bills & detects duplicate / inflated entries.',
      sampleRequest: {
        sellerGstin: "27AABCQ9876M1Z4",
        buyerGstin: "29AAACI1681G1Z0",
        invoiceNumber: "INV-2026-QE-901",
        totalAmount: 8850000.00,
        taxAmount: 1350000.00,
        invoiceDate: "2026-08-07"
      },
      sampleResponse: {
        status: "VERIFIED",
        confidence: 99.4,
        gstnStatus: "ACTIVE_MATCHED",
        eWayBillVerified: true,
        fraudRiskScore: 4.2,
        isDuplicate: false,
        digitalSignature: "0x89ab10f...valid"
      }
    },
    {
      id: 'escrow',
      method: 'POST',
      path: '/api/v1/escrow/create',
      title: 'Smart Escrow Vault Deployment API',
      desc: 'Deploy custom smart contract escrow for automated split-settlement on Polygon Amoy.',
      sampleRequest: {
        invoiceHash: "0x7a89bc2134ef9120de653a...",
        sellerWallet: "0x6UEeJqxTxLgN5elR402jFzdTJLE3",
        buyerWallet: "0x8ycpivZQwDOxdkSqfbDpivbqgDz1",
        financedAmount: 8850000.00,
        tenorDays: 45
      },
      sampleResponse: {
        escrowAddress: "0x376FF66a424e8838B52E80552796D5666758aFef",
        network: "Polygon Amoy (ChainID: 80002)",
        contractState: "DEPLOYED_ESCROWED",
        maturityTimestamp: 1788220800,
        txHash: "0x31bf584e20762ce...polygonscan"
      }
    },
    {
      id: 'audit',
      method: 'GET',
      path: '/api/v1/audit-trail/IRN-2026-08-07-901',
      title: 'Cryptographic Audit Trail API',
      desc: 'Retrieve immutable on-chain cryptographic proofs and verification timestamps.',
      sampleRequest: null,
      sampleResponse: {
        irn: "IRN-2026-08-07-901",
        blockchainProof: "0x3b8d4f4e723910abcef1928374...",
        mintTxHash: "0x4b7f8c92a10be69d5830...",
        polygonExplorerUrl: "https://amoy.polygonscan.com/tx/0x4b7f8c92a10be...",
        verifiedAt: "2026-08-07T14:32:40+05:30",
        complianceStandard: "RBI_TREDS_CIRCULAR_2024"
      }
    }
  ];

  const handleTestEndpoint = (ep) => {
    setRunningEndpoint(ep.id);
    setTimeout(() => {
      setLiveResponses(prev => ({
        ...prev,
        [ep.id]: {
          statusCode: 200,
          statusText: 'OK',
          latency: `${Math.floor(Math.random() * 80 + 110)}ms`,
          timestamp: new Date().toLocaleTimeString(),
          data: ep.sampleResponse
        }
      }));
      setRunningEndpoint(null);
      toast.success(`Executed ${ep.path} in 128ms!`);
    }, 1000);
  };

  const tiers = [
    {
      name: 'Starter Pilot',
      price: '₹100',
      period: 'per processed invoice',
      desc: 'Ideal for regional NBFCs starting supply chain operations.',
      features: [
        'AI Fraud Verification API',
        'Polygon Amoy Testnet Sandbox',
        'Standard Email Support',
        'Basic Dashboard Analytics'
      ]
    },
    {
      name: 'Growth Protocol',
      price: '₹75',
      period: 'per invoice + ₹5L/year',
      desc: 'For active TReDS marketplaces wanting tokenized settles.',
      features: [
        'All AI & Verification APIs',
        'Dedicated Polygon Mainnet Escrows',
        'NFT Secondary Market integration',
        '99.9% Uptime SLA & Slack Support'
      ],
      popular: true
    },
    {
      name: 'Enterprise white-label',
      price: 'Custom',
      period: 'tailored setup fee',
      desc: 'Complete white-label solution for commercial banks.',
      features: [
        'Custom Private EVM Chain deployment',
        'On-Premise AI Model Fine-tuning',
        'Custom Escrow Split Rules',
        '24/7 Dedicated Support Engineers'
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#050a1a] text-white overflow-hidden py-16">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 p-64 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 p-64 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        
        {/* Top bar */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <a href="/" className="text-xs font-bold text-gray-400 hover:text-white transition flex items-center gap-1">
            ← Return to Homepage
          </a>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">
            RBI Innovation Sandbox Framework
          </span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-bold text-primary-400 uppercase tracking-widest">
            <Layers className="h-3.5 w-3.5" /> Module 2: Institutional Infrastructure Layer
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight leading-tight">
            Partner API Portal &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-violet-400">
              TReDS B2B SaaS Engine
            </span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Integrate our AI-driven invoice deduplication, automated smart contract escrow, and cryptographic blockchain audit trail directly into your licensed TReDS marketplace, NBFC-factor, or commercial bank portal.
          </p>
        </div>

        {/* Quick Testing Presets Bar */}
        <div className="bg-[#0c1524]/90 border border-primary-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Test Sample Presets:</span>
              <span className="text-[11px] text-gray-400">Click to auto-fill institutional test scenarios</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-primary-500/20 border border-white/10 hover:border-primary-500/40 text-[11px] font-bold text-gray-200 hover:text-white transition flex items-center gap-1.5"
                >
                  <span>⚡</span> {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid: Sandbox API Playground & Request Form */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive API Sandbox Tester */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary-400" />
                Live Developer Sandbox Playground
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Sandbox Online (80002)
              </span>
            </div>

            {endpoints.map((ep) => {
              const isRunning = runningEndpoint === ep.id;
              const liveRes = liveResponses[ep.id];

              return (
                <div key={ep.id} className="p-5 rounded-2xl border border-white/10 bg-[#0c1524]/70 backdrop-blur-md space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-bold text-gray-200">{ep.path}</span>
                    </div>

                    <button
                      onClick={() => handleTestEndpoint(ep)}
                      disabled={isRunning}
                      className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-[11px] font-bold transition flex items-center gap-1.5 shadow-md shadow-primary-500/20 disabled:opacity-50"
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 fill-current" />
                          <span>Run in Sandbox</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-200">{ep.title}</h4>
                    <p className="text-[11px] text-gray-400 leading-normal mt-0.5">{ep.desc}</p>
                  </div>

                  {/* Response display */}
                  <div className="bg-black/50 rounded-xl p-3.5 border border-white/5 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span>{liveRes ? `HTTP ${liveRes.statusCode} ${liveRes.statusText}` : 'SAMPLE RESPONSE'}</span>
                      {liveRes && (
                        <span className="text-emerald-400 font-bold">Latency: {liveRes.latency}</span>
                      )}
                    </div>
                    <pre className="font-mono text-[10.5px] text-emerald-300 overflow-x-auto max-h-40 p-1">
                      {JSON.stringify(liveRes ? liveRes.data : ep.sampleResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sandbox Credential Onboarding */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#0c1524]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Server className="h-5 w-5 text-indigo-400" />
                  Request Sandbox API Credentials
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  TReDS platforms and RBI-licensed NBFC-factors can request a sandbox client ID to test integrations on the Polygon Amoy network.
                </p>
              </div>

              {generatedKey && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <KeyRound className="h-4 w-4 text-emerald-400" />
                      Active Sandbox API Key Issued:
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedKey);
                        toast.success('Copied API Key to clipboard!');
                      }}
                      className="text-[10px] font-bold text-emerald-400 hover:text-white bg-emerald-500/20 px-2.5 py-1 rounded transition flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-200 bg-black/40 p-2.5 rounded-lg border border-emerald-500/20 break-all">
                    {generatedKey}
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Use header <code className="text-emerald-300 font-mono">X-Partner-API-Key: {generatedKey.slice(0, 16)}...</code> in your cURL or Python SDK requests.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Pooja Subramanian"
                      className="w-full bg-[#050a1a] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Business Email</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="pooja@rxil.in"
                      className="w-full bg-[#050a1a] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Company / Entity Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="e.g. Receivables Exchange of India Ltd (RXIL)"
                    className="w-full bg-[#050a1a] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Entity Type</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-[#050a1a] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option>TReDS Platform</option>
                      <option>NBFC-Factor</option>
                      <option>Commercial Bank</option>
                      <option>Supply Chain Provider</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Est. Monthly Volume</label>
                    <select 
                      value={formData.volume}
                      onChange={(e) => setFormData({...formData, volume: e.target.value})}
                      className="w-full bg-[#050a1a] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option>&lt; 1,000</option>
                      <option>1,000 - 5,000</option>
                      <option>5,000 - 20,000</option>
                      <option>20,000+</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Integration Scope / Use Case</label>
                  <textarea 
                    rows="3" 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Describe your platform requirements..."
                    className="w-full bg-[#050a1a] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Generating Sandbox Key...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Generate Sandbox API Credentials</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Pricing Tiers Section */}
        <div className="space-y-10 pt-8 border-t border-white/5">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">SaaS License &amp; API Pricing</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Transparent, volume-based pricing structures tailored for licensed factors and financial enterprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, idx) => (
              <div 
                key={idx}
                className={`rounded-3xl border p-6 flex flex-col justify-between shadow-lg relative backdrop-blur-sm ${
                  tier.popular 
                    ? 'border-primary-500 bg-[#0c1524] scale-[1.03]' 
                    : 'border-white/5 bg-[#0c1524]/60'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-500 text-white font-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow">
                    Most Popular
                  </span>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">{tier.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-snug">{tier.desc}</p>
                  </div>

                  <div className="py-2">
                    <span className="text-3xl font-black text-white">{tier.price}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{tier.period}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-gray-300 pt-4 border-t border-white/5">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex gap-2 items-center">
                        <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      document.querySelector('input')?.focus();
                      toast.success(`Selected ${tier.name}. Fill the form above to proceed!`);
                    }}
                    className={`w-full block text-center py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      tier.popular 
                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20' 
                        : 'border border-white/10 hover:bg-white/5 text-gray-200'
                    }`}
                  >
                    Select Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
