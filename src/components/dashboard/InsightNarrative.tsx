import type { JSX } from 'react';
import type { Narrative } from '@/lib/narratives';
import { Icon } from '@/components/ui';

export interface InsightNarrativeProps {
  narrative: Narrative;
}

/**
 * Renders the generated footprint narrative as a prose card with four sections:
 * headline, breakdown, top action, and regional context.
 */
export function InsightNarrative({ narrative }: InsightNarrativeProps): JSX.Element {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-3xl border border-border p-6 sm:p-8',
        'bg-surface-2 animate-fade-slide-up',
      ].join(' ')}
    >
      {/* Subtle glow overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-40 rounded-3xl"
      />

      <div className="relative flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Icon name="spark" size={18} />
          </span>
          <h3 className="font-display text-lg font-semibold text-ink">Your Footprint Story</h3>
        </div>

        {/* Headline */}
        <p className="font-display text-xl font-bold text-ink leading-snug">
          {narrative.headline}
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Breakdown */}
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Where it comes from
            </p>
            <p className="text-sm leading-relaxed text-ink-muted">{narrative.breakdown}</p>
          </div>

          {/* Top action */}
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              Highest-impact change
            </p>
            <p className="text-sm leading-relaxed text-ink-muted">{narrative.topAction}</p>
          </div>

          {/* Context */}
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Regional context
            </p>
            <p className="text-sm leading-relaxed text-ink-muted">{narrative.context}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
