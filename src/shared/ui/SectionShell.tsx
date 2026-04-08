/** Card-style wrapper used to group related fields under a section heading. */
'use client';

import { HTMLAttributes } from 'react';
import { cx } from '@piar-digital-app/shared/lib/cx';

export type SectionShellProps = HTMLAttributes<HTMLDivElement>;

/** Shared section container for grouped form content. */
export function SectionShell({ className, ...props }: SectionShellProps) {
  return (
    <section
      className={cx('rounded-xl bg-surface-container-low px-4 py-4 md:px-5', className)}
      {...props}
    />
  );
}
