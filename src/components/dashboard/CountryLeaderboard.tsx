'use client';

import type { JSX } from 'react';
import { getLeaderboardData, getLeaderboardMax } from '@/lib/country-data';
import { Icon } from '@/components/ui';
import { TARGET_TONNES } from '@/lib';

export interface CountryLeaderboardProps {
  /** User's annual footprint in tonnes CO₂e. */
  userTonnes: number;
}

/** Color stops for the bar gradient based on relative emissions. */
function barColor(ratio: number): string {
  if (ratio <= 0.35) return 'var(--color-primary)';
  if (ratio <= 0.6) return 'var(--color-accent)';
  if (ratio <= 0.85) return 'var(--color-warning)';
  return '#ef4444';
}

/**
 * CSS-only animated horizontal bar chart comparing the user's footprint
 * against 26 countries. No additional charting library required.
 */
export function CountryLeaderboard({ userTonnes }: CountryLeaderboardProps): JSX.Element {
  const data = getLeaderboardData();
  const maxVal = getLeaderboardMax();
  const scaleMax = Math.ceil(maxVal / 5) * 5; // round up to nearest 5

  // Insert the user's position in the sorted list
  const userEntry = { code: 'YOU', name: 'You', tonnesPerCapita: userTonnes };
  const allEntries = [...data, userEntry].sort((a, b) => b.tonnesPerCapita - a.tonnesPerCapita);

  return (
    <div className="flex flex-col gap-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
          Low ({'\u2264'}35% of max)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-accent" />
          Medium
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-warning" />
          High
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" />
          Very high ({'>'}85%)
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-primary/40" />
          You
        </span>
      </div>

      {/* Target line reference */}
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-primary/5 px-4 py-2 text-xs">
        <Icon name="flag" size={13} className="text-primary shrink-0" />
        <span className="text-ink-muted">
          1.5°C target: <span className="font-semibold text-primary">{TARGET_TONNES} t CO₂e/yr</span>{' '}
          — the bar chart is scaled to the dataset maximum ({scaleMax} t).
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex flex-col gap-1.5">
        {allEntries.map((entry, idx) => {
          const isUser = entry.code === 'YOU';
          const pct = (entry.tonnesPerCapita / scaleMax) * 100;
          const ratio = entry.tonnesPerCapita / scaleMax;
          const color = isUser ? 'var(--color-primary)' : barColor(ratio);
          const delay = Math.min(idx * 18, 600);

          return (
            <div
              key={entry.code}
              className={[
                'group flex items-center gap-3 rounded-xl px-3 py-1.5 transition-colors duration-150',
                isUser
                  ? 'border border-primary/40 bg-primary/8 ring-1 ring-primary/20'
                  : 'hover:bg-surface-3',
              ].join(' ')}
            >
              {/* Country label */}
              <span
                className={[
                  'w-36 shrink-0 truncate text-xs font-medium',
                  isUser ? 'text-primary font-bold' : 'text-ink-muted',
                ].join(' ')}
                title={entry.name}
              >
                {isUser ? (
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
                    You
                  </span>
                ) : (
                  entry.name
                )}
              </span>

              {/* Bar */}
              <div className="flex flex-1 items-center gap-2">
                <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-ink/8">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: color,
                      opacity: isUser ? 1 : 0.8,
                      animationDelay: `${delay}ms`,
                      boxShadow: isUser ? `0 0 6px 1px var(--glow-primary)` : undefined,
                    }}
                  />
                  {/* 1.5°C target marker */}
                  <div
                    className="absolute top-0 h-full w-px bg-primary/60"
                    style={{ left: `${(TARGET_TONNES / scaleMax) * 100}%` }}
                    title={`1.5°C target: ${TARGET_TONNES} t`}
                  />
                </div>
                <span
                  className={[
                    'w-12 shrink-0 text-right text-xs tabular-nums',
                    isUser ? 'font-bold text-primary' : 'text-ink-muted',
                  ].join(' ')}
                >
                  {entry.tonnesPerCapita.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-ink-subtle mt-2">
        Sources: Our World in Data, IEA, Global Carbon Project (2023). Figures are per-capita
        annual CO₂e in tonnes.
      </p>
    </div>
  );
}
