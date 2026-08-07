import React from 'react';
import { motion } from 'framer-motion';
import { SOLUTION_STEPS } from '@/constants/landingData';
import SectionTitle from '@/components/ui/SectionTitle';
import { fadeUp, staggerContainer } from '@/constants/animations';

function StepCard({ step, index, total }) {
  const Icon = step.icon;
  const isLast = index === total - 1;

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="relative flex flex-col items-center text-center group"
    >
      {/* Connector line (desktop) */}
      {!isLast && (
        <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] right-[calc(-50%+32px)] h-px">
          <motion.div
            className="h-full bg-gradient-to-r from-gray-300 dark:from-dark-muted to-transparent"
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
          />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 border-t-4 border-r-0 border-b-4 border-l-4 border-transparent border-l-gray-300 dark:border-l-dark-muted" />
        </div>
      )}

      {/* Step number badge */}
      <div className="relative mb-4">
        <motion.div
          className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
          whileHover={{ rotate: 5 }}
        >
          <Icon className="h-7 w-7 text-white" />
        </motion.div>
        <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-[10px] font-bold text-gray-500 dark:text-gray-400 shadow-sm">
          {step.number}
        </div>
      </div>

      <h3 className="font-display text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {step.title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 max-w-[160px]">
        {step.description}
      </p>
    </motion.div>
  );
}

export default function SolutionSection() {
  return (
    <section id="solution" className="section-padding bg-gray-50/40 dark:bg-transparent">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="How It Works"
          title="How Invoice2Credit AI"
          titleHighlight="Works"
          subtitle="Six seamless steps from invoice upload to working capital — powered by AI and secured by blockchain, all in under 72 hours."
        />

        <motion.div
          className="mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-12 gap-x-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {SOLUTION_STEPS.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              index={i}
              total={SOLUTION_STEPS.length}
            />
          ))}
        </motion.div>

        {/* Bottom highlight */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-20 rounded-2xl border border-primary-100 dark:border-primary-900/30 bg-gradient-to-br from-primary-50 to-secondary-50/50 dark:from-primary-950/30 dark:to-secondary-950/20 p-8 text-center"
        >
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            From invoice upload to liquidity in{' '}
            <span className="gradient-text-blue-purple">under 72 hours</span>.
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Compare that to 90–120 days with traditional financing.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
