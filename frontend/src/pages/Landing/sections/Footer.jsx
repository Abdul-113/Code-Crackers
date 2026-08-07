import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { NAV_LINKS } from '@/constants/landingData';
import { fadeUp, staggerContainer } from '@/constants/animations';

const FOOTER_LINKS = {
  Product: [
    { label: 'How It Works', href: '#solution'   },
    { label: 'Features',     href: '#features'   },
    { label: 'Marketplace',  href: '#demo'        },
    { label: 'Pricing',      href: '#'            },
  ],
  Technology: [
    { label: 'AI Engine',    href: '#technology' },
    { label: 'Blockchain',   href: '#technology' },
    { label: 'Smart Contracts', href: '#technology' },
    { label: 'Firebase',     href: '#technology' },
  ],
  Resources: [
    { label: 'Documentation', href: '#'          },
    { label: 'API Reference', href: '#'           },
    { label: 'Whitepaper',    href: '#'           },
    { label: 'FAQ',           href: '#faq'        },
  ],
};

const SOCIAL_LINKS = [
  { icon: Twitter,  href: '#', label: 'Twitter'  },
  { icon: Github,   href: '#', label: 'GitHub'   },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail,     href: '#', label: 'Email'    },
];

export default function Footer() {
  const handleClick = (e, href) => {
    if (href.startsWith('#') && href.length > 1) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="footer" className="bg-white/60 dark:bg-transparent border-t border-gray-100/40 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main footer body */}
        <motion.div
          className="py-16 grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {/* Brand column */}
          <motion.div variants={fadeUp} className="col-span-2 lg:col-span-2">
            <a href="#hero" onClick={(e) => handleClick(e, '#hero')} className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 shadow-glow-blue/30">
                <CreditCard className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-gray-900 dark:text-white">
                Invoice<span className="gradient-text">2Credit</span> AI
              </span>
            </a>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 max-w-xs">
              AI-powered, blockchain-backed invoice financing. Empowering MSMEs with instant working capital using the power of DeFi.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-200 dark:hover:border-primary-800/50 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <motion.div key={group} variants={fadeUp}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {group}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => handleClick(e, link.href)}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-gray-100 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 dark:text-gray-500">
          <span>© {new Date().getFullYear()} Invoice2Credit AI. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
