import type { JSX } from 'react';
import { ButtonLink, Icon } from '@/components/ui';
import { TARGET_TONNES } from '@/lib';

/** Above-the-fold hero — gradient headline, animated badge, and stat strip. */
export function Hero(): JSX.Element {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-100"
      />
      {/* Animated mesh gradient dots */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-60"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-36">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <span
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary animate-pulse-glow"
            style={{ animationDelay: '0ms' }}
          >
            <Icon name="leaf" size={15} />
            Carbon Footprint Awareness Platform
          </span>

          {/* Headline */}
          <h1 className="mt-8 font-display text-5xl font-bold tracking-tight sm:text-7xl animate-fade-slide-up delay-100">
            <span className="text-ink">Analyze.</span>{' '}
            <span className="text-gradient">Measure.</span>{' '}
            <span className="text-ink">Improve.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted animate-fade-slide-up delay-200">
            Quickly calculate your yearly carbon footprint, uncover your main emission sources, and discover actionable steps to lower your impact—completely offline within your browser. No signup needed.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-slide-up delay-300">
            <ButtonLink href="/calculator" size="lg">
              Calculate your footprint
              <Icon name="arrow-right" size={20} />
            </ButtonLink>
            <ButtonLink href="/dashboard" size="lg" variant="secondary">
              View your dashboard
            </ButtonLink>
          </div>

          <p className="mt-8 text-sm text-ink-subtle animate-fade-slide-up delay-500">
            100% Free &middot; Private &middot; Based on 1.5°C climate goals
          </p>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 animate-fade-slide-up delay-500">
            {[
              { value: '4', label: 'Emission categories' },
              { value: '30+', label: 'Countries compared' },
              { value: '8', label: 'Reduction tips' },
              { value: '2min', label: 'To complete' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl px-4 py-4 text-center"
              >
                <p className="font-display text-2xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-xs text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
