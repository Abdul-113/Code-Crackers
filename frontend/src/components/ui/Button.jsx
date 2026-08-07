import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 transition-all duration-200 hover:text-primary-600 dark:hover:text-primary-400 hover:-translate-y-0.5',
  outline: 'inline-flex items-center gap-2 rounded-xl border-2 border-primary-600 px-6 py-3 text-sm font-semibold text-primary-600 dark:text-primary-400 transition-all duration-200 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white hover:-translate-y-0.5',
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: '',
  lg: 'px-8 py-4 text-base rounded-2xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  className = '',
  onClick,
  href,
  ...props
}) {
  const base = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || '';
  const cls = `${base} ${sizeClass} ${className}`.trim();

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="h-4 w-4 flex-shrink-0" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="h-4 w-4 flex-shrink-0" />}
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={cls}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={cls}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {content}
    </motion.button>
  );
}
