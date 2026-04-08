/** Tests for the workflow root error boundary: fallback rendering, backup-export affordance. */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@piar-digital-app/features/piar/components/feedback/ErrorBoundary';

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error');
  return <div>Child content</div>;
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Child content')).toBeDefined();
  });

  it('renders error UI when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Ocurrió un error inesperado')).toBeDefined();
    expect(screen.getByRole('button', { name: /recargar página/i })).toBeDefined();
  });

  it('error badge contains an SVG icon for accessibility (not color-only)', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    const errorBadge = screen.getByText('Error').closest('div');
    expect(errorBadge?.querySelector('svg')).not.toBeNull();
  });

  it('reload button contains an SVG icon', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    const reloadButton = screen.getByRole('button', { name: /recargar página/i });
    expect(reloadButton.querySelector('svg')).not.toBeNull();
  });

  it('calls window.location.reload when the reload button is clicked', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadMock },
    });

    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    await user.click(screen.getByRole('button', { name: /recargar página/i }));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
