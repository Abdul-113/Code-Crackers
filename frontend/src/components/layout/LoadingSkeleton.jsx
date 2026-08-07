import React from 'react';

export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const CardSkeleton = () => (
    <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-gray-200 dark:bg-dark-muted rounded" />
        <div className="h-6 w-12 bg-gray-200 dark:bg-dark-muted rounded-full" />
      </div>
      <div className="h-8 w-36 bg-gray-300 dark:bg-dark-muted rounded" />
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full bg-gray-200 dark:bg-dark-muted rounded" />
        <div className="h-3 w-5/6 bg-gray-200 dark:bg-dark-muted rounded" />
      </div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="rounded-2xl border border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm overflow-hidden animate-pulse">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-card/50 h-12" />
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-dark-border last:border-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 dark:bg-dark-muted rounded-xl" />
              <div className="space-y-2">
                <div className="h-3.5 w-28 bg-gray-300 dark:bg-dark-muted rounded" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-dark-muted rounded" />
              </div>
            </div>
            <div className="h-4 w-16 bg-gray-300 dark:bg-dark-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        type === 'table' ? <TableSkeleton key={idx} /> : <CardSkeleton key={idx} />
      ))}
    </div>
  );
}
