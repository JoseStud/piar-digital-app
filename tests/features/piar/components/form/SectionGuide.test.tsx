import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionGuide } from '@piar-digital-app/features/piar/components/form/SectionGuide';
import type { SectionGuideContent } from '@piar-digital-app/features/piar/content/guidance';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

const BASIC_GUIDE: SectionGuideContent = {
  title: 'Guía: Test Section',
  paragraphs: ['First paragraph about context.', 'Second paragraph with details.'],
};

const GUIDE_WITH_EXAMPLES: SectionGuideContent = {
  title: 'Guía: Segundo Periodo',
  paragraphs: ['Barriers must be contextual.'],
  correctExample: { label: 'CORRECTO', text: 'No hay material accesible en el aula.' },
  incorrectExample: { label: 'INCORRECTO', text: 'El estudiante tiene dislexia.' },
  reference: 'Decreto 1421, Art. 2.3.3.5.2.3.5',
};

describe('SectionGuide', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });
  afterEach(cleanup);

  it('renders collapsed by default when defaultExpanded is false', () => {
    render(<SectionGuide sectionId="test" guide={BASIC_GUIDE} defaultExpanded={false} />);
    expect(screen.getByText('Guía: Test Section')).toBeDefined();
    expect(screen.queryByText('First paragraph about context.')).toBeNull();
  });

  it('renders expanded by default when defaultExpanded is true', () => {
    render(<SectionGuide sectionId="test" guide={BASIC_GUIDE} defaultExpanded={true} />);
    expect(screen.getByText('First paragraph about context.')).toBeDefined();
    expect(screen.getByText('Second paragraph with details.')).toBeDefined();
  });

  it('toggles open/closed on click', async () => {
    const user = userEvent.setup();
    render(<SectionGuide sectionId="test" guide={BASIC_GUIDE} defaultExpanded={false} />);

    await user.click(screen.getByText('Guía: Test Section'));
    expect(screen.getByText('First paragraph about context.')).toBeDefined();

    await user.click(screen.getByText('Guía: Test Section'));
    expect(screen.queryByText('First paragraph about context.')).toBeNull();
  });

  it('persists collapse state to localStorage', async () => {
    const user = userEvent.setup();
    render(<SectionGuide sectionId="mySection" guide={BASIC_GUIDE} defaultExpanded={false} />);

    await user.click(screen.getByText('Guía: Test Section'));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('piar-guide-mySection', 'true');

    await user.click(screen.getByText('Guía: Test Section'));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('piar-guide-mySection', 'false');
  });

  it('restores state from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue('true');
    render(<SectionGuide sectionId="mySection" guide={BASIC_GUIDE} defaultExpanded={false} />);
    expect(screen.getByText('First paragraph about context.')).toBeDefined();
  });

  it('renders correct and incorrect examples when provided', () => {
    render(<SectionGuide sectionId="test" guide={GUIDE_WITH_EXAMPLES} defaultExpanded={true} />);
    expect(screen.getByText('CORRECTO')).toBeDefined();
    expect(screen.getByText('No hay material accesible en el aula.')).toBeDefined();
    expect(screen.getByText('INCORRECTO')).toBeDefined();
    expect(screen.getByText('El estudiante tiene dislexia.')).toBeDefined();
  });

  it('renders reference when provided', () => {
    render(<SectionGuide sectionId="test" guide={GUIDE_WITH_EXAMPLES} defaultExpanded={true} />);
    expect(screen.getByText(/Decreto 1421/)).toBeDefined();
  });

  it('does not render examples section when not provided', () => {
    render(<SectionGuide sectionId="test" guide={BASIC_GUIDE} defaultExpanded={true} />);
    expect(screen.queryByText('CORRECTO')).toBeNull();
    expect(screen.queryByText('INCORRECTO')).toBeNull();
  });
});
