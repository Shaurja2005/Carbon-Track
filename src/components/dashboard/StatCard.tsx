import { type JSX, type ReactNode } from 'react';
import { Card, Icon, type IconName } from '@/components/ui';

export interface StatCardProps {
  label: string;
  value: string;
  icon?: IconName;
  children?: ReactNode;
  glow?: boolean;
}

/** Headline metric card with count-up animation and optional glow border. */
export function StatCard({ label, value, icon, children, glow }: StatCardProps): JSX.Element {
  return (
    <Card
      className={[
        'flex flex-col gap-2',
        glow ? 'ring-1 ring-primary/40 shadow-glow' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 text-primary">
        {icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
            <Icon name={icon} size={20} />
          </span>
        ) : null}
        <p className="text-sm font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      </div>
      <p className="font-display text-4xl font-bold text-ink animate-count-up">{value}</p>
      {children}
    </Card>
  );
}
