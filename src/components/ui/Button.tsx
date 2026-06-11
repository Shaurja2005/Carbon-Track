import { type JSX, forwardRef, type ButtonHTMLAttributes } from 'react';
import Link, { type LinkProps } from 'next/link';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ' +
  'disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97]';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary shadow-sm hover:shadow-glow-sm',
  accent:
    'bg-accent text-white hover:bg-accent/90 focus-visible:ring-accent shadow-sm hover:shadow-glow-sm',
  secondary:
    'bg-surface-2 text-ink ring-1 ring-border hover:bg-surface-3 focus-visible:ring-primary shadow-sm',
  ghost: 'bg-transparent text-ink-muted hover:bg-primary/10 hover:text-ink focus-visible:ring-primary',
};

// min-h keeps every target >= 44px tall for WCAG 2.5.5 / pointer ergonomics.
const sizes: Record<Size, string> = {
  md: 'min-h-[44px] px-5 py-2.5 text-sm',
  lg: 'min-h-[52px] px-7 py-3 text-base',
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    />
  );
});

export type ButtonLinkProps = LinkProps &
  BaseProps & {
    className?: string;
    children: React.ReactNode;
  } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

/** A link styled as a button — for navigation (uses next/link). */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonLinkProps): JSX.Element {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Link>
  );
}
