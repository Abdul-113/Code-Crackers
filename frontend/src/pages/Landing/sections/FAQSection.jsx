import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { FAQ_ITEMS } from '@/constants/landingData';
import SectionTitle from '@/components/ui/SectionTitle';
import { staggerContainer, fadeUp } from '@/constants/animations';

function FAQItem({ item, index, isOpen, onToggle }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="border-b border-gray-100 dark:border-dark-border last:border-0"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{item.question}</span>
        <motion.div
          className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-card text-gray-500 dark:text-gray-400"
          animate={{ rotate: isOpen ? 45 : 0, backgroundColor: isOpen ? '#2563eb' : undefined }}
          transition={{ duration: 0.2 }}
        >
          {isOpen
            ? <Minus className="h-3.5 w-3.5 text-white" />
            : <Plus  className="h-3.5 w-3.5" />
          }
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-gray-500 dark:text-gray-400 max-w-3xl pr-12">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="section-padding bg-white/60 dark:bg-transparent">
      <div className="mx-auto max-w-4xl">
        <SectionTitle
          eyebrow="FAQ"
          title="Frequently Asked"
          titleHighlight="Questions"
          subtitle="Everything you need to know about Invoice2Credit AI and how it transforms invoice financing."
        />

        <motion.div
          className="mt-14 rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card shadow-card dark:shadow-card-dark px-8 divide-y divide-gray-50 dark:divide-dark-border"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
