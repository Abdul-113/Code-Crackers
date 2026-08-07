import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function PasswordField({
  label,
  id,
  error,
  placeholder = '••••••••',
  ...props
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label 
          htmlFor={id} 
          className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Lock className="h-4 w-4" />
        </div>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className={`block w-full rounded-xl border transition-all duration-300 text-sm bg-gray-50/50 dark:bg-slate-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
              : 'border-gray-200 dark:border-slate-800 focus:border-primary-500 dark:focus:border-primary-500/80 focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-500/10 focus:shadow-glow-blue/20'
          } pl-11 pr-11 py-3`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p className="text-xs font-medium text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
