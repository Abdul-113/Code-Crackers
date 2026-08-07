import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, FileText, User, Landmark, ShieldCheck, BarChart3, ArrowRight } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useNavigate } from 'react-router-dom';

const SEARCH_DATA = [
  { label: 'INV-2026-085Raymond Ltd', query: 'Raymond Ltd', amount: '₹12,40,000', cat: 'Invoices', id: 'INV-2026-086' },
  { label: 'INV-2026-089 Tata Motors Group', query: 'Tata Motors', amount: '₹6,40,000', cat: 'Invoices', id: 'INV-2026-087' },
  { label: 'AltFin Yield Fund', query: 'AltFin', details: 'Verified Investor Pool', cat: 'Investors' },
  { label: 'Raymond Retail Group', query: 'Raymond', details: 'AAA Corporate Buyer', cat: 'Buyers' },
  { label: 'Q2 Performance Report', query: 'Report', details: 'Business Intelligence PDF', cat: 'Reports' },
  { label: 'NFT Contract verification', query: 'NFT', details: 'Polygon POS Mainnet', cat: 'Blockchain' }
];

export default function SearchOverlay() {
  const { showSearchOverlay, setShowSearchOverlay } = useDemoMode();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!showSearchOverlay) return null;

  const filtered = SEARCH_DATA.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item) => {
    setShowSearchOverlay(false);
    if (item.cat === 'Invoices') {
      navigate(`/app/invoice/${item.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Overlay Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={() => setShowSearchOverlay(false)}
      />

      {/* Main Overlay Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -10 }}
        className="relative w-full max-w-xl rounded-2xl border border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card shadow-2xl overflow-hidden"
      >
        {/* Search header bar */}
        <div className="flex items-center gap-3 px-4 border-b border-gray-100 dark:border-slate-800">
          <Search className="h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search invoices, buyers, reports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-4 text-sm bg-transparent border-0 outline-none text-gray-900 dark:text-white placeholder-gray-400"
            autoFocus
          />
          <button 
            onClick={() => setShowSearchOverlay(false)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Categorized Results */}
        <div className="max-h-[360px] overflow-y-auto p-4 space-y-4">
          {query ? (
            filtered.length > 0 ? (
              ['Invoices', 'Investors', 'Buyers', 'Reports', 'Blockchain'].map(cat => {
                const catItems = filtered.filter(x => x.cat === cat);
                if (catItems.length === 0) return null;

                return (
                  <div key={cat} className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-slate-800 pb-1">{cat}</h4>
                    {catItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelect(item)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300 transition"
                      >
                        <div className="flex items-center gap-2">
                          {cat === 'Invoices' ? <FileText className="h-4 w-4 text-primary-500" /> : <User className="h-4 w-4 text-violet-500" />}
                          <span>{item.label.split(item.query)[0]} {item.query}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold flex items-center gap-0.5">
                          {item.amount || item.details}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-xs text-gray-400">
                No matching platform results found.
              </div>
            )
          ) : (
            <div className="text-center py-12 text-xs text-gray-400">
              Type to start searching the entire platform index...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
