import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, TrendingUp, Shield, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import { fadeUp, fadeLeft, fadeRight, staggerContainer, floatAnimation } from '@/constants/animations';

// Inline SVG illustration — original fintech design
function HeroIllustration() {
  return (
    <div className="relative w-full max-w-[560px] aspect-square mx-auto">
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/10 to-secondary-600/10 blur-3xl" />

      {/* Main center card — Invoice */}
      <motion.div
        animate={floatAnimation}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
      >
        <div className="w-48 sm:w-56 rounded-2xl border border-white/20 dark:border-white/10 bg-white dark:bg-dark-card shadow-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Invoice</span>
            <span className="rounded-full bg-success-500/15 px-2 py-0.5 text-[10px] font-semibold text-success-500">Verified ✓</span>
          </div>
          <div className="mb-2 font-display text-xl font-bold text-gray-900 dark:text-white">₹18,50,000</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">INV-2024-00847</div>
          <div className="space-y-1.5">
            {[['From', 'TextilePro Pvt. Ltd.'], ['To', 'Reliance Retail'], ['Due', '90 days']].map(([k, v]) => (
              <div key={k} className="flex justify-between text-[11px]">
                <span className="text-gray-400">{k}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 h-1.5 rounded-full bg-gray-100 dark:bg-dark-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
              initial={{ width: '0%' }}
              animate={{ width: '72%' }}
              transition={{ duration: 2, delay: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-1 text-right text-[10px] text-gray-400">AI Grade: <span className="text-success-500 font-bold">A+</span></div>
        </div>
      </motion.div>

      {/* Top-left — MSME node */}
      <motion.div
        animate={{ y: [0, -12, 0], transition: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } }}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10"
      >
        <div className="rounded-xl border border-white/20 dark:border-white/10 bg-white dark:bg-dark-card shadow-card dark:shadow-card-dark p-3 flex items-center gap-2.5 backdrop-blur-sm">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-800 dark:text-white">MSME</div>
            <div className="text-[10px] text-gray-400">Needs Capital</div>
          </div>
        </div>
      </motion.div>

      {/* Top-right — AI Analysis */}
      <motion.div
        animate={{ y: [0, -10, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 } }}
        className="absolute top-6 right-2 sm:top-12 sm:right-4 z-10"
      >
        <div className="rounded-xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-violet-600/90 to-purple-700/90 shadow-glow-purple p-3 flex items-center gap-2 backdrop-blur-sm">
          <Zap className="h-4 w-4 text-white flex-shrink-0" />
          <div>
            <div className="text-[11px] font-bold text-white">AI Analysis</div>
            <div className="text-[10px] text-purple-200">Risk: A+ Grade</div>
          </div>
        </div>
      </motion.div>

      {/* Right — Investor */}
      <motion.div
        animate={{ y: [0, -14, 0], transition: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.3 } }}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
      >
        <div className="rounded-xl border border-white/20 dark:border-white/10 bg-white dark:bg-dark-card shadow-card dark:shadow-card-dark p-3 flex items-center gap-2.5 backdrop-blur-sm">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-800 dark:text-white">Investor</div>
            <div className="text-[10px] text-gray-400">Bids ₹17L @ 8%</div>
          </div>
        </div>
      </motion.div>

      {/* Bottom-left — Blockchain */}
      <motion.div
        animate={{ y: [0, -8, 0], transition: { duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 } }}
        className="absolute bottom-6 left-0 sm:bottom-12 z-10"
      >
        <div className="rounded-xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-primary-600/90 to-primary-700/90 shadow-glow-blue p-3 flex items-center gap-2 backdrop-blur-sm">
          <Shield className="h-4 w-4 text-white flex-shrink-0" />
          <div>
            <div className="text-[11px] font-bold text-white">Blockchain</div>
            <div className="text-[10px] text-blue-200">NFT Minted ✓</div>
          </div>
        </div>
      </motion.div>

      {/* Bottom-right — Cash released */}
      <motion.div
        animate={{ y: [0, -11, 0], transition: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 } }}
        className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-10"
      >
        <div className="rounded-xl border border-success-500/30 bg-success-500/10 dark:bg-success-500/15 shadow-sm p-3 backdrop-blur-sm">
          <div className="text-[10px] font-semibold text-success-600 dark:text-success-400 uppercase tracking-wide">Cash Released</div>
          <div className="text-base font-bold text-gray-900 dark:text-white">₹17,50,000</div>
          <div className="text-[10px] text-gray-400">in 48 hours</div>
        </div>
      </motion.div>

      {/* Connecting lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full z-0 opacity-20 dark:opacity-15" viewBox="0 0 560 560" fill="none">
        <line x1="280" y1="280" x2="100" y2="100" stroke="url(#grad1)" strokeWidth="1.5" strokeDasharray="6 4" />
        <line x1="280" y1="280" x2="460" y2="150" stroke="url(#grad1)" strokeWidth="1.5" strokeDasharray="6 4" />
        <line x1="280" y1="280" x2="500" y2="280" stroke="url(#grad2)" strokeWidth="1.5" strokeDasharray="6 4" />
        <line x1="280" y1="280" x2="80"  y2="380" stroke="url(#grad1)" strokeWidth="1.5" strokeDasharray="6 4" />
        <line x1="280" y1="280" x2="450" y2="430" stroke="url(#grad2)" strokeWidth="1.5" strokeDasharray="6 4" />
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#2563eb" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Tiny floating particles */}
      {[
        { top: '20%', left: '20%', size: 3, delay: 0 },
        { top: '70%', left: '75%', size: 4, delay: 1 },
        { top: '40%', left: '85%', size: 2, delay: 0.5 },
        { top: '80%', left: '30%', size: 3, delay: 1.5 },
        { top: '15%', left: '55%', size: 2, delay: 2 },
      ].map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary-400 dark:bg-primary-500"
          style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
          animate={{ y: [-6, 6, -6], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
    </div>
  );
}

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-transparent"
    >
      {/* Subtle grid texture */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 dark:opacity-10 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 dark:border-primary-800/50 bg-primary-50 dark:bg-primary-950/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                </span>
                AI × Blockchain × DeFi
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl xl:text-7xl leading-[1.05]"
            >
              Unlock{' '}
              <span className="relative">
                <span className="gradient-text-blue-purple">Working Capital</span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
              <br />
              in Days, Not Months.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg"
            >
              Invoice2Credit AI helps MSMEs convert verified invoices into instant working capital using{' '}
              <span className="text-gray-700 dark:text-gray-200 font-medium">Artificial Intelligence</span>,{' '}
              <span className="text-gray-700 dark:text-gray-200 font-medium">Blockchain</span>, and{' '}
              <span className="text-gray-700 dark:text-gray-200 font-medium">Smart Contracts</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
              <Button href="/login" size="lg" icon={ArrowRight} className="shadow-glow-blue">
                Get Started Free
              </Button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950">
                  <Play className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400 ml-0.5" />
                </div>
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeUp} className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2">
                {['bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-rose-500'].map((c, i) => (
                  <div
                    key={i}
                    className={`h-8 w-8 rounded-full ${c} border-2 border-white dark:border-dark-bg flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {['M', 'I', 'B', 'A'][i]}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">1,200+</span> MSMEs, Investors & Buyers
              </div>
            </motion.div>
          </motion.div>

          {/* Right — illustration */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate="visible"
            className="hidden lg:block"
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-dark-bg to-transparent pointer-events-none" />
    </section>
  );
}
