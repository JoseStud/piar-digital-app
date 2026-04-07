import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SignaturesSection } from '@piar-digital-app/features/piar/components/sections/planning/SignaturesSection';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

afterEach(cleanup);

describe('SignaturesSection (FirmasV2)', () => {
  const emptyData = createEmptyPIARFormDataV2().firmas;

  it('renders without crash with default FirmasV2 data', () => {
    render(<SignaturesSection data={emptyData} onChange={() => {}} />);
    expect(screen.getByText('Docentes grupo 1')).toBeDefined();
    expect(screen.getByText('Docentes grupo 2')).toBeDefined();
    expect(screen.getByText('Docentes grupo 3')).toBeDefined();
    expect(screen.getByText('Firmantes del PIAR')).toBeDefined();
  });

  it('changing docente 0 nombre calls onChange with correct docentes tuple', () => {
    const onChange = vi.fn();
    render(<SignaturesSection data={emptyData} onChange={onChange} />);
    const nombreInput = screen.getByLabelText(/nombre docente/i, {
      selector: '#docente-0-nombre',
    });
    fireEvent.change(nombreInput, { target: { value: 'María López' } });
    expect(onChange).toHaveBeenCalledOnce();
    const call = onChange.mock.calls[0][0];
    expect(call.docentes).toBeDefined();
    expect(call.docentes[0].nombre).toBe('María López');
    // Other docentes unchanged
    expect(call.docentes[1]).toEqual(emptyData.docentes[1]);
    expect(call.docentes[2]).toEqual(emptyData.docentes[2]);
  });

  it('changing firmantePIAR calls onChange with { firmantePIAR: value }', () => {
    const onChange = vi.fn();
    render(<SignaturesSection data={emptyData} onChange={onChange} />);
    const input = screen.getByLabelText(/nombre y firma de quien diligencia el piar/i);
    fireEvent.change(input, { target: { value: 'Ana Torres' } });
    expect(onChange).toHaveBeenCalledWith({ firmantePIAR: 'Ana Torres' });
  });
});
