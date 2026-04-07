import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { StudentSection } from '@/features/piar/components/sections/identity/StudentSection';
import { createEmptyPIARFormDataV2 } from '@/features/piar/model/piar';

afterEach(cleanup);

describe('StudentSection', () => {
  const emptyStudent = createEmptyPIARFormDataV2().student;

  it('renders nombres and apellidos fields', () => {
    render(<StudentSection data={emptyStudent} onChange={() => {}} />);
    expect(screen.getByLabelText(/nombres/i)).toBeDefined();
    expect(screen.getByLabelText(/apellidos/i)).toBeDefined();
  });

  it('calls onChange with patch when nombres changes', () => {
    const onChange = vi.fn();
    render(<StudentSection data={emptyStudent} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/nombres/i), { target: { value: 'Laura' } });
    expect(onChange).toHaveBeenCalledWith({ nombres: 'Laura' });
  });

  it('binds the grado al que aspira ingresar field', () => {
    const onChange = vi.fn();
    render(<StudentSection data={emptyStudent} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/grado al que aspira ingresar/i), { target: { value: '6°' } });
    expect(onChange).toHaveBeenCalledWith({ gradoAspiraIngresar: '6°' });
  });

  it('calls onChange with null when boolean select is cleared', () => {
    const onChange = vi.fn();
    render(<StudentSection data={emptyStudent} onChange={onChange} />);
    const select = screen.getByLabelText(/víctima del conflicto/i);
    fireEvent.change(select, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith({ victimaConflicto: null });
  });

  it('calls onChange with true when SI is selected', () => {
    const onChange = vi.fn();
    render(<StudentSection data={emptyStudent} onChange={onChange} />);
    const select = screen.getByLabelText(/víctima del conflicto/i);
    fireEvent.change(select, { target: { value: 'true' } });
    expect(onChange).toHaveBeenCalledWith({ victimaConflicto: true });
  });

  it('shows and binds context detail fields when their yes/no field is true', () => {
    const onChange = vi.fn();
    const data = {
      ...emptyStudent,
      victimaConflicto: true,
      centroProteccion: true,
      grupoEtnico: true,
    } as const;
    render(<StudentSection data={data} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/registro o detalle de víctima/i), { target: { value: 'RUV 123' } });
    fireEvent.change(screen.getByLabelText(/^centro de protección$/i), { target: { value: 'Centro Norte' } });
    fireEvent.change(screen.getByLabelText(/cuál grupo étnico/i), { target: { value: 'Wayuu' } });

    expect(onChange).toHaveBeenCalledWith({ victimaConflictoRegistro: 'RUV 123' });
    expect(onChange).toHaveBeenCalledWith({ centroProteccionLugar: 'Centro Norte' });
    expect(onChange).toHaveBeenCalledWith({ grupoEtnicoCual: 'Wayuu' });
  });
});
