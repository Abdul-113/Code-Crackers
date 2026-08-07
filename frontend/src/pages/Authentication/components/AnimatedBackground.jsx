import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, UploadCloud, Brain, ShieldCheck, 
  Hexagon, Landmark, Key, Banknote, HelpCircle, 
  Cpu, Activity
} from 'lucide-react';

const PIPELINE_STAGES = [
  { label: 'MSME Partner',     icon: Building2,    desc: 'Business profile active' },
  { label: 'Invoice Upload',   icon: UploadCloud,  desc: 'INV-2026 extracted' },
  { label: 'AI Risk Audit',    icon: Brain,        desc: 'Risk analytics grade assigned' },
  { label: 'GST Verification', icon: ShieldCheck,  desc: 'Invoice matched & verified' },
  { label: 'NFT Tokenization', icon: Hexagon,      desc: 'Tokenized as ERC-721' },
  { label: 'DeFi Marketplace', icon: Landmark,     desc: 'Auction bidding active' },
  { label: 'Escrow Lock',      icon: Key,          desc: 'Smart contract initialized' },
  { label: 'Cash Released',    icon: Banknote,     desc: 'Capital disbursed in 24h' }
];

const METRIC_CARDS = [
  { title: 'AI Confidence', value: '99.4%', color: 'text-violet-500 border-violet-500/25', icon: Cpu, x: '5%', y: '22%' },
  { title: 'AI Risk Grade', value: 'A+ Rated', color: 'text-success-500 border-success-500/25', icon: Brain, x: '60%', y: '15%' },
  { title: 'GST Match', value: 'Verified ✓', color: 'text-primary-500 border-primary-500/25', icon: ShieldCheck, x: '8%', y: '68%' },
  { title: 'Escrow Lock', value: 'Active Lock', color: 'text-amber-500 border-amber-500/25', icon: Key, x: '62%', y: '78%' },
  { title: 'Polygon Network', value: 'Connected', color: 'text-purple-500 border-purple-500/25', icon: Hexagon, x: '55%', y: '42%' },
  { title: 'Payout Disbursed', value: '₹24,80,000', color: 'text-emerald-500 border-emerald-500/25', icon: Banknote, x: '4%', y: '45%' }
];

export default function AnimatedBackground() {
  const [activeStage, setActiveStage] = useState(0);
  const [isDark, setIsDark] = useState(false);

  // Monitor document theme class Changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDark(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  // Cycle through the pipeline stages for demo simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % PIPELINE_STAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const currentStageInfo = PIPELINE_STAGES[activeStage];
  const StageIcon = currentStageInfo.icon;

  return (
    <div className={`relative h-full w-full overflow-hidden flex flex-col justify-between p-10 transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white' 
        : 'bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-white text-gray-800'
    }`}>
      
      {/* Dynamic Animated Mesh Grid */}
      <div className={`absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none ${
        isDark ? 'mix-blend-overlay' : 'mix-blend-multiply'
      }`} />

      {/* Floating Ambient Mesh Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 0.9, 1],
          x: [0, 40, -30, 0],
          y: [0, -50, 40, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -top-20 -left-20 h-96 w-96 rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-primary-500/10' : 'bg-primary-300/20'
        }`}
      />
      <motion.div
        animate={{
          scale: [1, 0.9, 1.1, 1],
          x: [0, -50, 40, 0],
          y: [0, 40, -50, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -bottom-20 -right-20 h-96 w-96 rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-purple-500/10' : 'bg-purple-300/15'
        }`}
      />

      {/* Branded Header */}
      <div className="relative z-10 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 shadow-md">
            <Hexagon className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-display text-base font-extrabold tracking-tight">
            Invoice<span className="text-primary-600 dark:text-primary-400">2Credit</span> AI
          </span>
        </a>
      </div>

      {/* Interactive Core Illustration Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-6">
        
        {/* Floating Glass Metric Cards */}
        {METRIC_CARDS.map((card, idx) => {
          const CardIcon = card.icon;
          return (
            <motion.div
              key={card.title}
              style={{ top: card.y, left: card.x }}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4 + idx,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: idx * 0.4
              }}
              className={`absolute hidden md:flex items-center gap-2.5 rounded-xl border p-3 shadow-md backdrop-blur-md transition-all ${
                isDark 
                  ? 'bg-slate-900/60 border-slate-800' 
                  : 'bg-white/70 border-gray-150 shadow-gray-200/50'
              }`}
            >
              <div className={`h-7 w-7 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center ${card.color}`}>
                <CardIcon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{card.title}</div>
                <div className="text-xs font-bold">{card.value}</div>
              </div>
            </motion.div>
          );
        })}

        {/* Center Lifecycle Animation Loop */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          
          {/* Circular Orbit/Ring */}
          <div className={`absolute inset-4 rounded-full border border-dashed transition-colors duration-500 ${
            isDark ? 'border-indigo-500/20' : 'border-indigo-200'
          }`} />

          {/* Core Interactive Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage}
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`relative z-20 w-64 rounded-2xl border p-6 shadow-2xl backdrop-blur-md text-center transition-all ${
                isDark 
                  ? 'bg-slate-900/80 border-slate-800 shadow-indigo-950/20' 
                  : 'bg-white/90 border-gray-200 shadow-gray-200/60'
              }`}
            >
              <div className={`mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg text-white mb-4`}>
                <StageIcon className="h-6 w-6" />
              </div>

              <div className="text-[10px] font-bold text-primary-500 dark:text-primary-400 uppercase tracking-widest mb-1.5">
                STAGE 0{activeStage + 1}
              </div>

              <h4 className="font-display font-bold text-base mb-1">
                {currentStageInfo.label}
              </h4>

              <p className="text-xs text-gray-400 dark:text-gray-500 px-2 leading-relaxed">
                {currentStageInfo.desc}
              </p>

              {/* Progress Indicator */}
              <div className="mt-5 flex justify-center gap-1">
                {PIPELINE_STAGES.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeStage ? 'w-5 bg-primary-500' : 'w-1.5 bg-gray-200 dark:bg-slate-800'
                    }`} 
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

        </div>

      </div>

      {/* Info Footnote Footer */}
      <div className="relative z-10 flex justify-between items-center text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">
        <span>AI-Powered risk analysis</span>
        <span>Polygon amoy testnet</span>
      </div>

    </div>
  );
}
