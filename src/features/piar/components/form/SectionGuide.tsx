'use client';

import { useState } from 'react';
import type { SectionGuideContent } from '@/features/piar/content/guidance';
import { safeLocalStorageGet, safeLocalStorageSet } from '@/shared/lib/storage-safe';
import { cx } from '@/shared/lib/cx';

interface SectionGuideProps {
  sectionId: string;
  guide: SectionGuideContent;
  defaultExpanded: boolean;
}

function readStoredState(sectionId: string): boolean | null {
  const val = safeLocalStorageGet(`piar-guide-${sectionId}`);
  if (val === 'true') return true;
  if (val === 'false') return false;
  return null;
}

function storeState(sectionId: string, expanded: boolean): void {
  safeLocalStorageSet(`piar-guide-${sectionId}`, String(expanded));
}

export function SectionGuide({ sectionId, guide, defaultExpanded }: SectionGuideProps) {
  const [expanded, setExpanded] = useState(() => {
    const stored = readStoredState(sectionId);
    return stored ?? defaultExpanded;
  });

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    storeState(sectionId, next);
  };

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        className={cx(
          'flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm transition-colors',
          'border border-primary/15 bg-primary-fixed/30 text-primary hover:bg-primary-fixed/50',
        )}
      >
        <span className="font-semibold">{guide.title}</span>
        <span className="text-xs text-primary/60" aria-hidden="true">
          {expanded ? '▲ Ocultar' : '▼ Expandir'}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 rounded-lg bg-surface-container-lowest px-4 py-3 text-sm leading-relaxed text-on-surface-variant">
          {guide.paragraphs.map((p, i) => (
            <p key={i} className={i > 0 ? 'mt-2' : undefined}>{p}</p>
          ))}

          {(guide.correctExample || guide.incorrectExample) && (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {guide.correctExample && (
                <div className="rounded-md bg-primary-fixed/20 px-3 py-2">
                  <span className="text-xs font-bold text-primary">{guide.correctExample.label}</span>
                  <p className="mt-1 text-xs text-on-surface">{guide.correctExample.text}</p>
                </div>
              )}
              {guide.incorrectExample && (
                <div className="rounded-md bg-error-container px-3 py-2">
                  <span className="text-xs font-bold text-on-error-container">{guide.incorrectExample.label}</span>
                  <p className="mt-1 text-xs text-on-surface">{guide.incorrectExample.text}</p>
                </div>
              )}
            </div>
          )}

          {guide.reference && (
            <p className="mt-2 text-xs text-on-surface-variant/70">
              <strong>Referencia:</strong> {guide.reference}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
