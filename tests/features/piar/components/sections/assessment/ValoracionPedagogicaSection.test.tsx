/** Tests for the valoración pedagógica section: respuestas record updates, intensidad selection, observación binding. */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ValoracionPedagogicaSection } from '@piar-digital-app/features/piar/components/sections/assessment/ValoracionPedagogicaSection';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

afterEach(cleanup);

describe('ValoracionPedagogicaSection', () => {
  const emptyData = createEmptyPIARFormDataV2().valoracionPedagogica;

  it('renders all 5 aspect headers', () => {
    render(<ValoracionPedagogicaSection data={emptyData} onChange={() => {}} />);
    expect(screen.getByText('Movilidad')).toBeDefined();
    expect(screen.getByText('Comunicación')).toBeDefined();
    expect(screen.getByText('Acceso a la Información')).toBeDefined();
    expect(screen.getByText('Interacción Social')).toBeDefined();
    expect(screen.getByText('Académico – Pedagógico')).toBeDefined();
  });

  it('renders all 14 question SI/No selects (5+3+2+2+2)', () => {
    render(<ValoracionPedagogicaSection data={emptyData} onChange={() => {}} />);
    // Each question renders a select with "Sin respuesta", "Sí", "No"
    // We can count by the aria-labels from each aspecto's questions
    // The intensidad selects also appear, so we filter by those that have boolNull options
    const selects = screen.getAllByRole('combobox');
    // 14 question selects + 5 intensidad selects + (no observaciones generales select)
    // Each aspect: n questions + 1 intensidad = question selects per aspect: 5,3,2,2,2 = 14
    // Plus 5 intensidad selects = 19 total comboboxes
    expect(selects.length).toBe(19);
  });

  it('changing movilidad question mov_1 calls onChange with patched movilidad.respuestas', () => {
    const onChange = vi.fn();
    render(<ValoracionPedagogicaSection data={emptyData} onChange={onChange} />);
    const mov1Select = screen.getByLabelText(/Movilidad - ¿Requiere sistema y aditamentos de apoyo para la movilidad\?/i);
    fireEvent.change(mov1Select, { target: { value: 'true' } });
    expect(onChange).toHaveBeenCalledOnce();
    const call = onChange.mock.calls[0][0];
    expect(call.movilidad).toBeDefined();
    expect(call.movilidad.respuestas.mov_1).toBe(true);
  });

  it('changing intensidad for movilidad calls onChange with intensidad patched', () => {
    const onChange = vi.fn();
    render(<ValoracionPedagogicaSection data={emptyData} onChange={onChange} />);
    const intensidadSelect = screen.getByLabelText(/Movilidad - intensidad/i);
    fireEvent.change(intensidadSelect, { target: { value: 'extenso' } });
    expect(onChange).toHaveBeenCalledOnce();
    const call = onChange.mock.calls[0][0];
    expect(call.movilidad).toBeDefined();
    expect(call.movilidad.intensidad).toBe('extenso');
  });

  it('observaciones generales textarea calls onChange with observacionesGenerales', () => {
    const onChange = vi.fn();
    render(<ValoracionPedagogicaSection data={emptyData} onChange={onChange} />);
    const textarea = screen.getByLabelText(/Observaciones generales de valoración pedagógica/i);
    fireEvent.change(textarea, { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0]).toEqual({ observacionesGenerales: 'test' });
  });
});
