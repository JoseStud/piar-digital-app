/** Tests for the ProgressNav sidebar: active state, progress badges, section links. */
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { ProgressNav } from '@piar-digital-app/features/piar/components/form/ProgressNav';
import { SECTION_LIST } from '@piar-digital-app/features/piar/model/section-list';

afterEach(() => {
  cleanup();
});

describe('ProgressNav', () => {
  it('renders distinct landmark labels for desktop and mobile navigation', () => {
    render(
      <ProgressNav activeSection="" touchedSections={new Set()} />,
    );

    expect(screen.getByLabelText('Progreso del formulario en escritorio')).toBeInTheDocument();
    expect(screen.getByLabelText('Progreso del formulario en móvil')).toBeInTheDocument();
  });

  it('renders all section labels', () => {
    render(
      <ProgressNav activeSection="" touchedSections={new Set()} />,
    );

    for (const section of SECTION_LIST) {
      const matches = screen.getAllByText(section.label);
      expect(matches.length).toBeGreaterThan(0);
    }
  });

  it('highlights the active section', () => {
    render(
      <ProgressNav activeSection="estudiante" touchedSections={new Set()} />,
    );

    const activeLinks = screen.getAllByText('Estudiante').map((el) => el.closest('a'));
    expect(activeLinks.some((link) => link?.className.includes('bg-action-subtle'))).toBe(true);
  });

  it('shows completed dot for touched sections', () => {
    const { container } = render(
      <ProgressNav
        activeSection="hogar"
        touchedSections={new Set(['info-general', 'estudiante'])}
      />,
    );

    const completedDots = container.querySelectorAll('[data-status="touched"]');
    expect(completedDots).toHaveLength(2);
  });

  it('renders progress counter', () => {
    render(
      <ProgressNav activeSection="" touchedSections={new Set(['info-general', 'estudiante', 'salud'])} />,
    );

    expect(screen.getByText('3 secciones iniciadas de 12')).toBeInTheDocument();
  });

  it('renders a segmented progress meter from the touched section ids', () => {
    render(
      <ProgressNav
        activeSection=""
        touchedSections={new Set(['info-general', 'salud', 'firmas'])}
      />,
    );

    const segments = screen.getAllByTestId('progress-segment');
    expect(segments).toHaveLength(SECTION_LIST.length);
    expect(segments.filter((segment) => segment.getAttribute('data-touched') === 'true')).toHaveLength(3);
    expect(segments[0]).toHaveAttribute('data-touched', 'true');
    expect(segments[1]).toHaveAttribute('data-touched', 'false');
    expect(segments[10]).toHaveAttribute('data-touched', 'true');
  });

  it('links each section to its anchor', () => {
    render(
      <ProgressNav activeSection="" touchedSections={new Set()} />,
    );

    const link = screen.getAllByText('Estudiante')[0].closest('a');
    expect(link).toHaveAttribute('href', '#section-estudiante');
  });

  it('adds aria-labels that describe each section status', () => {
    render(
      <ProgressNav
        activeSection="estudiante"
        touchedSections={new Set(['info-general'])}
      />,
    );

    expect(screen.getAllByRole('link', { name: 'Sección Info General: iniciada' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Sección Estudiante: activa' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Sección Entorno Salud: pendiente' })).toHaveLength(2);
  });
});
