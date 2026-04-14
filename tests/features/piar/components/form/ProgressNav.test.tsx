/** Tests for the ProgressNav sidebar: active state, progress badges, section links. */
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { ProgressNav } from '@piar-digital-app/features/piar/components/form/ProgressNav';
import { SECTION_LIST, type PiarSectionId } from '@piar-digital-app/features/piar/model/section-list';

type Completeness = { filled: number; total: number };

function buildCompletenessMap(
  overrides: Partial<Record<PiarSectionId, Completeness>> = {},
): Map<PiarSectionId, Completeness> {
  return new Map(
    SECTION_LIST.map((section) => [
      section.id,
      overrides[section.id] ?? { filled: 0, total: 0 },
    ]),
  );
}

afterEach(() => {
  cleanup();
});

describe('ProgressNav', () => {
  const infoGeneralLabel = SECTION_LIST.find((section) => section.id === 'info-general')!.navLabel;
  const studentLabel = SECTION_LIST.find((section) => section.id === 'estudiante')!.navLabel;
  const saludLabel = SECTION_LIST.find((section) => section.id === 'salud')!.navLabel;

  it('renders distinct landmark labels for desktop and mobile navigation', () => {
    render(
      <ProgressNav activeSection="" touchedSections={new Set<PiarSectionId>()} sectionCompleteness={buildCompletenessMap()} />,
    );

    expect(screen.getByLabelText('Progreso del formulario en escritorio')).toBeInTheDocument();
    expect(screen.getByLabelText('Progreso del formulario en móvil')).toBeInTheDocument();
  });

  it('renders all section labels', () => {
    render(
      <ProgressNav activeSection="" touchedSections={new Set<PiarSectionId>()} sectionCompleteness={buildCompletenessMap()} />,
    );

    for (const section of SECTION_LIST) {
      const matches = screen.getAllByText(section.navLabel);
      expect(matches.length).toBeGreaterThan(0);
    }
  });

  it('highlights the active section', () => {
    render(
      <ProgressNav
        activeSection="estudiante"
        touchedSections={new Set<PiarSectionId>()}
        sectionCompleteness={buildCompletenessMap()}
      />,
    );

    const activeLinks = screen.getAllByText(studentLabel).map((el) => el.closest('a'));
    expect(activeLinks.some((link) => link?.className.includes('bg-action-subtle'))).toBe(true);
  });

  it('shows completed dot for touched sections', () => {
    const { container } = render(
      <ProgressNav
        activeSection="hogar"
        touchedSections={new Set<PiarSectionId>(['info-general', 'estudiante'])}
        sectionCompleteness={buildCompletenessMap({
          'info-general': { filled: 2, total: 7 },
          estudiante: { filled: 3, total: 28 },
        })}
      />,
    );

    const startedDots = container.querySelectorAll('[data-status="started"]');
    expect(startedDots).toHaveLength(2);
  });

  it('renders per-section completeness below touched desktop links', () => {
    render(
      <ProgressNav
        activeSection=""
        touchedSections={new Set<PiarSectionId>(['info-general', 'estudiante'])}
        sectionCompleteness={buildCompletenessMap({
          'info-general': { filled: 2, total: 7 },
          estudiante: { filled: 3, total: 28 },
        })}
      />,
    );

    const infoGeneralLink = screen.getAllByRole('link', { name: `Sección Anexo 1, ${infoGeneralLabel}: iniciada` })[0];
    const studentLink = screen.getAllByRole('link', { name: `Sección Anexo 1, ${studentLabel}: iniciada` })[0];

    expect(within(infoGeneralLink).getByText('2/7')).toBeInTheDocument();
    expect(within(studentLink).getByText('3/28')).toBeInTheDocument();
  });

  it('renders the section-based progress summary', () => {
    render(
      <ProgressNav
        activeSection=""
        touchedSections={new Set<PiarSectionId>(['info-general', 'estudiante', 'salud'])}
        sectionCompleteness={buildCompletenessMap({
          'info-general': { filled: 2, total: 7 },
          estudiante: { filled: 3, total: 28 },
          salud: { filled: 1, total: 19 },
        })}
      />,
    );

    expect(screen.getByText('3 secciones iniciadas de 14')).toBeInTheDocument();
    expect(screen.getByText('0 secciones completas de 14')).toBeInTheDocument();
  });

  it('counts completed sections in the summary when a section is fully filled', () => {
    render(
      <ProgressNav
        activeSection=""
        touchedSections={new Set<PiarSectionId>(['info-general', 'estudiante'])}
        sectionCompleteness={buildCompletenessMap({
          'info-general': { filled: 7, total: 7 },
          estudiante: { filled: 3, total: 28 },
        })}
      />,
    );

    expect(screen.getByText('2 secciones iniciadas de 14')).toBeInTheDocument();
    expect(screen.getByText('1 secciones completas de 14')).toBeInTheDocument();
  });

  it('renders a segmented progress meter from the touched section ids', () => {
    render(
      <ProgressNav
        activeSection=""
        touchedSections={new Set<PiarSectionId>(['info-general', 'salud', 'firmas-docentes'])}
        sectionCompleteness={buildCompletenessMap({
          'info-general': { filled: 2, total: 7 },
          salud: { filled: 1, total: 19 },
          'firmas-docentes': { filled: 4, total: 9 },
        })}
      />,
    );

    const segments = screen.getAllByTestId('progress-segment');
    expect(segments).toHaveLength(SECTION_LIST.length);
    expect(segments.filter((segment) => segment.getAttribute('data-touched') === 'true')).toHaveLength(3);
    expect(segments[0]).toHaveAttribute('data-touched', 'true');
    expect(segments[1]).toHaveAttribute('data-touched', 'false');
    expect(segments[11]).toHaveAttribute('data-touched', 'true');
    expect(segments[11]).toHaveAttribute('data-complete', 'false');
  });

  it('links each section to its anchor', () => {
    render(
      <ProgressNav activeSection="" touchedSections={new Set<PiarSectionId>()} sectionCompleteness={buildCompletenessMap()} />,
    );

    const link = screen.getAllByText(studentLabel)[0].closest('a');
    expect(link).toHaveAttribute('href', '#section-estudiante');
  });

  it('adds aria-labels that describe each section status', () => {
    render(
      <ProgressNav
        activeSection="estudiante"
        touchedSections={new Set<PiarSectionId>(['info-general'])}
        sectionCompleteness={buildCompletenessMap()}
      />,
    );

    expect(screen.getAllByRole('link', { name: `Sección Anexo 1, ${infoGeneralLabel}: iniciada` })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: `Sección Anexo 1, ${studentLabel}: activa` })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: `Sección Anexo 1, ${saludLabel}: pendiente` })).toHaveLength(2);
  });

  it('renders annex headings in the desktop navigation', () => {
    render(
      <ProgressNav activeSection="" touchedSections={new Set<PiarSectionId>()} sectionCompleteness={buildCompletenessMap()} />,
    );

    expect(screen.getByText('Anexo 1')).toBeInTheDocument();
    expect(screen.getByText('Anexo 2')).toBeInTheDocument();
    expect(screen.getByText('Anexo 3')).toBeInTheDocument();
  });
});
