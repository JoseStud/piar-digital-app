import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EntornoSaludSection } from '@piar-digital-app/features/piar/components/sections/environments/EntornoSaludSection';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

afterEach(cleanup);

describe('EntornoSaludSection', () => {
  const emptyData = createEmptyPIARFormDataV2().entornoSalud;

  it('renders without crash with empty default data', () => {
    render(<EntornoSaludSection data={emptyData} onChange={() => {}} />);
    expect(screen.getByLabelText(/afiliación al sistema de salud/i)).toBeDefined();
  });

  it('calls onChange with { afiliacionSalud: true } when Sí is selected', () => {
    const onChange = vi.fn();
    render(<EntornoSaludSection data={emptyData} onChange={onChange} />);
    const select = screen.getByLabelText(/afiliación al sistema de salud/i);
    fireEvent.change(select, { target: { value: 'true' } });
    expect(onChange).toHaveBeenCalledWith({ afiliacionSalud: true });
  });

  it('regimen field is hidden when afiliacionSalud is null', () => {
    render(<EntornoSaludSection data={emptyData} onChange={() => {}} />);
    expect(screen.queryByLabelText(/régimen/i)).toBeNull();
  });

  it('regimen field is visible when afiliacionSalud is true', () => {
    const data = { ...emptyData, afiliacionSalud: true as const };
    render(<EntornoSaludSection data={data} onChange={() => {}} />);
    expect(screen.getByLabelText(/régimen/i)).toBeDefined();
  });

  it('binds the EPS field when affiliation details are visible', () => {
    const onChange = vi.fn();
    const data = { ...emptyData, afiliacionSalud: true as const };
    render(<EntornoSaludSection data={data} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/^eps$/i), { target: { value: 'Sura' } });
    expect(onChange).toHaveBeenCalledWith({ eps: 'Sura' });
  });

  it('diagnosticoCual is hidden when diagnosticoMedico is null', () => {
    render(<EntornoSaludSection data={emptyData} onChange={() => {}} />);
    expect(screen.queryByLabelText(/cuál diagnóstico/i)).toBeNull();
  });

  it('diagnosticoCual is visible when diagnosticoMedico is true', () => {
    const data = { ...emptyData, diagnosticoMedico: true as const };
    render(<EntornoSaludSection data={data} onChange={() => {}} />);
    expect(screen.getByLabelText(/cuál diagnóstico/i)).toBeDefined();
  });

  it('binds health-sector frequency and medical treatment details', () => {
    const onChange = vi.fn();
    render(<EntornoSaludSection data={emptyData} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/frecuencia de atención en sector salud/i), { target: { value: 'Mensual' } });
    fireEvent.change(screen.getByLabelText(/tratamiento médico actual/i), { target: { value: 'Terapia ocupacional' } });

    expect(onChange).toHaveBeenCalledWith({ sectorSaludFrecuencia: 'Mensual' });
    expect(onChange).toHaveBeenCalledWith({ tratamientoMedicoCual: 'Terapia ocupacional' });
  });

  it('updating atencionMedica[0] calls onChange with tuple where only index 0 is changed', () => {
    const onChange = vi.fn();
    render(<EntornoSaludSection data={emptyData} onChange={onChange} />);
    // The first "cual" field in atencionMedica group
    const cualInputs = screen.getAllByLabelText(/atención médica \d+ - cual/i);
    fireEvent.change(cualInputs[0], { target: { value: 'Pediatría' } });
    expect(onChange).toHaveBeenCalledOnce();
    const call = onChange.mock.calls[0][0];
    expect(call.atencionMedica).toBeDefined();
    expect(call.atencionMedica[0].cual).toBe('Pediatría');
    // Other rows unchanged
    expect(call.atencionMedica[1]).toEqual(emptyData.atencionMedica[1]);
    expect(call.atencionMedica[2]).toEqual(emptyData.atencionMedica[2]);
  });

  it('apoyosTecnicosCuales hidden when apoyosTecnicos is null', () => {
    render(<EntornoSaludSection data={emptyData} onChange={() => {}} />);
    expect(screen.queryByLabelText(/cuáles apoyos/i)).toBeNull();
  });

  it('apoyosTecnicosCuales visible when apoyosTecnicos is true', () => {
    const data = { ...emptyData, apoyosTecnicos: true as const };
    render(<EntornoSaludSection data={data} onChange={() => {}} />);
    expect(screen.getByLabelText(/cuáles apoyos/i)).toBeDefined();
  });
});
