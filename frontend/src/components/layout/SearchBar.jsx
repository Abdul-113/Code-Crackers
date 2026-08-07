import React from 'react';
import { Search } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';

export default function SearchBar({ className = '' }) {
  const { setShowSearchOverlay } = useDemoMode();

  return (
    <div 
      className={`relative w-full max-w-xs sm:max-w-sm cursor-pointer ${className}`}
      onClick={() => setShowSearchOverlay(true)}
    >
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        placeholder="Search invoices, buyers, reports..."
        readOnly
        className="block w-full rounded-xl border border-gray-150 dark:border-dark-border pl-10 pr-12 py-2.5 text-xs bg-gray-50 dark:bg-dark-card/50 text-gray-900 dark:text-white placeholder-gray-400 cursor-pointer focus:outline-none transition-all duration-200"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-[9px] font-bold text-gray-400">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}
