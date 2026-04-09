/** Tests for the split signature sections used by the reconciled layout. */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  PiarSignatoriesSection,
  SpecialSignaturesSection,
  TeacherSignaturesSection,
} from '@piar-digital-app/features/piar/components/sections/planning/SignaturesSection';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

afterEach(cleanup);

describe('signature sections (FirmasV2)', () => {
  const emptyData = createEmptyPIARFormDataV2().firmas;

  it('updates a docente tuple entry from the teacher signatures section', () => {
    const onChange = vi.fn();
    render(<TeacherSignaturesSection data={emptyData} onChange={onChange} />);
    const nombreInput = screen.getByLabelText(/nombre docente/i, {
      selector: '#docente-0-nombre',
    });

    fireEvent.change(nombreInput, { target: { value: 'María López' } });

    expect(onChange).toHaveBeenCalledOnce();
    const call = onChange.mock.calls[0][0];
    expect(call.docentes).toBeDefined();
    expect(call.docentes[0].nombre).toBe('María López');
    expect(call.docentes[1]).toEqual(emptyData.docentes[1]);
    expect(call.docentes[2]).toEqual(emptyData.docentes[2]);
  });

  it('updates a PIAR signatory in the dedicated signatories section', () => {
    const onChange = vi.fn();
    render(<PiarSignatoriesSection data={emptyData} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/nombre y firma de quien diligencia el piar/i), {
      target: { value: 'Ana Torres' },
    });

    expect(onChange).toHaveBeenCalledWith({ firmantePIAR: 'Ana Torres' });
  });

  it('updates the special-role signatures independently', () => {
    const onChange = vi.fn();
    render(<SpecialSignaturesSection data={emptyData} onChange={onChange} />);
    const input = screen.getByLabelText(/nombre docente/i, {
      selector: '#docente-9-nombre',
    });

    fireEvent.change(input, { target: { value: 'Orientadora Luz' } });

    expect(onChange).toHaveBeenCalledWith({
      docenteOrientador: expect.objectContaining({ nombre: 'Orientadora Luz' }),
    });
  });
});
