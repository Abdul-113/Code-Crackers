import React from 'react';
import { motion } from 'framer-motion';
import { FEATURES } from '@/constants/landingData';
import SectionTitle from '@/components/ui/SectionTitle';
import { fadeUp, staggerContainer } from '@/constants/animations';

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="group relative rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-7 shadow-card dark:shadow-card-dark overflow-hidden cursor-default transition-shadow duration-300 hover:shadow-xl dark:hover:shadow-dark-card/60"
    >
      {/* Hover glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />

      {/* Tag */}
      <div className="mb-5 flex items-center justify-between">
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="rounded-full border border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {feature.tag}
        </span>
      </div>

      <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-2.5 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {feature.description}
      </p>

      {/* Bottom gradient line on hover */}
      <motion.div
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient}`}
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
        style={{ transformOrigin: 'left' }}
      />
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="section-padding bg-white/60 dark:bg-transparent">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Why Choose Us"
          title="Why We Are"
          titleHighlight="Different"
          subtitle="Built from the ground up with AI and blockchain at the core — not as an afterthought. Every feature is designed to eliminate friction from invoice financing."
        />

        <motion.div
          className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
