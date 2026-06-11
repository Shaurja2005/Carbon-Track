import type { JSX } from 'react';
import { Icon, type IconName } from '@/components/ui';

const STEPS: ReadonlyArray<{ icon: IconName; title: string; body: string }> = [
  {
    icon: 'spark',
    title: 'Answer a few questions',
    body: 'A short, six-step questionnaire about how you travel, power your home, eat, and shop. Takes about two minutes.',
  },
  {
    icon: 'chart',
    title: 'See where it comes from',
    body: 'Your annual footprint broken down by category and compared against benchmarks and a science-based target.',
  },
  {
    icon: 'target',
    title: 'Act on what matters',
    body: 'Personalized, ranked actions estimate the kilograms each change saves, so you start with the biggest wins.',
  },
];

/** Three-step overview with staggered fade-slide-up animations. */
export function HowItWorks(): JSX.Element {
  return (
    <section aria-labelledby="how-heading" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center animate-fade-slide-up">
        <h2 id="how-heading" className="font-display text-3xl font-bold text-ink sm:text-4xl">
          How it works
        </h2>
        <p className="mt-3 text-ink-muted">
          Three steps from a quick questionnaire to a clear action plan.
        </p>
      </div>

      <ol className="mt-14 grid gap-6 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className={[
              'group relative flex flex-col gap-4 rounded-3xl border border-border p-6 sm:p-8',
              'bg-surface-2 transition-all duration-300',
              'hover:border-primary/40 hover:shadow-glow hover:-translate-y-1',
              'animate-fade-slide-up',
              i === 0 ? 'delay-100' : i === 1 ? 'delay-200' : 'delay-300',
            ].join(' ')}
          >
            {/* Step number watermark */}
            <span
              aria-hidden="true"
              className="absolute right-6 top-4 font-display text-6xl font-bold text-primary/10 select-none"
            >
              {i + 1}
            </span>

            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-glow-sm">
                <Icon name={step.icon} size={24} />
              </span>
            </div>
            <h3 className="font-display text-xl font-semibold text-ink">{step.title}</h3>
            <p className="text-sm leading-relaxed text-ink-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
