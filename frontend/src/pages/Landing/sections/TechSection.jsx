import React from 'react';
import { motion } from 'framer-motion';
import { TECHNOLOGIES } from '@/constants/landingData';
import SectionTitle from '@/components/ui/SectionTitle';
import { scaleIn, staggerContainerFast } from '@/constants/animations';

// Tech logo letters as initials — clean and branded
const TECH_INITIALS = {
  'React':         { letter: 'R', sub: 'React'         },
  'FastAPI':       { letter: 'F', sub: 'FastAPI'       },
  'Firebase':      { letter: '🔥', sub: 'Firebase'     },
  'Groq AI':       { letter: 'G', sub: 'Groq AI'       },
  'Polygon':       { letter: '⬡', sub: 'Polygon'       },
  'Solidity':      { letter: 'S', sub: 'Solidity'      },
  'Firestore':     { letter: '🗄', sub: 'Firestore'    },
  'Tailwind CSS':  { letter: 'T', sub: 'Tailwind'      },
  'Framer Motion': { letter: '▲', sub: 'Framer'        },
};

function TechCard({ tech, index }) {
  const info = TECH_INITIALS[tech.name];

  return (
    <motion.div
      variants={scaleIn}
      custom={index}
      whileHover={{
        y: -8,
        boxShadow: `0 20px 40px -8px ${tech.color}40`,
        borderColor: `${tech.color}60`,
        transition: { duration: 0.2 },
      }}
      className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 cursor-default transition-colors duration-200"
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold shadow-sm transition-transform duration-200"
        style={{ background: tech.bg, color: tech.color, border: `1px solid ${tech.color}30` }}
      >
        {info?.letter || tech.name[0]}
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-800 dark:text-white">{tech.name}</div>
        <div className="text-[11px] mt-0.5 font-medium" style={{ color: tech.color }}>{tech.category}</div>
      </div>
    </motion.div>
  );
}

export default function TechSection() {
  return (
    <section id="technology" className="section-padding bg-gray-50/40 dark:bg-transparent">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Technology Stack"
          title="Built With"
          titleHighlight="World-Class Tools"
          subtitle="Every layer of the stack was chosen deliberately — for performance, developer experience, and enterprise-grade reliability."
        />

        <motion.div
          className="mt-16 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-4"
          variants={staggerContainerFast}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {TECHNOLOGIES.map((tech, i) => (
            <TechCard key={tech.name} tech={tech} index={i} />
          ))}
        </motion.div>

        {/* Architecture diagram hint */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-8 overflow-hidden"
        >
          <div className="flex flex-wrap gap-3 items-center justify-center text-sm font-medium">
            {[
              { label: 'React Frontend', color: '#61DAFB' },
              { arrow: true },
              { label: 'FastAPI Backend', color: '#009688' },
              { arrow: true },
              { label: 'Firebase Auth + Firestore', color: '#FFCA28' },
              { arrow: true },
              { label: 'Groq LLM', color: '#F97316' },
              { arrow: true },
              { label: 'Polygon Blockchain', color: '#8247E5' },
            ].map((item, i) =>
              item.arrow ? (
                <span key={i} className="text-gray-300 dark:text-gray-600 text-lg">→</span>
              ) : (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                  style={{ color: item.color, borderColor: item.color + '30', background: item.color + '12' }}
                >
                  {item.label}
                </span>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
