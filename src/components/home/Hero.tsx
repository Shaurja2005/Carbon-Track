import type { JSX } from 'react';
import { ButtonLink, Icon } from '@/components/ui';

/** Above-the-fold hero — split screen layout (Logo Left, Content Right). */
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

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          
          {/* Left Column: Visual (Logo Only) */}
          <div className="relative hidden lg:flex items-center justify-center animate-fade-slide-up delay-300">
            <Icon 
              name="hexagon" 
              size={350} 
              className="text-primary opacity-80 animate-pulse-glow drop-shadow-2xl" 
            />
          </div>

          {/* Right Column: Text & CTAs */}
          <div className="flex flex-col items-start text-left">
            {/* Badge */}
            <span
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary animate-pulse-glow"
              style={{ animationDelay: '0ms' }}
            >
              <Icon name="hexagon" size={15} />
              Carbon Footprint Awareness Platform
            </span>

            {/* Headline */}
            <h1 className="mt-8 font-display text-5xl font-bold tracking-tight sm:text-7xl animate-fade-slide-up delay-100">
              <span className="text-ink">Analyze.</span> <br className="hidden lg:block" />
              <span className="text-gradient">Measure.</span> <br className="hidden lg:block" />
              <span className="text-ink">Improve.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted animate-fade-slide-up delay-200">
              Quickly calculate your yearly carbon footprint, uncover your main emission sources, and
              discover actionable steps to lower your impact—completely offline within your browser.
              No signup needed.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-3 animate-fade-slide-up delay-300">
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
          </div>

        </div>
      </div>
    </section>
  );
}
