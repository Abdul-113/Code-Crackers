import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/constants/animations';

export default function CTASection() {
  return (
    <section id="cta" className="section-padding relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700" />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary-400/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Get Early Access
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-tight text-balance"
          >
            Ready to Transform
            <br />
            Invoice Financing?
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-lg text-white/70 max-w-xl text-balance"
          >
            Join MSMEs, Investors, and Buyers already using Invoice2Credit AI to unlock instant, transparent, blockchain-backed invoice financing.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/login"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary-700 shadow-xl hover:shadow-2xl transition-all duration-200"
            >
              Launch Demo
              <ArrowRight className="h-5 w-5" />
            </motion.a>
            <motion.a
              href="#solution"
              onClick={(e) => { e.preventDefault(); document.querySelector('#solution')?.scrollIntoView({ behavior: 'smooth' }); }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-bold text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
            >
              Explore Platform
            </motion.a>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={fadeUp} className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/60">
            {['No credit card required', 'Instant setup', 'Polygon-secured'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                {item}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
