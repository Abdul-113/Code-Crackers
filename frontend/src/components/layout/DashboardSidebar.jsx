import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, LayoutDashboard, Store, LineChart, 
  Building2, Wallet, CheckSquare, ShieldCheck, 
  User, ChevronLeft, ChevronRight, LogOut, Layers, Brain,
  Clock, Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard',      path: '/app/dashboard',   icon: LayoutDashboard, role: 'msme' },
  { name: 'Marketplace',    path: '/app/marketplace', icon: Store,           role: 'investor' },
  { name: 'MSME Portal',    path: '/app/msme',        icon: Building2,       role: 'msme' },
  { name: 'Investor Portal',path: '/app/investor',    icon: Wallet,          role: 'investor' },
  { name: 'Buyer Portal',   path: '/app/buyer',       icon: CheckSquare,     role: 'buyer' },
  { name: 'Admin Portal',   path: '/app/admin',       icon: ShieldCheck,     role: 'admin' },
  { name: 'Analytics',      path: '/app/analytics',   icon: LineChart,       role: 'msme' },
  { name: 'Blockchain Explorer', path: '/app/blockchain', icon: Layers,       role: 'investor' },
  { name: 'AI Copilot',     path: '/app/copilot',     icon: Brain,           role: 'msme' },
  { name: 'Profile',        path: '/app/profile',     icon: User,            role: 'all' },
  { name: 'Workflow Timeline', path: '/app/activity',  icon: Clock,           role: 'all' },
];

export default function DashboardSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { currentUser, logout } = useAuth();
  const userRole = currentUser?.role || 'msme';

  const ROLE_CONFIG = {
    msme:     { label: 'MSME Owner',      color: 'text-blue-500',   bg: 'bg-blue-500/10',   icon: Building2 },
    investor: { label: 'Investor',         color: 'text-violet-500', bg: 'bg-violet-500/10', icon: Wallet },
    buyer:    { label: 'Corporate Buyer',  color: 'text-emerald-500',bg: 'bg-emerald-500/10',icon: CheckSquare },
    admin:    { label: 'Platform Admin',   color: 'text-rose-500',   bg: 'bg-rose-500/10',   icon: Shield },
  };
  const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.msme;

  const filteredNav = NAV_ITEMS.filter(item => item.role === 'all' || item.role === userRole);

  const sidebarVariants = {
    expanded: { width: '256px' },
    collapsed: { width: '80px' }
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-dark-card border-r border-gray-100 dark:border-dark-border transition-colors duration-300">
      
      {/* Sidebar Header / Logo */}
      <div>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-5 h-16 border-b border-gray-100 dark:border-dark-border`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 flex-shrink-0 shadow-md">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <span className="font-display font-bold text-gray-900 dark:text-white tracking-tight whitespace-nowrap">
                Invoice<span className="text-primary-600">2Credit</span>
              </span>
            )}
          </div>

          {!collapsed ? (
            <button 
              onClick={() => setCollapsed(true)} 
              className="hidden lg:flex p-1.5 rounded-lg border border-gray-100 dark:border-dark-border text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : (
            <button 
              onClick={() => setCollapsed(false)} 
              className="hidden lg:flex p-1.5 rounded-lg border border-gray-100 dark:border-dark-border text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>

      {/* Nav List */}
      <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-nowrap"
              >
                {item.name}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-dark-border">
        <button
          onClick={logout}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all duration-150`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

    </div>
  );

  return (
    <>
      <motion.div
        animate={collapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:block h-screen sticky top-0 z-30 flex-shrink-0"
      >
        <SidebarContent />
      </motion.div>

      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        />
      )}

      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: mobileOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="lg:hidden fixed top-0 bottom-0 left-0 z-50 w-64 shadow-2xl"
      >
        <SidebarContent />
      </motion.div>
    </>
  );
}
