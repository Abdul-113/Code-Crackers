import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, FileUp, MessageSquare } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import DashboardNavbar from './DashboardNavbar';
import CommandPalette from './CommandPalette';
import NotificationDrawer from './NotificationDrawer';
import SearchOverlay from './SearchOverlay';
import HelpCenter from './HelpCenter';
import toast from 'react-hot-toast';

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const location = useLocation();

  const handleFabAction = (actionName) => {
    toast(`Action triggered: ${actionName}`, {
      icon: '⚡',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      }
    });
    setFabOpen(false);
  };

  const pageTransitionVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.25 } }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* Sidebar (Desktop and Mobile Drawer) */}
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        <DashboardNavbar setMobileOpen={setMobileSidebarOpen} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageTransitionVariants}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Reusable Floating Action Button (FAB) Architecture */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Expanded FAB Menu */}
        <AnimatePresence>
          {fabOpen && (
            <div className="flex flex-col gap-2 items-end">
              {[
                { label: 'Upload Invoice', icon: FileUp, action: 'upload' },
                { label: 'Connect Wallet', icon: Wallet, action: 'connect' },
                { label: 'Support Chat',   icon: MessageSquare, action: 'support' },
              ].map((item, idx) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ duration: 0.15, delay: idx * 0.05 }}
                  onClick={() => handleFabAction(item.label)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-white/5 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-lg"
                >
                  <item.icon className="h-4 w-4 text-primary-500" />
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Primary FAB Trigger */}
        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-xl hover:shadow-glow-blue transition-all"
        >
          <motion.div
            animate={{ rotate: fabOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="h-6 w-6" />
          </motion.div>
        </motion.button>
      </div>

      {/* Global Command, Search, Notification Overlay Elements */}
      <CommandPalette />
      <NotificationDrawer />
      <SearchOverlay />
      <HelpCenter />

    </div>
  );
}
