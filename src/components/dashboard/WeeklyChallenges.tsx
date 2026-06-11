'use client';

import { useEffect, useState, type JSX } from 'react';
import {
  isoWeekKey,
  selectWeeklyChallenge,
  getAllChallenges,
  type ChallengeStatus,
} from '@/lib/challenges';
import { loadChallengeEntries, saveChallengeEntry } from '@/lib/storage';
import type { ChallengeEntry, FootprintInput, FootprintResult } from '@/lib';
import { Button, Icon, Badge, type IconName } from '@/components/ui';

export interface WeeklyChallengesProps {
  input: FootprintInput;
  result: FootprintResult;
}

/** Maps challenge category to icon name. */
const CATEGORY_ICON: Record<string, IconName> = {
  transport: 'car',
  home: 'home',
  food: 'food',
  consumption: 'shopping',
  general: 'leaf',
};

/** Compute total CO₂ saved from all 'done' challenge entries. */
function totalSaved(entries: ChallengeEntry[]): number {
  return entries.filter((e) => e.status === 'done').reduce((sum, e) => sum + e.savingKg, 0);
}

/**
 * Weekly challenge card. Surfaces one challenge per week, allows the user to
 * mark it done or skip it, and displays a running total of savings plus a
 * recent history strip.
 */
export function WeeklyChallenges({ input, result }: WeeklyChallengesProps): JSX.Element {
  const weekKey = isoWeekKey();
  const challenge = selectWeeklyChallenge(weekKey, input, result);

  const [entries, setEntries] = useState<ChallengeEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(loadChallengeEntries());
    setLoaded(true);
  }, []);

  const thisWeekEntry = entries.find((e) => e.weekKey === weekKey);
  const status: ChallengeStatus = thisWeekEntry?.status ?? 'todo';
  const savedKg = totalSaved(entries);

  function handleAction(newStatus: 'done' | 'skipped'): void {
    const entry: ChallengeEntry = {
      weekKey,
      challengeId: challenge.id,
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date().toISOString() : null,
      savingKg: newStatus === 'done' ? challenge.estimatedWeeklySavingKg : 0,
    };
    const updated = saveChallengeEntry(entry);
    setEntries(updated);
  }

  const icon = CATEGORY_ICON[challenge.category] ?? 'leaf';
  const recentHistory = entries
    .filter((e) => e.status !== 'todo')
    .slice(-8)
    .reverse();

  if (!loaded) {
    return (
      <div className="h-48 animate-pulse rounded-3xl border border-border bg-primary/5" aria-hidden="true" />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Current challenge card */}
      <div
        className={[
          'relative overflow-hidden rounded-3xl border p-5 sm:p-6 transition-all duration-300',
          status === 'done'
            ? 'border-primary/40 bg-primary/8'
            : status === 'skipped'
              ? 'border-border bg-surface-2 opacity-70'
              : 'border-border bg-surface-2 hover:border-primary/30',
        ].join(' ')}
      >
        {/* Week badge */}
        <span className="absolute right-5 top-5 text-xs font-mono text-ink-subtle">
          {weekKey}
        </span>

        <div className="flex items-start gap-4">
          <span
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300',
              status === 'done' ? 'bg-primary text-white' : 'bg-primary/15 text-primary',
            ].join(' ')}
          >
            <Icon name={icon} size={22} />
          </span>

          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display font-semibold text-ink">{challenge.title}</h3>
              <Badge tone="neutral">{challenge.category}</Badge>
              {challenge.estimatedWeeklySavingKg > 0 && (
                <Badge tone="primary">
                  <Icon name="leaf" size={12} />
                  ~{challenge.estimatedWeeklySavingKg} kg saved
                </Badge>
              )}
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">{challenge.description}</p>

            {/* Action buttons */}
            {status === 'todo' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  id="challenge-done-btn"
                  size="md"
                  variant="primary"
                  onClick={() => handleAction('done')}
                >
                  <Icon name="check" size={16} />
                  {challenge.actionLabel}
                </Button>
                <Button
                  id="challenge-skip-btn"
                  size="md"
                  variant="ghost"
                  onClick={() => handleAction('skipped')}
                >
                  Skip this week
                </Button>
              </div>
            )}

            {status === 'done' && (
              <div className="mt-2 flex items-center gap-2 text-primary">
                <Icon name="trophy" size={16} />
                <span className="text-sm font-semibold">
                  Completed — {challenge.estimatedWeeklySavingKg} kg CO₂e credited
                </span>
              </div>
            )}

            {status === 'skipped' && (
              <p className="mt-2 text-sm text-ink-subtle">Skipped this week.</p>
            )}
          </div>
        </div>
      </div>

      {/* Running total */}
      {savedKg > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <Icon name="trend" size={18} className="text-primary shrink-0" />
          <p className="text-sm text-ink-muted">
            Total saved from weekly challenges:{' '}
            <span className="font-bold text-primary">{savedKg.toFixed(1)} kg CO₂e</span>
          </p>
        </div>
      )}

      {/* Recent history */}
      {recentHistory.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            Recent challenges
          </p>
          <div className="flex flex-wrap gap-2">
            {recentHistory.map((entry) => {
              const ch = getAllChallenges().find((c) => c.id === entry.challengeId);
              return (
                <div
                  key={entry.weekKey}
                  className={[
                    'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs',
                    entry.status === 'done'
                      ? 'border-primary/30 bg-primary/8 text-primary'
                      : 'border-border bg-surface text-ink-subtle',
                  ].join(' ')}
                  title={entry.weekKey}
                >
                  <Icon
                    name={entry.status === 'done' ? 'check' : 'x'}
                    size={12}
                  />
                  <span className="max-w-[120px] truncate">{ch?.title ?? entry.challengeId}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
