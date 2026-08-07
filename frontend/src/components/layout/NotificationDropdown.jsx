import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationDropdown() {
  const { setShowNotificationDrawer } = useDemoMode();
  const { currentUser } = useAuth();

  // Pull live unread count from the backend (30-second poll)
  const { data } = useNotifications(currentUser?.uid, { unreadOnly: true, limit: 50 });
  const unreadCount = data?.unreadCount ?? data?.count ?? 0;

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowNotificationDrawer(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 rounded-xl border border-gray-100 dark:border-dark-border text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border border-white dark:border-dark-bg flex items-center justify-center text-[7px] font-bold text-white" />
        )}
      </motion.button>
    </div>
  );
}
