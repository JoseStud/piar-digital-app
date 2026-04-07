import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { HeaderSection } from '@/features/piar/components/sections/identity/HeaderSection';
import { createEmptyPIARFormDataV2 } from '@/features/piar/model/piar';

afterEach(cleanup);

describe('HeaderSection', () => {
  const emptyHeader = createEmptyPIARFormDataV2().header;

  it('renders all header fields', () => {
    render(<HeaderSection data={emptyHeader} onChange={() => {}} />);
    expect(screen.getByLabelText(/fecha de diligenciamiento/i)).toBeDefined();
    expect(screen.getByLabelText(/institución educativa/i)).toBeDefined();
    expect(screen.getByLabelText(/sede/i)).toBeDefined();
    expect(screen.getByLabelText(/jornada/i)).toBeDefined();
    expect(screen.getByLabelText(/lugar de diligenciamiento/i)).toBeDefined();
    expect(screen.getByLabelText(/nombre de la persona/i)).toBeDefined();
    expect(screen.getByLabelText(/rol/i)).toBeDefined();
  });

  it('calls onChange with correct patch when lugar changes', () => {
    const onChange = vi.fn();
    render(<HeaderSection data={emptyHeader} onChange={onChange} />);
    const input = screen.getByLabelText(/lugar de diligenciamiento/i);
    fireEvent.change(input, { target: { value: 'Bogotá' } });
    expect(onChange).toHaveBeenCalledWith({ lugarDiligenciamiento: 'Bogotá' });
  });

  it('calls onChange with correct patch when institution changes', () => {
    const onChange = vi.fn();
    render(<HeaderSection data={emptyHeader} onChange={onChange} />);
    const input = screen.getByLabelText(/institución educativa/i);
    fireEvent.change(input, { target: { value: 'I.E. Central' } });
    expect(onChange).toHaveBeenCalledWith({ institucionEducativa: 'I.E. Central' });
  });

  it('calls onChange with correct patch when rol changes', () => {
    const onChange = vi.fn();
    render(<HeaderSection data={emptyHeader} onChange={onChange} />);
    const input = screen.getByLabelText(/rol/i);
    fireEvent.change(input, { target: { value: 'Docente' } });
    expect(onChange).toHaveBeenCalledWith({ rolPersonaDiligencia: 'Docente' });
  });
});
