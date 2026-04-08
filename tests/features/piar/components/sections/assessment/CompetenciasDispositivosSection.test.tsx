/** Tests for the competencias y dispositivos checklist: item toggles, group memoization. */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CompetenciasDispositivosSection } from '@piar-digital-app/features/piar/components/sections/assessment/CompetenciasDispositivosSection';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

afterEach(cleanup);

describe('CompetenciasDispositivosSection', () => {
  const emptyData = createEmptyPIARFormDataV2().competenciasDispositivos;

  it('renders all 8 group headers', () => {
    render(<CompetenciasDispositivosSection data={emptyData} onChange={() => {}} />);
    expect(screen.getByText('Competencias Lectoras y Escriturales – Grado 0 a 2')).toBeDefined();
    expect(screen.getByText('Competencias Lectoras y Escriturales – Grado 3 a 11')).toBeDefined();
    expect(screen.getByText('Competencias Lógico Matemáticas – Grado 0 a 11')).toBeDefined();
    expect(screen.getByText('Dispositivos Básicos de Aprendizaje – Memoria')).toBeDefined();
    expect(screen.getByText('Dispositivos Básicos de Aprendizaje – Atención')).toBeDefined();
    expect(screen.getByText('Dispositivos Básicos de Aprendizaje – Percepción')).toBeDefined();
    expect(screen.getByText('Dispositivos Básicos de Aprendizaje – Funciones Ejecutivas')).toBeDefined();
    expect(screen.getByText('Lenguaje y Comunicación')).toBeDefined();
  });

  it('toggling mem_1 in memoria group calls onChange with memoria patch only', () => {
    const onChange = vi.fn();
    render(<CompetenciasDispositivosSection data={emptyData} onChange={onChange} />);
    const mem1Select = screen.getByLabelText(
      /Dispositivos Básicos de Aprendizaje – Memoria - Recuerda hechos pasados/i
    );
    fireEvent.change(mem1Select, { target: { value: 'true' } });
    expect(onChange).toHaveBeenCalledOnce();
    const call = onChange.mock.calls[0][0];
    expect(call.memoria).toBeDefined();
    expect(call.memoria.mem_1).toBe(true);
    // Other groups not in the patch
    expect(call.atencion).toBeUndefined();
    expect(call.competenciasLectoras02).toBeUndefined();
  });

  it('observacionesCompetencias textarea calls onChange with correct patch', () => {
    const onChange = vi.fn();
    render(<CompetenciasDispositivosSection data={emptyData} onChange={onChange} />);
    const textarea = screen.getByLabelText(/Observaciones generales de competencias/i);
    fireEvent.change(textarea, { target: { value: 'observaciones test' } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0]).toEqual({ observacionesCompetencias: 'observaciones test' });
  });
});
