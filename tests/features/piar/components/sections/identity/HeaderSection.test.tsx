/** Tests for the HeaderSection field bindings. */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { HeaderSection } from '@piar-digital-app/features/piar/components/sections/identity/HeaderSection';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

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

  it('shows validation hints on blur after the user has interacted with a field', () => {
    render(
      <HeaderSection
        data={{
          ...emptyHeader,
          fechaDiligenciamiento: '2026-02-30',
        }}
        onChange={() => {}}
      />,
    );

    const dateInput = screen.getByLabelText(/fecha de diligenciamiento/i);
    fireEvent.blur(dateInput);
    expect(screen.getByText(/fecha debe ser válida/i)).toBeDefined();
  });

  it('does not show a hint when an untouched empty field blurs', () => {
    render(<HeaderSection data={emptyHeader} onChange={() => {}} />);

    fireEvent.blur(screen.getByLabelText(/fecha de diligenciamiento/i));
    expect(screen.queryByText(/fecha debe tener el formato AAAA-MM-DD/i)).toBeNull();
  });
});
