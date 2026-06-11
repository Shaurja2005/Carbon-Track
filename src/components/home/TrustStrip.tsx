import type { JSX } from 'react';
import { Icon, type IconName } from '@/components/ui';

const TRUST: ReadonlyArray<{ icon: IconName; title: string; body: string }> = [
  {
    icon: 'shield',
    title: 'Private by design',
    body: 'Everything runs in your browser. Your answers are stored only on your device — never sent to a server or third party.',
  },
  {
    icon: 'globe',
    title: 'Transparent methodology',
    body: 'Built on published emission factors from DEFRA, the US EPA, IEA, and peer-reviewed dietary research.',
  },
  {
    icon: 'leaf',
    title: 'Built for action',
    body: 'Designed to turn awareness into a concrete, trackable reduction goal you can return to over time.',
  },
];

/** Why-trust-us strip — glassmorphism cards with icon pulse on hover. */
export function TrustStrip(): JSX.Element {
  return (
    <section
      aria-labelledby="trust-heading"
      className="border-y border-border bg-surface-2/50 py-20 transition-colors duration-300"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          id="trust-heading"
          className="text-center font-display text-3xl font-bold text-ink sm:text-4xl animate-fade-slide-up"
        >
          Why you can trust the numbers
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TRUST.map((item, i) => (
            <div
              key={item.title}
              className={[
                'group flex gap-4 rounded-3xl border border-border bg-surface p-6',
                'transition-all duration-300 hover:border-accent/40 hover:shadow-glow',
                'animate-fade-slide-up',
                i === 0 ? 'delay-100' : i === 1 ? 'delay-200' : 'delay-300',
              ].join(' ')}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:shadow-glow-sm">
                <Icon name={item.icon} size={22} />
              </span>
              <div>
                <h3 className="font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-ink-subtle animate-fade-slide-up delay-400">
          Full sourcing and caveats are documented in the project&apos;s methodology section in the
          README.
        </p>
      </div>
    </section>
  );
}
