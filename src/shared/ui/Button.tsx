/** Themed button with size, variant, fullWidth, and loading props. Used everywhere in place of bare `<button>`. */
'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cx } from '@piar-digital-app/shared/lib/cx';

type ButtonVariant = 'primary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-action text-on-primary shadow-soft disabled:bg-surface-container-high disabled:text-on-surface-variant',
  ghost:
    'bg-surface-container-low border border-border-warm text-on-surface hover:bg-surface-container',
  danger:
    'bg-error-container text-on-error-container hover:opacity-90 disabled:opacity-60',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

/** Shared button primitive for the PIAR UI. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'typ-label inline-flex items-center justify-center gap-2 rounded-full transition-colors motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:scale-[1.02] motion-safe:active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100',
        'focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary/40 focus-visible:outline-offset-1',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  );
});
