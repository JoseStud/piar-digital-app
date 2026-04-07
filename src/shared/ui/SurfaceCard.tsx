'use client';

import { HTMLAttributes } from 'react';
import { cx } from '@piar-digital-app/shared/lib/cx';

export interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'default' | 'low' | 'lowest' | 'high';
}

const toneClasses: Record<NonNullable<SurfaceCardProps['tone']>, string> = {
  default: 'bg-surface-container',
  low: 'bg-surface-container-low',
  lowest: 'bg-surface-container-lowest',
  high: 'bg-surface-container-high',
};

export function SurfaceCard({ tone = 'default', className, ...props }: SurfaceCardProps) {
  return (
    <div
      className={cx('rounded-lg p-4 shadow-soft', toneClasses[tone], className)}
      {...props}
    />
  );
}
