/** Small live region for inline field validation and guidance. */
'use client';

import { cx } from '@piar-digital-app/shared/lib/cx';

export interface FieldHintProps {
  message: string | null;
}

/** Renders a compact accessible hint below a form field. */
export function FieldHint({ message }: FieldHintProps) {
  if (!message) {
    return null;
  }

  const isNeutralHint = /^(sugerencia|nota|consejo)\s*:/i.test(message.trim());

  return (
    <p
      role="status"
      className={cx(
        'mt-1 text-xs',
        isNeutralHint ? 'text-on-surface-variant' : 'text-error',
      )}
    >
      {message}
    </p>
  );
}
