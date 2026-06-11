'use client';

import type { JSX } from 'react';
import type { PledgeProgress } from '@/lib/pledge';
import { formatTonnes } from '@/lib';
import { Icon } from '@/components/ui';

export interface PledgeTimelineProps {
  progress: PledgeProgress;
}

/** Format an ISO date string for display (e.g. "12 Jun 2025"). */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Vertical milestone timeline showing 25%, 50%, 75%, and 100% reduction
 * checkpoints. Achieved milestones display the date and measured value;
 * unachieved milestones show the threshold to hit.
 */
export function PledgeTimeline({ progress }: PledgeTimelineProps): JSX.Element {
  const { milestones, overallPercent, baselineTonnes, targetTonnes, currentTonnes } = progress;
  const reductionNeeded = Math.max(0, baselineTonnes - targetTonnes);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Baseline', value: formatTonnes(baselineTonnes) },
          { label: 'Current', value: formatTonnes(currentTonnes), highlight: true },
          { label: 'Pledge target', value: formatTonnes(targetTonnes) },
        ].map((stat) => (
          <div
            key={stat.label}
            className={[
              'rounded-2xl p-3 border border-border',
              stat.highlight ? 'bg-primary/10 border-primary/30' : 'bg-surface',
            ].join(' ')}
          >
            <p className="text-xs uppercase tracking-wide text-ink-muted">{stat.label}</p>
            <p
              className={[
                'font-display text-lg font-bold mt-0.5',
                stat.highlight ? 'text-primary' : 'text-ink',
              ].join(' ')}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-ink-muted">
          <span>Overall progress</span>
          <span className="font-semibold text-primary">{overallPercent.toFixed(0)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-primary shadow-glow-sm transition-[width] duration-700 ease-out"
            style={{ width: `${Math.min(overallPercent, 100)}%` }}
          />
        </div>
        <p className="text-xs text-ink-subtle">
          {reductionNeeded.toFixed(2)} t total reduction required
        </p>
      </div>

      {/* Milestone timeline */}
      <div className="relative">
        {/* Vertical connecting line */}
        <div className="absolute left-4 top-4 bottom-4 w-px bg-border" aria-hidden="true" />

        <ol className="flex flex-col gap-5">
          {milestones.map((milestone) => {
            const achieved = milestone.achievedAt !== null;
            return (
              <li key={milestone.fraction} className="flex items-start gap-4">
                {/* Node */}
                <span
                  className={[
                    'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
                    achieved
                      ? 'bg-primary border-primary shadow-glow-sm'
                      : 'bg-surface-2 border-border',
                  ].join(' ')}
                >
                  {achieved ? (
                    <Icon name="check" size={14} className="text-white" />
                  ) : (
                    <span className="text-xs font-bold text-ink-muted">
                      {Math.round(milestone.fraction * 100)}
                    </span>
                  )}
                </span>

                {/* Content */}
                <div className="flex flex-col gap-0.5 pt-0.5">
                  <p
                    className={[
                      'text-sm font-semibold',
                      achieved ? 'text-primary' : 'text-ink-muted',
                    ].join(' ')}
                  >
                    {milestone.label}
                  </p>
                  <p className="text-xs text-ink-subtle">
                    Target: {formatTonnes(milestone.thresholdTonnes)}
                  </p>
                  {achieved && milestone.achievedAt ? (
                    <p className="text-xs text-primary font-medium">
                      Achieved {formatDate(milestone.achievedAt)}
                      {milestone.achievedKg !== null
                        ? ` · ${(milestone.achievedKg / 1000).toFixed(2)} t recorded`
                        : ''}
                    </p>
                  ) : (
                    <p className="text-xs text-ink-subtle">
                      {formatTonnes(Math.max(0, currentTonnes - milestone.thresholdTonnes))} still
                      to cut
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
