/** Tests for the 5-row ajustes razonables fixed-tuple update pattern. */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AjustesRazonablesSection } from '@piar-digital-app/features/piar/components/sections/planning/AjustesRazonablesSection';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

afterEach(cleanup);

describe('AjustesRazonablesSection', () => {
  const emptyData = createEmptyPIARFormDataV2().ajustes;

  it('renders 5 numbered rows', () => {
    render(<AjustesRazonablesSection data={emptyData} onChange={() => {}} />);
    expect(screen.getByText('Ajuste razonable 1')).toBeDefined();
    expect(screen.getByText('Ajuste razonable 2')).toBeDefined();
    expect(screen.getByText('Ajuste razonable 3')).toBeDefined();
    expect(screen.getByText('Ajuste razonable 4')).toBeDefined();
    expect(screen.getByText('Ajuste razonable 5')).toBeDefined();
  });

  it('changing area of row 0 calls onChange with correct tuple', () => {
    const onChange = vi.fn();
    render(<AjustesRazonablesSection data={emptyData} onChange={onChange} />);
    const areaInput = screen.getByLabelText(/área \/ asignatura/i, { selector: '#ajuste-0-area' });
    fireEvent.change(areaInput, { target: { value: 'Matemáticas' } });
    expect(onChange).toHaveBeenCalledOnce();
    const next = onChange.mock.calls[0][0];
    expect(next[0].area).toBe('Matemáticas');
    // Other rows unchanged
    expect(next[1]).toEqual(emptyData[1]);
    expect(next[2]).toEqual(emptyData[2]);
    expect(next[3]).toEqual(emptyData[3]);
    expect(next[4]).toEqual(emptyData[4]);
  });

  it('changing descripcion of row 2 calls onChange with correct tuple', () => {
    const onChange = vi.fn();
    render(<AjustesRazonablesSection data={emptyData} onChange={onChange} />);
    const descripcionInput = screen.getByLabelText(/descripción del ajuste/i, {
      selector: '#ajuste-2-descripcion',
    });
    fireEvent.change(descripcionInput, { target: { value: 'Tiempo extra en evaluaciones' } });
    expect(onChange).toHaveBeenCalledOnce();
    const next = onChange.mock.calls[0][0];
    expect(next[2].descripcion).toBe('Tiempo extra en evaluaciones');
    expect(next[0]).toEqual(emptyData[0]);
    expect(next[1]).toEqual(emptyData[1]);
    expect(next[3]).toEqual(emptyData[3]);
    expect(next[4]).toEqual(emptyData[4]);
  });

  it('barreras textarea of row 0 calls onChange with correct patch', () => {
    const onChange = vi.fn();
    render(<AjustesRazonablesSection data={emptyData} onChange={onChange} />);
    const barrerasInput = screen.getByLabelText(/barreras identificadas/i, {
      selector: '#ajuste-0-barreras',
    });
    fireEvent.change(barrerasInput, { target: { value: 'Ruido en el aula' } });
    expect(onChange).toHaveBeenCalledOnce();
    const next = onChange.mock.calls[0][0];
    expect(next[0].barreras).toBe('Ruido en el aula');
    expect(next[0].area).toBe('');
    expect(next[1]).toEqual(emptyData[1]);
  });
});
