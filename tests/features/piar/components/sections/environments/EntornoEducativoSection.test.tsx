import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EntornoEducativoSection } from '@/features/piar/components/sections/environments/EntornoEducativoSection';
import { createEmptyPIARFormDataV2 } from '@/features/piar/model/piar';

afterEach(cleanup);

describe('EntornoEducativoSection', () => {
  const emptyData = createEmptyPIARFormDataV2().entornoEducativo;

  it('renders without crash with default data', () => {
    render(<EntornoEducativoSection data={emptyData} onChange={() => {}} />);
    expect(screen.getByLabelText(/ha estado vinculado/i)).toBeDefined();
  });

  it('vinculadoOtraInstitucion select calls onChange with true when Sí selected', () => {
    const onChange = vi.fn();
    render(<EntornoEducativoSection data={emptyData} onChange={onChange} />);
    const select = screen.getByLabelText(/ha estado vinculado/i);
    fireEvent.change(select, { target: { value: 'true' } });
    expect(onChange).toHaveBeenCalledWith({ vinculadoOtraInstitucion: true });
  });

  it('vinculadoOtraInstitucion select calls onChange with null when cleared', () => {
    const onChange = vi.fn();
    render(<EntornoEducativoSection data={emptyData} onChange={onChange} />);
    const select = screen.getByLabelText(/ha estado vinculado/i);
    fireEvent.change(select, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith({ vinculadoOtraInstitucion: null });
  });

  it('institucionesAnteriores is hidden when vinculadoOtraInstitucion is null', () => {
    render(<EntornoEducativoSection data={emptyData} onChange={() => {}} />);
    expect(screen.queryByLabelText(/instituciones anteriores/i)).toBeNull();
  });

  it('institucionesAnteriores is visible when vinculadoOtraInstitucion is true', () => {
    const data = { ...emptyData, vinculadoOtraInstitucion: true as const };
    render(<EntornoEducativoSection data={data} onChange={() => {}} />);
    expect(screen.getByLabelText(/instituciones anteriores/i)).toBeDefined();
  });

  it('binds the no vinculacion reason when vinculadoOtraInstitucion is false', () => {
    const onChange = vi.fn();
    const data = { ...emptyData, vinculadoOtraInstitucion: false as const };
    render(<EntornoEducativoSection data={data} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/motivo de no vinculación/i), { target: { value: 'Sin cupo' } });
    expect(onChange).toHaveBeenCalledWith({ noVinculacionMotivo: 'Sin cupo' });
  });

  it('estadoGrado select calls onChange with { estadoGrado: "aprobado" } when selected', () => {
    const onChange = vi.fn();
    render(<EntornoEducativoSection data={emptyData} onChange={onChange} />);
    const select = screen.getByLabelText(/estado del grado/i);
    fireEvent.change(select, { target: { value: 'aprobado' } });
    expect(onChange).toHaveBeenCalledWith({ estadoGrado: 'aprobado' });
  });

  it('programasCuales is hidden when programasComplementarios is null', () => {
    render(<EntornoEducativoSection data={emptyData} onChange={() => {}} />);
    expect(screen.queryByLabelText(/cuáles programas/i)).toBeNull();
  });

  it('programasCuales is visible when programasComplementarios is true', () => {
    const data = { ...emptyData, programasComplementarios: true as const };
    render(<EntornoEducativoSection data={data} onChange={() => {}} />);
    expect(screen.getByLabelText(/cuáles programas/i)).toBeDefined();
  });

  it('binds school transportation fields', () => {
    const onChange = vi.fn();
    render(<EntornoEducativoSection data={emptyData} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/medio de transporte/i), { target: { value: 'Ruta escolar' } });
    fireEvent.change(screen.getByLabelText(/distancia y tiempo al colegio/i), { target: { value: '30 minutos' } });

    expect(onChange).toHaveBeenCalledWith({ medioTransporte: 'Ruta escolar' });
    expect(onChange).toHaveBeenCalledWith({ distanciaTiempo: '30 minutos' });
  });
});
