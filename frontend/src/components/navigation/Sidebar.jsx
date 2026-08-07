import React from 'react';
import { NavLink } from 'react-router-dom';
import { CreditCard, LayoutDashboard, Store, LineChart, Building2, Wallet, ShieldCheck, FileCheck, CalendarDays, User } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

const MENU_ITEMS = [
  { name: 'Dashboard',      path: '/app/dashboard',   icon: LayoutDashboard },
  { name: 'Marketplace',    path: '/app/marketplace', icon: Store           },
  { name: 'MSME Portal',    path: '/app/msme',        icon: Building2       },
  { name: 'Investor Portal',path: '/app/investor',    icon: Wallet          },
  { name: 'Buyer Portal',   path: '/app/buyer',       icon: FileCheck       },
  { name: 'Admin Portal',   path: '/app/admin',       icon: ShieldCheck     },
  { name: 'Analytics',      path: '/app/analytics',   icon: LineChart       },
  { name: 'Timeline',       path: '/app/timeline',    icon: CalendarDays    },
  { name: 'Profile',        path: '/app/profile',     icon: User            },
];

export default function Sidebar({ darkMode, onToggleDark }) {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100 dark:border-dark-border">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600">
          <CreditCard className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="font-display text-sm font-bold text-gray-900 dark:text-white">
          Invoice<span className="gradient-text">2Credit</span> AI
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 px-3 overflow-y-auto space-y-0.5">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
        <a href="/" className="text-xs text-gray-400 hover:text-primary-500 transition-colors">← Back to Home</a>
        {onToggleDark && <ThemeToggle darkMode={darkMode} onToggle={onToggleDark} />}
      </div>
    </aside>
  );
}
