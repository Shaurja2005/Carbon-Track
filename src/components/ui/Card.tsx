import { type JSX, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/**
 * Surface container — rounded, glass-effect, with dark theme support.
 * Renders a semantic element of your choice via `as`.
 */
interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'li';
}

export function Card({ as: Tag = 'div', className, children, ...rest }: CardProps): JSX.Element {
  return (
    <Tag
      className={cn(
        'rounded-3xl border border-border bg-surface-2 p-6 shadow-sm transition-colors duration-300 sm:p-8',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
