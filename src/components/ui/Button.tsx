'use client';

import { motion } from 'framer-motion';

/**
 * Button
 * ------
 * Premium animated button. Uses Framer Motion ONLY for micro-interactions
 * (hover/tap spring), never for scroll work.
 */
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
  href?: string;
  className?: string;
}

export function Button({ children, variant = 'primary', href = '#', className = '' }: ButtonProps) {
  const base =
    'group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black';
  const styles =
    variant === 'primary'
      ? 'bg-white text-black hover:bg-indigo-100'
      : 'border border-white/15 bg-white/5 text-white backdrop-blur-md hover:border-white/30 hover:bg-white/10';

  return (
    <motion.a
      href={href}
      className={`${base} ${styles} ${className}`}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {children}
      <span className="relative inline-block h-1.5 w-1.5 overflow-visible">
        <span className="absolute inset-0 rounded-full bg-current opacity-70 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-125" />
      </span>
    </motion.a>
  );
}