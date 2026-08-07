import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEMO_STEPS } from '@/constants/landingData';
import SectionTitle from '@/components/ui/SectionTitle';
import { fadeUp } from '@/constants/animations';
import { CheckCircle } from 'lucide-react';

export default function DemoWorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [playing,    setPlaying]    = useState(false);
  const intervalRef = useRef(null);

  const startPlayback = () => {
    setActiveStep(0);
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= DEMO_STEPS.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  const step = DEMO_STEPS[activeStep];
  const Icon = step.icon;

  return (
    <section id="demo" className="section-padding bg-white/55 dark:bg-transparent">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Live Demo"
          title="Watch Invoice Financing"
          titleHighlight="In Action"
          subtitle="See the full lifecycle — from invoice upload to cash release — in an interactive simulation."
        />

        <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — step list */}
          <div className="flex flex-col gap-3">
            {DEMO_STEPS.map((s, i) => {
              const SIcon = s.icon;
              const done    = i < activeStep;
              const active  = i === activeStep;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => { setPlaying(false); setActiveStep(i); }}
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-200 border ${
                    active
                      ? 'border-primary-200 dark:border-primary-800/50 bg-primary-50 dark:bg-primary-950/30 shadow-sm'
                      : done
                      ? 'border-success-500/20 bg-success-500/5 dark:bg-success-500/10'
                      : 'border-gray-100 dark:border-dark-border hover:border-gray-200 dark:hover:border-dark-muted'
                  }`}
                >
                  <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${
                    done ? 'bg-success-500' : active ? s.color : 'bg-gray-100 dark:bg-dark-card'
                  } transition-colors`}>
                    {done
                      ? <CheckCircle className="h-5 w-5 text-white" />
                      : <SIcon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      Step {s.id}: {s.label}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{s.description}</div>
                  </div>
                  {active && (
                    <motion.div
                      className="h-2 w-2 rounded-full bg-primary-500"
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              );
            })}

            <motion.button
              onClick={startPlayback}
              disabled={playing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-glow-blue"
            >
              {playing ? 'Playing…' : '▶  Auto-Play Demo'}
            </motion.button>
          </div>

          {/* Right — animated visualization */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-gray-100 dark:border-dark-border bg-gradient-to-br from-gray-50 to-white dark:from-dark-card dark:to-dark-card2 p-10 flex flex-col items-center justify-center min-h-[340px] shadow-xl"
          >
            <motion.div
              className={`h-24 w-24 rounded-3xl ${step.color} flex items-center justify-center shadow-lg mb-6`}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="h-12 w-12 text-white" />
            </motion.div>

            <div className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
              Step {step.id} of {DEMO_STEPS.length}
            </div>
            <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
              {step.label}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">{step.description}</p>

            {/* Progress bar */}
            <div className="mt-8 w-full h-1.5 rounded-full bg-gray-100 dark:bg-dark-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                animate={{ width: `${((activeStep + 1) / DEMO_STEPS.length) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              {Math.round(((activeStep + 1) / DEMO_STEPS.length) * 100)}% complete
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
