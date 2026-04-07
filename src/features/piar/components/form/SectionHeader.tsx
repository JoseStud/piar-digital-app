'use client';

import { ReactNode, useId, useState } from 'react';
import { SectionShell } from '@/shared/ui/SectionShell';
import { cx } from '@/shared/lib/cx';

export type SectionStatus = 'active' | 'touched' | 'pending';

interface SectionHeaderProps {
  title: string;
  children: ReactNode;
  sectionId?: string;
  status?: SectionStatus;
  defaultOpen?: boolean;
}

function StatusDot({ status }: { status?: SectionStatus }) {
  if (!status) return null;
  return (
    <span
      data-testid="status-dot"
      className={cx(
        'inline-block h-2 w-2 shrink-0 rounded-full',
        status === 'active' && 'bg-action',
        status === 'touched' && 'border-[1.5px] border-action bg-action-subtle',
        status === 'pending' && 'bg-surface-container-high',
      )}
    />
  );
}

function StatusBadge({ status }: { status?: SectionStatus }) {
  if (!status) return null;
  if (status === 'active' || status === 'touched') {
    return (
      <span className="rounded-full bg-action-subtle px-2 py-0.5 text-[10px] font-semibold text-action">
        En progreso
      </span>
    );
  }
  return (
    <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-semibold text-on-surface-variant">
      Pendiente
    </span>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={cx(
        'h-4 w-4 text-on-surface-variant motion-safe:transition-transform motion-safe:duration-200 motion-reduce:transition-none',
        isOpen && 'rotate-180',
      )}
    >
      <path
        d="M5 7.5 10 12.5 15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SectionHeader({
  title,
  children,
  sectionId,
  status,
  defaultOpen = true,
}: SectionHeaderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const generatedPanelId = useId().replace(/:/g, '');
  const panelId = sectionId ? `section-panel-${sectionId}` : `section-panel-${generatedPanelId}`;
  const liveRegionId = sectionId ? `section-status-${sectionId}` : `section-status-${generatedPanelId}`;
  const liveMessage = `${title} ${isOpen ? 'expandida' : 'colapsada'}`;

  return (
    <SectionShell
      id={sectionId ? `section-${sectionId}` : undefined}
      className="mb-8 bg-surface-container-lowest p-0 md:mb-12"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-describedby={liveRegionId}
        className={cx(
          'flex w-full items-center justify-between rounded-lg bg-surface-container px-4 py-3',
          'text-left transition-colors hover:bg-surface-container-high',
        )}
      >
        <div className="flex items-center gap-2.5">
          <StatusDot status={status} />
          <h2 className="typ-title text-lg text-on-surface">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <ChevronIcon isOpen={isOpen} />
        </div>
      </button>
      <span id={liveRegionId} className="sr-only" aria-live="polite">
        {liveMessage}
      </span>
      <div
        id={panelId}
        data-testid="section-content"
        data-state={isOpen ? 'open' : 'closed'}
        aria-hidden={!isOpen}
        className={cx(
          'grid ease-in-out motion-safe:transition-[grid-template-rows] motion-safe:duration-200 motion-reduce:transition-none',
          isOpen ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden px-1 pt-4">
          {isOpen ? children : null}
        </div>
      </div>
    </SectionShell>
  );
}
