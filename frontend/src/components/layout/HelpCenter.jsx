import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, BookOpen, GraduationCap, Keyboard, HelpCircle as FaqIcon, 
  MessageSquare, Video, X 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function HelpCenter() {
  const [open, setOpen] = useState(false);

  const items = [
    { label: 'Documentation', icon: BookOpen, desc: 'API schemas, SDK configs.' },
    { label: 'Interactive Tutorial', icon: GraduationCap, desc: 'Walkthrough of financing steps.' },
    { label: 'Keyboard Shortcuts', icon: Keyboard, desc: 'Quick keys for fast navigation.' },
    { label: 'Frequently Asked Questions', icon: FaqIcon, desc: 'Frequently asked questions.' },
    { label: 'Video Demo', icon: Video, desc: '3-minute platform overview video.' },
    { label: 'Contact Support', icon: MessageSquare, desc: 'Start a conversation with developers.' }
  ];

  const handleAction = (label) => {
    setOpen(false);
    if (label === 'Keyboard Shortcuts') {
      toast('Try pressing "Ctrl + K" or "⌘K" to search!', { icon: '⌨️' });
    } else {
      toast.success(`${label} documents loaded successfully.`);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Help Trigger button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-12 w-12 rounded-full bg-white dark:bg-dark-card border border-gray-150 dark:border-dark-border text-gray-500 hover:text-primary-500 shadow-lg flex items-center justify-center transition-all"
      >
        {open ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </motion.button>

      {/* Expanded Help Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="absolute bottom-14 left-0 w-72 rounded-2xl border border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card shadow-2xl p-4 z-50 space-y-4"
          >
            <div>
              <h3 className="font-display font-black text-xs text-gray-900 dark:text-white uppercase tracking-wider">Help & Support</h3>
              <p className="text-[10px] text-gray-400">Need help navigating the Polygon Amoy testnet?</p>
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleAction(item.label)}
                    className="w-full text-left p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300 font-semibold"
                  >
                    <Icon className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span>{item.label}</span>
                      <p className="text-[9px] text-gray-400 font-normal leading-tight mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
