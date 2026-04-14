/** Sidebar navigation for the form: lists every section, highlights the active one (driven by `useActiveSectionObserver`), and shows fill-in progress. */
'use client';

import { ANNEX_LIST, SECTION_LIST, type PiarSectionId } from '@piar-digital-app/features/piar/model/section-list';
import { cx } from '@piar-digital-app/shared/lib/cx';
import type { SectionCompleteness } from '@piar-digital-app/features/piar/lib/forms/section-completeness';

export interface ProgressNavProps {
  activeSection: PiarSectionId | '';
  touchedSections: Set<PiarSectionId>;
  sectionCompleteness?: Map<PiarSectionId, SectionCompleteness>;
}

function getSectionAriaLabel(
  annexLabel: string,
  navLabel: string,
  isStarted: boolean,
  isComplete: boolean,
  isActive: boolean,
): string {
  const status = isActive ? 'activa' : isComplete ? 'completa' : isStarted ? 'iniciada' : 'pendiente';
  return `Sección ${annexLabel}, ${navLabel}: ${status}`;
}

function SectionDot({ active, started, complete }: { active: boolean; started: boolean; complete: boolean }) {
  if (active) {
    return <span data-status="active" className="inline-block h-2 w-2 shrink-0 rounded-full bg-action" />;
  }

  if (complete) {
    return <span data-status="complete" className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-action" />;
  }

  if (started) {
    return (
      <span data-status="started" className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-action bg-action-subtle">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-action" />
      </span>
    );
  }

  return <span data-status="pending" className="inline-block h-2 w-2 shrink-0 rounded-full bg-surface-container-high" />;
}

/** Renders the desktop and mobile progress navigation affordances. */
export function ProgressNav({
  activeSection,
  touchedSections,
  sectionCompleteness = new Map(),
}: ProgressNavProps) {
  const startedCount = SECTION_LIST.reduce((count, section) => {
    const completeness = sectionCompleteness.get(section.id);
    return count + ((touchedSections.has(section.id) || (completeness?.filled ?? 0) > 0) ? 1 : 0);
  }, 0);
  const completedCount = SECTION_LIST.reduce((count, section) => {
    const completeness = sectionCompleteness.get(section.id);
    return count + (completeness && completeness.total > 0 && completeness.filled === completeness.total ? 1 : 0);
  }, 0);

  return (
    <>
      <nav
        aria-label="Progreso del formulario en escritorio"
        className="hidden md:flex md:w-[220px] md:shrink-0 md:flex-col md:gap-1 md:self-start md:sticky md:top-8"
      >
        <span className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-action">
          Secciones
        </span>
        {ANNEX_LIST.map((annex) => (
          <div key={annex.id} className="mt-2 first:mt-0">
            <span className="mb-1 block px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
              {annex.label}
            </span>
            {SECTION_LIST.filter((section) => section.annexId === annex.id).map((section) => {
              const isActive = activeSection === section.id;
              const completeness = sectionCompleteness.get(section.id);
              const isStarted = touchedSections.has(section.id) || (completeness?.filled ?? 0) > 0;
              const isComplete = Boolean(completeness && completeness.total > 0 && completeness.filled === completeness.total);

              return (
                <a
                  key={section.id}
                  href={`#section-${section.id}`}
                  aria-label={getSectionAriaLabel(section.annexLabel, section.navLabel, isStarted, isComplete, isActive)}
                  className={cx(
                    'flex items-start gap-2.5 rounded-lg px-3 py-1.5 text-[13px] transition-colors',
                    isActive
                      ? 'bg-action-subtle font-semibold text-action'
                      : 'text-on-surface-variant hover:bg-surface-container',
                  )}
                >
                  <SectionDot active={isActive} started={isStarted} complete={isComplete} />
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span>{section.navLabel}</span>
                    {isStarted && completeness && (
                      <span className="text-[10px] font-semibold text-on-surface-variant">
                        {completeness.filled}/{completeness.total}
                      </span>
                    )}
                  </span>
                </a>
              );
            })}
          </div>
        ))}
        <div className="mt-3 rounded-lg bg-surface-container px-3 py-2 text-center">
          <span className="text-xs font-semibold text-on-surface-variant">
            {startedCount} secciones iniciadas de {SECTION_LIST.length}
          </span>
          <div className="mt-1 text-xs font-semibold text-on-surface">
            {completedCount} secciones completas de {SECTION_LIST.length}
          </div>
          <div aria-hidden="true" className="mt-1.5 grid grid-flow-col auto-cols-fr gap-1">
            {SECTION_LIST.map((section) => {
              const completeness = sectionCompleteness.get(section.id);
              const isStarted = touchedSections.has(section.id) || (completeness?.filled ?? 0) > 0;
              const isComplete = Boolean(completeness && completeness.total > 0 && completeness.filled === completeness.total);

              return (
                <span
                  key={section.id}
                  data-testid="progress-segment"
                  data-touched={isStarted}
                  data-complete={isComplete}
                  className={cx(
                    'h-1 rounded-full transition-colors duration-300',
                    isComplete ? 'bg-action' : isStarted ? 'bg-action-subtle' : 'bg-surface-container-high',
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
          const completeness = sectionCompleteness.get(section.id);
          const isStarted = touchedSections.has(section.id) || (completeness?.filled ?? 0) > 0;
          const isComplete = Boolean(completeness && completeness.total > 0 && completeness.filled === completeness.total);

          return (
            <a
              key={section.id}
              href={`#section-${section.id}`}
              aria-label={getSectionAriaLabel(section.annexLabel, section.navLabel, isStarted, isComplete, isActive)}
              className={cx(
                'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold transition-colors',
                isActive
                  ? 'bg-action text-on-primary'
                  : isStarted
                    ? 'bg-action-subtle text-action'
                    : 'bg-surface-container text-on-surface-variant',
              )}
            >
              {isStarted && !isActive && (
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
              )}
              {section.navLabel}
            </a>
          );
        })}
      </nav>
    </>
  );
}
