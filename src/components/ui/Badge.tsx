import { type JSX, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'primary' | 'accent' | 'warning' | 'neutral' | 'danger';

const tones: Record<Tone, string> = {
  primary: 'bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary-light',
  accent: 'bg-accent/15 text-accent dark:bg-accent/20',
  warning: 'bg-warning/20 text-ink dark:bg-warning/25 dark:text-warning',
  neutral: 'bg-ink/8 text-ink-muted dark:bg-ink/10',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

/** Small status/label pill. Carries its own text — never color-only. */
export function Badge({ tone = 'neutral', children, className }: BadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
