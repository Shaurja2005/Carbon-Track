'use client';

import type { JSX } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from './ThemeProvider';

/**
 * Sun / moon toggle button. Reads from and writes to ThemeProvider context.
 * Labelled explicitly for assistive technology.
 */
export function ThemeToggle(): JSX.Element {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      id="theme-toggle"
      className={[
        'relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'focus-visible:ring-offset-surface',
        isDark
          ? 'bg-surface-2 text-yellow-300 hover:bg-surface-3 hover:shadow-glow-sm'
          : 'bg-surface-3 text-primary-dark hover:bg-surface-2',
      ].join(' ')}
    >
      <span
        className="transition-transform duration-300"
        style={{ transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)' }}
      >
        {isDark ? <Icon name="sun" size={18} /> : <Icon name="moon" size={18} />}
      </span>
    </button>
  );
}
