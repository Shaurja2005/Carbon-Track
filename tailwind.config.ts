import type { Config } from 'tailwindcss';

/**
 * Design tokens for EcoTrace — dark/light dual theme.
 * CSS custom properties (defined in globals.css) are the runtime source of truth;
 * these Tailwind tokens reference them so utility classes resolve correctly.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        'surface-3': 'var(--color-surface-3)',
        ink: 'var(--color-ink)',
        'ink-muted': 'var(--color-ink-muted)',
        'ink-subtle': 'var(--color-ink-subtle)',
        warning: 'var(--color-warning)',
        border: 'var(--color-border)',
        'glow-primary': 'var(--glow-primary)',
        'glow-accent': 'var(--glow-accent)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 4px 32px 0 rgba(0,0,0,0.12), inset 0 1px 0 0 rgba(255,255,255,0.08)',
        'glass-dark': '0 4px 32px 0 rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.06)',
        glow: '0 0 24px 4px var(--glow-primary)',
        'glow-sm': '0 0 12px 2px var(--glow-primary)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
        'gradient-hero':
          'radial-gradient(ellipse 80% 60% at 50% 0%, var(--hero-glow-top) 0%, transparent 70%)',
        'gradient-mesh':
          'radial-gradient(at 40% 20%, var(--mesh-1) 0px, transparent 50%), radial-gradient(at 80% 0%, var(--mesh-2) 0px, transparent 50%), radial-gradient(at 0% 50%, var(--mesh-3) 0px, transparent 50%)',
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.6s ease both',
        'fade-in': 'fadeIn 0.4s ease both',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'leaf-float': 'leafFloat 4s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'progress-fill': 'progressFill 1s ease both',
        'scale-in': 'scaleIn 0.3s ease both',
        'count-up': 'countUp 0.8s ease both',
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px 2px var(--glow-primary)' },
          '50%': { boxShadow: '0 0 24px 8px var(--glow-primary)' },
        },
        leafFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-4px) rotate(3deg)' },
          '66%': { transform: 'translateY(-2px) rotate(-2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        progressFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-value, 100%)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
