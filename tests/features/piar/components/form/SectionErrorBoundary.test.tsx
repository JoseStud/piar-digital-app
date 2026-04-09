/** Tests for the per-section error boundary: fallback rendering and retry behavior. */
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionErrorBoundary } from '@piar-digital-app/features/piar/components/form/SectionErrorBoundary';

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }

  return <div>Child content</div>;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SectionErrorBoundary', () => {
  it('renders the fallback UI when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <SectionErrorBoundary sectionTitle="Datos del Estudiante">
        <ThrowingChild shouldThrow={true} />
      </SectionErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Error en la sección: Datos del Estudiante')).toBeInTheDocument();
    expect(screen.getByText(/las demás secciones siguen disponibles/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('keeps sibling sections visible when one section crashes', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <>
        <SectionErrorBoundary sectionTitle="Sección rota">
          <ThrowingChild shouldThrow={true} />
        </SectionErrorBoundary>
        <SectionErrorBoundary sectionTitle="Sección sana">
          <ThrowingChild shouldThrow={false} />
        </SectionErrorBoundary>
      </>,
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
    expect(screen.getByText('Error en la sección: Sección rota')).toBeInTheDocument();
  });

  it('retries rendering after the section stops throwing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    const { rerender } = render(
      <SectionErrorBoundary sectionTitle="Datos del Estudiante">
        <ThrowingChild shouldThrow={true} />
      </SectionErrorBoundary>,
    );

    expect(screen.getByText('Error en la sección: Datos del Estudiante')).toBeInTheDocument();

    rerender(
      <SectionErrorBoundary sectionTitle="Datos del Estudiante">
        <ThrowingChild shouldThrow={false} />
      </SectionErrorBoundary>,
    );

    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(screen.getByText('Child content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
