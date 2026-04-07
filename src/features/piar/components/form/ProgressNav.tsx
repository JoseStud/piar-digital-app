'use client';

import { SECTION_LIST } from '@/features/piar/model/section-list';
import { cx } from '@/shared/lib/cx';

export interface ProgressNavProps {
  activeSection: string;
  touchedSections: Set<string>;
}

function getSectionAriaLabel(sectionLabel: string, isTouched: boolean, isActive: boolean): string {
  const status = isActive ? 'activa' : isTouched ? 'iniciada' : 'pendiente';
  return `Sección ${sectionLabel}: ${status}`;
}

function SectionDot({ active, touched }: { active: boolean; touched: boolean }) {
  if (active) {
    return <span data-status="active" className="inline-block h-2 w-2 shrink-0 rounded-full bg-action" />;
  }

  if (touched) {
    return (
      <span data-status="touched" className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-action bg-action-subtle">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-action" />
      </span>
    );
  }

  return <span data-status="pending" className="inline-block h-2 w-2 shrink-0 rounded-full bg-surface-container-high" />;
}

export function ProgressNav({ activeSection, touchedSections }: ProgressNavProps) {
  const touchedCount = touchedSections.size;

  return (
    <>
      <nav
        aria-label="Progreso del formulario en escritorio"
        className="hidden md:flex md:w-[220px] md:shrink-0 md:flex-col md:gap-1 md:self-start md:sticky md:top-8"
      >
        <span className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-action">
          Secciones
        </span>
        {SECTION_LIST.map((section) => {
          const isActive = activeSection === section.id;
          const isTouched = touchedSections.has(section.id);

          return (
            <a
              key={section.id}
              href={`#section-${section.id}`}
              aria-label={getSectionAriaLabel(section.label, isTouched, isActive)}
              className={cx(
                'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] transition-colors',
                isActive
                  ? 'bg-action-subtle font-semibold text-action'
                  : 'text-on-surface-variant hover:bg-surface-container',
              )}
            >
              <SectionDot active={isActive} touched={isTouched} />
              {section.label}
            </a>
          );
        })}
        <div className="mt-3 rounded-lg bg-surface-container px-3 py-2 text-center">
          <span className="text-xs font-semibold text-on-surface-variant">
            {touchedCount} secciones iniciadas de {SECTION_LIST.length}
          </span>
          <div
            aria-hidden="true"
            className="mt-1.5 grid grid-cols-12 gap-1"
          >
            {SECTION_LIST.map((section) => {
              const isTouched = touchedSections.has(section.id);

              return (
                <span
                  key={section.id}
                  data-testid="progress-segment"
                  data-touched={isTouched}
                  className={cx(
                    'h-1 rounded-full transition-colors duration-300',
                    isTouched ? 'bg-action' : 'bg-surface-container-high',
                  )}
                />
              );
            })}
          </div>
        </div>
      </nav>

      <nav
        aria-label="Progreso del formulario en móvil"
        className="sticky top-0 z-10 -mx-4 flex gap-1.5 overflow-x-auto bg-surface/95 px-4 py-2 backdrop-blur-sm md:hidden"
      >
        {SECTION_LIST.map((section) => {
          const isActive = activeSection === section.id;
          const isTouched = touchedSections.has(section.id);

          return (
            <a
              key={section.id}
              href={`#section-${section.id}`}
              aria-label={getSectionAriaLabel(section.label, isTouched, isActive)}
              className={cx(
                'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold transition-colors',
                isActive
                  ? 'bg-action text-on-primary'
                  : isTouched
                    ? 'bg-action-subtle text-action'
                    : 'bg-surface-container text-on-surface-variant',
              )}
            >
              {isTouched && !isActive && (
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
              )}
              {section.label}
            </a>
          );
        })}
      </nav>
    </>
  );
}
