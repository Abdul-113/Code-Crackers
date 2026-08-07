import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Landmark, CheckSquare, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  {
    id: 'msme',
    title: 'MSME Owner',
    icon: Building2,
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'hover:shadow-glow-blue',
    description: 'Upload invoices and receive instant working capital.'
  },
  {
    id: 'investor',
    title: 'Investor',
    icon: Landmark,
    gradient: 'from-violet-500 to-purple-600',
    glow: 'hover:shadow-glow-purple',
    description: 'Browse verified invoices and invest securely.'
  },
  {
    id: 'buyer',
    title: 'Corporate Buyer',
    icon: CheckSquare,
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'hover:shadow-glow-cyan',
    description: 'Approve invoices and settle payments.'
  },
];

export default function RoleStep({ selectedRole, onSelectRole, onNext, onPrev }) {
  const handleContinue = () => {
    if (!selectedRole) {
      return toast.error("Please select a participation role.");
    }
    onNext();
  };

  return (
    <div className="space-y-8 flex flex-col justify-center">
      <div className="text-center space-y-2">
        <h3 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
          Choose Your Role
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select how you will participate in the Invoice2Credit AI ecosystem.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 w-full">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const active = selectedRole === role.id;

          return (
            <motion.button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              className={`text-left rounded-2xl border p-5 flex gap-4 transition-all duration-300 ${role.glow} ${
                active 
                  ? 'border-primary-600 bg-primary-50/20 dark:bg-primary-950/20 shadow-lg ring-1 ring-primary-600' 
                  : 'border-gray-150 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <div className={`h-11 w-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${role.gradient} shadow-md text-white`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="font-display font-bold text-gray-900 dark:text-white text-sm">
                  {role.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {role.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <motion.button
          type="button"
          onClick={onPrev}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 px-6 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Back</span>
        </motion.button>

        <motion.button
          onClick={handleContinue}
          disabled={!selectedRole}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </motion.button>
      </div>
    </div>
  );
}
