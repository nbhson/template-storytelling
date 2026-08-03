'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * GlassCard
 * ---------
 * Glassmorphism card with rounded corners, soft border and premium shadow.
 * Scroll-driven appearance is handled by the master GSAP timeline via
 * data-scroll attributes; Framer Motion is only for hover/tap micro-feedback.
 */
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  'data-solution-card'?: number;
}

export function GlassCard({
  children,
  className = '',
  delay = 0,
  ...rest
}: GlassCardProps) {
  return (
    <motion.div
      data-scroll-card="true"
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/40 backdrop-blur-xl transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.07] ${className}`}
      {...rest}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {children}
    </motion.div>
  );
}