import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: '#05060a',
        surface: '#0b0d14',
        line: 'rgba(255,255,255,0.08)',
        accent: {
          DEFAULT: '#7c8cff',
          soft: '#a5b4fc',
        },
        cyan: '#67e8f9',
        violet: '#a78bfa',
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        display: ['var(--font-space-grotesk)', 'var(--font-inter)', 'sans-serif'],
        mono: ['"SF Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.05em',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        glow: '0 0 80px -20px rgba(124,140,255,0.45)',
        card: '0 30px 80px -30px rgba(0,0,0,0.8)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;