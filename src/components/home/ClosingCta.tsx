import type { JSX } from 'react';
import { ButtonLink, Icon } from '@/components/ui';

/** Closing call-to-action with gradient mesh background. */
export function ClosingCta(): JSX.Element {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <div
        className={[
          'relative overflow-hidden rounded-4xl p-8 text-center sm:p-14',
          'bg-gradient-primary text-white shadow-glow',
          'ring-1 ring-white/15',
        ].join(' ')}
      >
        {/* Background texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-30"
        />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
            <Icon name="leaf" size={13} />
            Free &middot; Private &middot; No sign-up
          </span>

          <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
            Ready to see your number?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85 text-base leading-relaxed">
            It takes about two minutes. Your answers stay on your device, and you can refine them any
            time.
          </p>

          <div className="mt-8 flex justify-center">
            <ButtonLink href="/calculator" size="lg" variant="secondary">
              Start the calculator
              <Icon name="arrow-right" size={20} />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
