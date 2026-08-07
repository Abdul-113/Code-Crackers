import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Code, ShieldCheck, Cpu, Database, 
  Terminal, Check, FileText, Send, Server, Play 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fadeUp, staggerContainer } from '@/constants/animations';

export default function PartnerPortal() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: 'TReDS Platform',
    volume: '1000 - 5000',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Partnership request submitted successfully! Our integration team will contact you.', { duration: 5000 });
      setFormData({
        name: '',
        email: '',
        company: '',
        role: 'TReDS Platform',
        volume: '1000 - 5000',
        notes: ''
      });
      setSubmitting(false);
    }, 1500);
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/verify-invoice',
      desc: 'Verify invoice data against GSTN & duplicates using AI OCR.',
      res: `{ "status": "VERIFIED", "confidence": 99.4 }`
    },
    {
      method: 'POST',
      path: '/api/v1/escrow/create',
      desc: 'Deploy custom smart contract escrow for automated split-settlement.',
      res: `{ "escrowAddress": "0x4b7f8c92a10be69d5830...", "state": "OPEN" }`
    },
    {
      method: 'GET',
      path: '/api/v1/audit-trail/{irn}',
      desc: 'Retrieve cryptographic verification logs of invoice tokenization.',
      res: `{ "hash": "0x3b8d4f4e723...", "verifiedAt": "2026-08-07T13:00Z" }`
    }
  ];

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

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 space-y-20">
        
        {/* Back Link */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <a href="/" className="text-xs font-bold text-gray-400 hover:text-white transition flex items-center gap-1">
            ← Return to Homepage
          </a>
          {/* RBI Regulatory Sandbox Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">
            RBI Innovation Sandbox Framework
          </span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight leading-tight">
            Partner API Portal &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-violet-400">
              Supply Chain Finance Infrastructure
            </span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Integrate our AI-driven invoice deduplication, automated smart contract escrow, and cryptographic blockchain audit trail directly into your licensed financial application.
          </p>
        </div>

        {/* API Sandbox Section */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Endpoints List */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Terminal className="h-5 w-5 text-primary-400" />
              Developer API Documentation
            </h3>
            {endpoints.map((ep, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-[#0c1524]/60 backdrop-blur-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-gray-200">{ep.path}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-normal">{ep.desc}</p>
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <span className="text-[9px] text-gray-500 font-mono block mb-1">RESPONSE</span>
                  <pre className="font-mono text-[10px] text-gray-300 overflow-x-auto truncate">{ep.res}</pre>
                </div>
              </div>
            ))}
          </div>

          {/* Partner Registration Form */}
          <div className="lg:col-span-6 bg-[#0c1524]/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Server className="h-5 w-5 text-indigo-400" />
              Request Sandbox API Credentials
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              TReDS platforms and RBI-licensed NBFC-factors can request a sandbox client ID to test integrations on the Polygon Amoy network.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Kunal Sharma"
                    className="w-full bg-[#050a1a] border border-white/5 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Business Email</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="kunal@fintech.in"
                    className="w-full bg-[#050a1a] border border-white/5 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" 
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
                  placeholder="e.g. Apex Factors Ltd"
                  className="w-full bg-[#050a1a] border border-white/5 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" 
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Entity Type</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-[#050a1a] border border-white/5 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option>TReDS Platform</option>
                    <option>NBFC-Factor</option>
                    <option>Commercial Bank</option>
                    <option>Supply Chain Provider</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Est. Monthly Volume (Invoices)</label>
                  <select 
                    value={formData.volume}
                    onChange={(e) => setFormData({...formData, volume: e.target.value})}
                    className="w-full bg-[#050a1a] border border-white/5 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option>&lt; 1,000</option>
                    <option>1,000 - 5,000</option>
                    <option>5,000 - 20,000</option>
                    <option>20,000+</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Integration Notes (Optional)</label>
                <textarea 
                  rows="3" 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Describe your use case..."
                  className="w-full bg-[#050a1a] border border-white/5 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" 
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting...' : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Sandbox Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Pricing Tiers Section */}
        <div className="space-y-10">
          <div className="text-center space-y-4 max-w-xl mx-auto">
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
                  <a
                    href="#sandbox"
                    onClick={() => {
                      document.querySelector('input')?.focus();
                      toast('Fill the credentials request form to start.');
                    }}
                    className={`block text-center py-2.5 rounded-xl font-bold text-xs transition ${
                      tier.popular 
                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20' 
                        : 'border border-white/10 hover:bg-white/5 text-gray-200'
                    }`}
                  >
                    Select Plan
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
