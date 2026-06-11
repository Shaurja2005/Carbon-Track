import type { JSX } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui';
import { ThemeToggle } from './ThemeToggle';

/**
 * Top navigation — glassmorphism sticky header with animated leaf logo,
 * primary nav links, and the dark/light theme toggle.
 */
export function SiteHeader(): JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-xl px-1 font-display text-lg font-bold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-glow-sm transition-all duration-300 group-hover:shadow-glow animate-leaf-float">
            <Icon name="leaf" size={20} />
          </span>
          <span className="text-gradient">EcoTrace</span>
        </Link>

        {/* Nav + toggle */}
        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label="Primary" className="flex items-center gap-1">
            <Link
              href="/calculator"
              className="relative rounded-xl px-3 py-2 text-sm font-medium text-ink-muted transition-colors duration-200 hover:text-ink hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Calculator
            </Link>
            <Link
              href="/dashboard"
              className="relative rounded-xl px-3 py-2 text-sm font-medium text-ink-muted transition-colors duration-200 hover:text-ink hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Dashboard
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
