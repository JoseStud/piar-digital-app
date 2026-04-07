'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cx } from '@/shared/lib/cx';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cx(
        'typ-body w-full rounded-lg border border-border-warm bg-brand-surface px-3 py-2 text-sm text-on-surface',
        'focus:border-action focus:ring-2 focus:ring-action/10 focus:outline-none',
        'placeholder:text-on-surface-variant/70',
        className,
      )}
      {...props}
    />
  );
});
