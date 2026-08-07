import React from 'react';
import { motion } from 'framer-motion';
import { PROBLEMS } from '@/constants/landingData';
import SectionTitle from '@/components/ui/SectionTitle';
import { fadeUp, fadeLeft, fadeRight, staggerContainer } from '@/constants/animations';

function ProblemCard({ problem, index }) {
  const Icon = problem.icon;
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`rounded-2xl border p-7 transition-all duration-300 cursor-default ${problem.bg} ${problem.border}`}
    >
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-dark-card shadow-sm mb-5`}>
        <Icon className={`h-6 w-6 ${problem.color}`} />
      </div>
      <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-2">{problem.title}</h3>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{problem.description}</p>
    </motion.div>
  );
}

export default function ProblemSection() {
  return (
    <section id="problem" className="section-padding bg-white/70 dark:bg-transparent">
      <div className="mx-auto max-w-7xl">

        <SectionTitle
          eyebrow="The Problem"
          title="The MSME Cash Flow"
          titleHighlight="Problem"
          subtitle="63 million MSMEs in India generate ₹50 trillion in annual revenue — yet most struggle to survive payment delays that can stretch to 120 days."
        />

        {/* Visual timeline */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-16 grid lg:grid-cols-3 gap-6 items-center"
        >
          {/* MSME */}
          <motion.div variants={fadeLeft} className="rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/20 p-6 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-glow-blue">
              <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
                <rect x="8" y="20" width="24" height="16" rx="2" fill="white" fillOpacity="0.9"/>
                <rect x="14" y="14" width="12" height="8" rx="1" fill="white" fillOpacity="0.6"/>
                <circle cx="20" cy="8" r="4" fill="white" fillOpacity="0.8"/>
                <rect x="10" y="24" width="5" height="8" rx="1" fill="#2563eb"/>
                <rect x="25" y="24" width="5" height="8" rx="1" fill="#2563eb"/>
              </svg>
            </div>
            <div className="font-display text-lg font-bold text-gray-900 dark:text-white">MSME Owner</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">Delivers goods &amp; issues invoice</div>
          </motion.div>

          {/* Arrow + Calendar */}
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 w-full lg:flex-col">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-300 dark:via-red-700 to-transparent lg:h-px lg:w-full" />
              <div className="rounded-2xl border-2 border-red-200 dark:border-red-800/50 bg-white dark:bg-dark-card shadow-lg p-6 w-36 text-center flex-shrink-0">
                <div className="text-4xl font-display font-extrabold text-red-500">90</div>
                <div className="text-xs font-semibold text-red-400 uppercase tracking-wide">–120 Days</div>
                <div className="mt-1 text-[10px] text-gray-400">Payment Delay</div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-300 dark:via-red-700 to-transparent lg:h-px lg:w-full" />
            </div>
            <div className="text-xs text-center text-gray-400 dark:text-gray-500 italic">Waiting. Struggling. Unable to grow.</div>
          </motion.div>

          {/* Large Company */}
          <motion.div variants={fadeRight} className="rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card/50 p-6 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-card-dark">
              <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
                <rect x="4" y="12" width="32" height="24" rx="3" fill="white" fillOpacity="0.8"/>
                <rect x="4" y="4"  width="32" height="12" rx="3" fill="white" fillOpacity="0.5"/>
                <rect x="10" y="20" width="6" height="8" rx="1" fill="#6b7280"/>
                <rect x="22" y="20" width="6" height="8" rx="1" fill="#6b7280"/>
              </svg>
            </div>
            <div className="font-display text-lg font-bold text-gray-900 dark:text-white">Large Enterprise</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">Holds payment for 90–120 days</div>
          </motion.div>
        </motion.div>

        {/* Problem cards */}
        <motion.div
          className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {PROBLEMS.map((p, i) => (
            <ProblemCard key={p.title} problem={p} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
