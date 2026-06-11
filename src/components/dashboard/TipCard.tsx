import type { JSX } from 'react';
import { Badge, Icon } from '@/components/ui';
import { formatCo2, type Tip } from '@/lib';
import { CATEGORY_META, EFFORT_LABELS } from '@/components/labels';

const EFFORT_TONE = {
  low: 'primary',
  medium: 'warning',
  high: 'neutral',
} as const;

/** Left-border color per category, referencing CSS variables. */
const CATEGORY_BORDER: Record<string, string> = {
  transport: 'border-l-primary',
  home: 'border-l-accent',
  food: 'border-l-secondary',
  consumption: 'border-l-warning',
};

export interface TipCardProps {
  tip: Tip;
  /** 1-based rank used as a visible ordinal. */
  rank: number;
}

/** A single ranked reduction action with category color border and hover lift. */
export function TipCard({ tip, rank }: TipCardProps): JSX.Element {
  const category = CATEGORY_META[tip.category];
  return (
    <li
      className={[
        'flex gap-4 rounded-2xl border-l-4 border border-border bg-surface-2 p-5',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm',
        CATEGORY_BORDER[tip.category] ?? 'border-l-primary',
      ].join(' ')}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <Icon name={category.icon} size={20} />
      </span>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ink-subtle">#{rank}</span>
          <h3 className="font-semibold text-ink">{tip.title}</h3>
        </div>
        <p className="text-sm text-ink-muted">{tip.description}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge tone="primary">
            <Icon name="leaf" size={14} />
            Saves ~{formatCo2(tip.estimatedSavingKg)}/yr
          </Badge>
          <Badge tone={EFFORT_TONE[tip.effort]}>{EFFORT_LABELS[tip.effort]}</Badge>
          <Badge tone="neutral">{category.label}</Badge>
        </div>
      </div>
    </li>
  );
}
