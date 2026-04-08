/** Tests for the section header layout component. */
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach } from 'vitest';
import { SectionHeader } from '@piar-digital-app/features/piar/components/form/SectionHeader';

afterEach(() => {
  cleanup();
});

describe('SectionHeader', () => {
  it('renders with an id on the outer section element', () => {
    const { container } = render(
      <SectionHeader title="Test Section" sectionId="test-section">
        <p>Content</p>
      </SectionHeader>,
    );
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('id', 'section-test-section');
  });

  it('renders status dot for active status', () => {
    render(
      <SectionHeader title="Test" sectionId="test" status="active">
        <p>Content</p>
      </SectionHeader>,
    );
    const dot = document.querySelector('[data-testid="status-dot"]');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass('bg-action');
  });

  it('renders status badge when status is active', () => {
    render(
      <SectionHeader title="Test" sectionId="test" status="active">
        <p>Content</p>
      </SectionHeader>,
    );
    expect(screen.getByText('En progreso')).toBeInTheDocument();
  });

  it('renders status badge when status is pending', () => {
    render(
      <SectionHeader title="Test" sectionId="test" status="pending">
        <p>Content</p>
      </SectionHeader>,
    );
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('toggles content visibility on click', async () => {
    const user = userEvent.setup();
    render(
      <SectionHeader title="Test" sectionId="test">
        <p>Inner content</p>
      </SectionHeader>,
    );

    expect(screen.getByText('Inner content')).toBeVisible();

    const button = screen.getByRole('button', { name: /test/i });
    const wrapper = screen.getByTestId('section-content');
    expect(button).toHaveAttribute('aria-controls', 'section-panel-test');
    expect(wrapper).toHaveAttribute('id', 'section-panel-test');
    expect(wrapper).toHaveAttribute('data-state', 'open');

    await user.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(wrapper).toHaveAttribute('data-state', 'closed');
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });

  it('announces expand and collapse state changes in a live region', async () => {
    const user = userEvent.setup();
    render(
      <SectionHeader title="Test Section" sectionId="test-section">
        <p>Content</p>
      </SectionHeader>,
    );

    const button = screen.getByRole('button', { name: /test section/i });
    expect(screen.getByText('Test Section expandida')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-describedby', 'section-status-test-section');

    await user.click(button);

    expect(screen.getByText('Test Section colapsada')).toBeInTheDocument();
  });

  it('skips focusable content when the section is collapsed', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <SectionHeader title="Collapsed Section" sectionId="collapsed" defaultOpen={false}>
          <button type="button">Inside</button>
        </SectionHeader>
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: /collapsed section/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });
});
