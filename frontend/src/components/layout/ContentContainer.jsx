import React from 'react';

export default function ContentContainer({ children, className = '' }) {
  return (
    <div className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 ${className}`}>
      {children}
    </div>
  );
}
