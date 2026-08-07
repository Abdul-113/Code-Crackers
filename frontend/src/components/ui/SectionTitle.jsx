import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/constants/animations';

export default function SectionTitle({
  eyebrow,
  title,
  titleHighlight,
  subtitle,
  align = 'center',
  className = '',
}) {
  const alignClass = {
    center: 'text-center mx-auto',
    left:   'text-left',
    right:  'text-right ml-auto',
  }[align] || 'text-center mx-auto';

  return (
    <motion.div
      className={`max-w-3xl ${alignClass} ${className}`}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {eyebrow && (
        <motion.div variants={fadeUp} className="mb-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 dark:border-primary-800/50 bg-primary-50 dark:bg-primary-950/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse-slow" />
            {eyebrow}
          </span>
        </motion.div>
      )}

      <motion.h2
        variants={fadeUp}
        className="font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
      >
        {titleHighlight ? (
          <>
            {title}{' '}
            <span className="gradient-text-blue-purple">{titleHighlight}</span>
          </>
        ) : (
          title
        )}
      </motion.h2>

      {subtitle && (
        <motion.p
          variants={fadeUp}
          className="mt-5 text-lg leading-relaxed text-gray-500 dark:text-gray-400 text-balance"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
