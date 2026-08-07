import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code, ShieldCheck, Cpu, Database, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fadeUp, staggerContainer } from '@/constants/animations';

export default function B2BSaaSSection() {
  const navigate = useNavigate();

  const apis = [
    {
      title: 'AI Verification API',
      desc: 'Checks GSTIN validity, cross-references with e-waybills, and detects duplicates or inflated values in under 2 seconds.',
      icon: Cpu,
    },
    {
      title: 'Blockchain Audit Trail',
      desc: 'Immutable cryptographic proof of invoice authenticity and history, ready for regulatory reporting.',
      icon: Database,
    },
    {
      title: 'Smart Escrow API',
      desc: 'Automates split-payment settlements on maturity directly to investors, suppliers, and platform fees via code.',
      icon: ShieldCheck,
    }
  ];

  return (
    <section id="b2b-saas" className="relative py-24 bg-gradient-to-b from-[#050a1a] to-[#0a1128] overflow-hidden text-white border-y border-white/5">
      {/* Dynamic background element */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[350px] w-[600px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Copy */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-bold text-primary-400 uppercase tracking-widest">
              Mode 2: Technology Infrastructure
            </span>
            
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight leading-tight">
              We are the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Stripe</span> of Invoice Financing
            </h2>
            
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Don't build supply chain finance technology from scratch. License our AI compliance engine, smart contract payments, and blockchain audit trails directly into your TReDS platform, bank, or NBFC portal.
            </p>

            <div className="space-y-4 pt-4">
              {apis.map((api, idx) => {
                const Icon = api.icon;
                return (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
                    <div className="h-10 w-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 flex-shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-100">{api.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{api.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6">
              <button
                onClick={() => navigate('/partner')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02]"
              >
                <span>Explore Partner API Portal</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Code/API Preview Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-white/10 bg-[#0c1524]/90 shadow-2xl p-6 relative overflow-hidden backdrop-blur-md">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500/70" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <span className="h-3 w-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                  <Code className="h-3.5 w-3.5" /> API Response — 200 OK
                </div>
              </div>

              {/* Code text */}
              <pre className="text-[11px] sm:text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed py-2">
{`{
  "invoiceId": "INV-2026-8847",
  "verification": {
    "gstStatus": "VERIFIED",
    "gstMatch": true,
    "deduplicationCheck": "PASSED",
    "complianceScore": 99.4
  },
  "blockchain": {
    "tokenized": true,
    "tokenId": 8847,
    "hash": "0x3b8d4f4e723910c279c72c84...",
    "escrowAddress": "0x4b7f8c92a10be69d5830..."
  },
  "financing": {
    "advanceEligible": true,
    "maxAdvanceLimit": 950000.00,
    "yieldAPY": 8.5
  }
}`}
              </pre>

              {/* Overlaid stats */}
              <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-semibold tracking-wider uppercase">SaaS License Tier</span>
                  <span className="text-sm font-extrabold text-primary-400 block mt-1">White-Label API</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-semibold tracking-wider uppercase">Compliance Grade</span>
                  <span className="text-sm font-extrabold text-emerald-400 block mt-1">AAA Secured</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
