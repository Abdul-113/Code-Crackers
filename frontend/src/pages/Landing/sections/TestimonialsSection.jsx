import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { TESTIMONIALS } from '@/constants/landingData';
import SectionTitle from '@/components/ui/SectionTitle';
import { fadeUp, staggerContainer } from '@/constants/animations';

function AvatarIllustration({ initials, gradient }) {
  return (
    <div className={`h-14 w-14 flex-shrink-0 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
      <span className="text-xl font-extrabold text-white tracking-tight">{initials}</span>
    </div>
  );
}

function TestimonialCard({ t, index }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      className="group flex flex-col rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-7 shadow-card dark:shadow-card-dark relative overflow-hidden"
    >
      {/* Subtle top gradient */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${t.gradient}`} />

      {/* Stars */}
      <div className="flex gap-1 mb-5">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300 mb-6">
        &ldquo;{t.quote}&rdquo;
      </blockquote>

      {/* Person */}
      <div className="flex items-center gap-3">
        <AvatarIllustration initials={t.initials} gradient={t.gradient} />
        <div>
          <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">{t.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="section-padding bg-white/50 dark:bg-transparent">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="User Stories"
          title="Trusted by MSMEs &"
          titleHighlight="Investors"
          subtitle="Hear from the stakeholders who are already transforming how they handle invoice financing."
        />

        <motion.div
          className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
