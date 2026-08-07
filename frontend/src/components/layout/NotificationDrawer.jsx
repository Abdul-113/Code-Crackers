import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Bell, Check, Trash2, Cpu, Wallet, ShieldCheck, Landmark, 
  FileText, ShieldAlert, Sparkles, HelpCircle, Terminal, Info, Search
} from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
  useDeleteNotification,
} from '@/hooks/useNotifications';
import toast from 'react-hot-toast';

const CATEGORY_META = {
  marketplace: { icon: Landmark,    color: 'text-violet-500 bg-violet-500/10' },
  blockchain:  { icon: ShieldCheck, color: 'text-primary-500 bg-primary-500/10' },
  ai:          { icon: Cpu,         color: 'text-pink-500 bg-pink-500/10' },
  funding:     { icon: Wallet,      color: 'text-emerald-500 bg-emerald-500/10' },
  invoices:    { icon: FileText,    color: 'text-blue-500 bg-blue-500/10' },
  security:    { icon: ShieldAlert, color: 'text-rose-500 bg-rose-500/10' },
  system:      { icon: Terminal,    color: 'text-amber-500 bg-amber-500/10' }
};

/** Format an ISO timestamp to a relative label (e.g. "2h ago", "3 days ago"). */
function relativeTime(iso) {
  try {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60)   return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return '';
  }
}

export default function NotificationDrawer() {
  const { showNotificationDrawer, setShowNotificationDrawer } = useDemoMode();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // ── Live API data ──────────────────────────────────────────────────────────
  const userId = currentUser?.uid;
  const { data: apiData } = useNotifications(userId, { category: activeCategory });
  const { mutate: markRead }      = useMarkNotificationRead();
  const { mutate: markAllRead }   = useMarkAllRead();
  const { mutate: deleteNotif }   = useDeleteNotification();

  // API notifications take priority; fall back to empty list
  const apiNotifications = (apiData?.notifications || []).map(n => ({
    ...n,
    time: relativeTime(n.createdAt),
  }));

  const filtered = apiNotifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                          (n.desc || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || n.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const unreadCount = apiData?.unreadCount ?? 0;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleMarkAllRead = () => {
    if (userId) markAllRead({ userId });
    else toast.error('Not signed in.');
  };

  const handleClearAll = () => {
    // Delete each visible notification
    filtered.forEach(n => {
      if (n.id && n.id !== 'local') deleteNotif({ notificationId: n.id });
    });
    toast.success('Notification history cleared.');
  };

  const handleToggleRead = (n) => {
    if (!n.id || n.id === 'local') return;
    if (!n.read) markRead({ notificationId: n.id });
    else toast('Already read.', { icon: 'ℹ️' });
  };

  if (!showNotificationDrawer) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={() => setShowNotificationDrawer(false)}
      />

      {/* Drawer Panel */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md h-full bg-white dark:bg-dark-card border-l border-gray-150 dark:border-dark-border shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-500" />
            <h2 className="font-display font-black text-sm text-gray-900 dark:text-white">Notification Drawer</h2>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary-500 text-white text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <button 
            onClick={() => setShowNotificationDrawer(false)}
            className="p-1 rounded-lg hover:bg-gray-150 dark:hover:bg-slate-800 transition text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Category Filter Actions */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-150 dark:border-dark-border bg-gray-50/50 dark:bg-slate-900/30 text-xs focus:outline-none"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
            {['all', 'marketplace', 'blockchain', 'ai', 'funding', 'invoices'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition ${
                  activeCategory === cat 
                    ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800/80">
          {filtered.length > 0 ? (
            filtered.map((n) => {
              const meta = CATEGORY_META[n.category] || { icon: Info, color: 'text-gray-500 bg-gray-500/10' };
              const Icon = meta.icon;

              return (
                <div key={n.id} className={`p-4 flex gap-3 transition ${n.read ? 'opacity-60' : 'bg-primary-50/5 dark:bg-primary-950/5'}`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">{n.title}</p>
                      <span className="text-[9px] text-gray-400 whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-normal">{n.desc}</p>
                    <div className="flex items-center gap-3 pt-2">
                      <button 
                        onClick={() => handleToggleRead(n)}
                        className="text-[9px] font-bold text-primary-500 hover:underline flex items-center gap-0.5"
                      >
                        <Check className="h-3 w-3" />
                        <span>{n.read ? 'Read' : 'Mark Read'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-xs text-gray-400">
              {userId ? 'No notifications to display.' : 'Sign in to view your notifications.'}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex gap-2">
          <button 
            onClick={handleMarkAllRead}
            className="flex-1 py-2 px-3 border border-gray-150 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition text-gray-500 dark:text-gray-400"
          >
            Mark All Read
          </button>
          <button 
            onClick={handleClearAll}
            className="py-2 px-3 border border-rose-100 dark:border-rose-950 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/10 transition flex items-center justify-center"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
