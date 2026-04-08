/** Themed textarea with auto-grow, label, helper text, and error state. */
'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cx } from '@piar-digital-app/shared/lib/cx';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'inline';
}

const baseClasses = {
  default: [
    'typ-body w-full rounded-lg border border-border-warm bg-brand-surface px-3 py-2 text-sm text-on-surface',
    'focus:border-action focus:ring-2 focus:ring-action/10 focus:outline-none',
    'placeholder:text-on-surface-variant/70',
  ],
  inline: [
    'typ-body w-full text-sm text-on-surface bg-transparent border-none p-0',
    'focus-visible:outline-none focus:text-primary',
    'placeholder:text-on-surface-variant/70',
  ],
};

/** Shared multi-line text input primitive. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, variant = 'default', ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cx(
        ...baseClasses[variant],
        className,
      )}
      {...props}
    />
  );
});
