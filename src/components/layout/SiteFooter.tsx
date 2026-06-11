import type { JSX } from 'react';
import { Icon } from '@/components/ui';

/**
 * Site footer with methodology note, author attribution, and project links.
 * Static Server Component — same-origin links only to keep CSP intact.
 */
export function SiteFooter(): JSX.Element {
  return (
    <footer className="mt-20 border-t border-border bg-surface-2/50 transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <Icon name="leaf" size={18} />
              </span>
              <span className="font-display font-semibold text-ink">EcoTrace</span>
            </div>
            <p className="max-w-xs text-sm text-ink-muted leading-relaxed">
              A carbon footprint awareness platform. Understand, track, and reduce your impact
              through data-driven, personalized insights.
            </p>
            <p className="text-xs text-ink-subtle">
              Built by{' '}
              <span className="font-semibold text-primary">Sauryadipta Bhattacharya</span>
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-semibold text-ink mb-1">Resources</p>
            <a
              href="/calculator"
              className="text-ink-muted hover:text-primary transition-colors duration-200"
            >
              Carbon Calculator
            </a>
            <a
              href="/dashboard"
              className="text-ink-muted hover:text-primary transition-colors duration-200"
            >
              Your Dashboard
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-subtle">
            &copy; {new Date().getFullYear()} EcoTrace &middot; Carbon Footprint Awareness Platform
          </p>
          <p className="text-xs text-ink-subtle">
            Estimates are for awareness only. Your data stays on your device.
          </p>
        </div>
      </div>
    </footer>
  );
}
