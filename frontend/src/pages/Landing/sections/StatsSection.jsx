import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { STATS } from '@/constants/landingData';
import { fadeUp, staggerContainer } from '@/constants/animations';

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);

  return count;
}

function StatCard({ stat, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const count = useCountUp(stat.value, 2200, visible);

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      custom={index}
      className="flex flex-col items-center p-8 rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card hover:border-primary-200 dark:hover:border-primary-800/50 transition-all duration-300 group"
    >
      <div className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight">
        <span className="gradient-text">
          {stat.prefix}{count}{stat.suffix}
        </span>
      </div>
      <div className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 text-center">{stat.label}</div>
      <motion.div
        className="mt-3 h-0.5 w-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:w-12 transition-all duration-500"
      />
    </motion.div>
  );
}

export default function StatsSection() {
  return (
    <section id="stats" className="py-20 bg-white/60 dark:bg-transparent border-y border-gray-100/40 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
