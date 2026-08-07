import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, FileText, Landmark, Users, BarChart3, Globe, Sparkles, 
  User, Settings, HelpCircle, FileUp, Wallet, ArrowRight, Zap, RefreshCw, Clock
} from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import toast from 'react-hot-toast';

const ITEMS = [
  { id: 'dash', label: 'Go to Dashboard', cat: 'Navigation', icon: BarChart3, path: '/app/dashboard' },
  { id: 'msme', label: 'Go to MSME Portal', cat: 'Navigation', icon: FileText, path: '/app/msme' },
  { id: 'inv', label: 'Go to Investor Portal', cat: 'Navigation', icon: Landmark, path: '/app/investor' },
  { id: 'buy', label: 'Go to Buyer Portal', cat: 'Navigation', icon: Users, path: '/app/buyer' },
  { id: 'admin', label: 'Go to Admin Control', cat: 'Navigation', icon: Settings, path: '/app/admin' },
  { id: 'market', label: 'Open Marketplace', cat: 'Navigation', icon: Landmark, path: '/app/marketplace' },
  { id: 'activity', label: 'Open Workflow Timeline', cat: 'Navigation', icon: Clock, path: '/app/activity' },
  { id: 'profile', label: 'Open Profile Settings', cat: 'Navigation', icon: User, path: '/app/profile' },
  
  { id: 'action_upload', label: 'Upload Invoice', cat: 'Quick Actions', icon: FileUp, action: 'upload' },
  { id: 'action_wallet', label: 'Connect Wallet', cat: 'Quick Actions', icon: Wallet, action: 'wallet' },
  { id: 'action_report', label: 'Generate AI Report', cat: 'Quick Actions', icon: Sparkles, action: 'report' },
  
  { id: 'role_msme', label: 'Switch Role to MSME Owner', cat: 'Switch Role (Demo)', icon: RefreshCw, role: 'msme' },
  { id: 'role_inv', label: 'Switch Role to Investor', cat: 'Switch Role (Demo)', icon: RefreshCw, role: 'investor' },
  { id: 'role_buy', label: 'Switch Role to Corporate Buyer', cat: 'Switch Role (Demo)', icon: RefreshCw, role: 'buyer' },
  { id: 'role_adm', label: 'Switch Role to Platform Admin', cat: 'Switch Role (Demo)', icon: RefreshCw, role: 'admin' },
];

export default function CommandPalette() {
  const { showCommandPalette, setShowCommandPalette, switchRole } = useDemoMode();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (showCommandPalette) {
      inputRef.current?.focus();
      setActiveIndex(0);
      setQuery('');
    }
  }, [showCommandPalette]);

  if (!showCommandPalette) return null;

  const filtered = ITEMS.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) || 
    item.cat.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item) => {
    setShowCommandPalette(false);
    if (item.path) {
      navigate(item.path);
    } else if (item.role) {
      switchRole(item.role);
    } else if (item.action) {
      if (item.action === 'upload') {
        toast.success('Upload modal opened via Command Palette.');
      } else if (item.action === 'wallet') {
        toast.success('MetaMask connection initialized.');
      } else if (item.action === 'report') {
        toast.promise(new Promise(r => setTimeout(r, 1500)), {
          loading: 'Analyzing active risk spreadsheets...',
          success: 'Structured PDF Underwriting report compiled!',
          error: 'Generation failed.'
        });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) {
        handleSelect(filtered[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowCommandPalette(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Overlay Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={() => setShowCommandPalette(false)}
      />

      {/* Main Palette Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -10 }}
        className="relative w-full max-w-lg rounded-2xl border border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card shadow-2xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input bar */}
        <div className="flex items-center gap-3 px-4 border-b border-gray-100 dark:border-slate-800">
          <Search className="h-5 w-5 text-gray-400" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            className="w-full py-4 text-sm bg-transparent border-0 outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-900 text-[10px] font-bold text-gray-400">ESC</kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto p-2">
          {filtered.length > 0 ? (
            <div>
              {/* Group items by category */}
              {['Navigation', 'Quick Actions', 'Switch Role (Demo)'].map(cat => {
                const catItems = filtered.filter(x => x.cat === cat);
                if (catItems.length === 0) return null;

                return (
                  <div key={cat} className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 py-1.5 block">{cat}</span>
                    {catItems.map(item => {
                      const itemIdx = filtered.findIndex(x => x.id === item.id);
                      const Icon = item.icon;
                      const active = itemIdx === activeIndex;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors duration-150 ${
                            active 
                              ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400' 
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span>{item.label}</span>
                          </div>
                          {active && <span className="text-[10px] font-bold flex items-center gap-0.5 opacity-60">Enter <ArrowRight className="h-3 w-3" /></span>}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-gray-400">
              No matching commands or navigation routes.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
