import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EntornoHogarSection } from '@piar-digital-app/features/piar/components/sections/environments/EntornoHogarSection';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

afterEach(cleanup);

describe('EntornoHogarSection', () => {
  const emptyData = createEmptyPIARFormDataV2().entornoHogar;

  it('renders without crash with default data', () => {
    render(<EntornoHogarSection data={emptyData} onChange={() => {}} />);
    expect(screen.getByLabelText(/nombre de la madre/i)).toBeDefined();
  });

  it('nombreMadre input calls onChange with { nombreMadre: "Test" } when changed', () => {
    const onChange = vi.fn();
    render(<EntornoHogarSection data={emptyData} onChange={onChange} />);
    const input = screen.getByLabelText(/nombre de la madre/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    expect(onChange).toHaveBeenCalledWith({ nombreMadre: 'Test' });
  });

  it('nivelEducativoMadre select calls onChange with correct value', () => {
    const onChange = vi.fn();
    render(<EntornoHogarSection data={emptyData} onChange={onChange} />);
    // There are multiple "Nivel educativo" labels, get the first one (madre)
    const selects = screen.getAllByLabelText(/nivel educativo/i);
    fireEvent.change(selects[0], { target: { value: 'Bachillerato' } });
    expect(onChange).toHaveBeenCalledWith({ nivelEducativoMadre: 'Bachillerato' });
  });

  it('quienesApoyaCrianza textarea calls onChange with correct patch', () => {
    const onChange = vi.fn();
    render(<EntornoHogarSection data={emptyData} onChange={onChange} />);
    const textarea = screen.getByLabelText(/quiénes apoyan la crianza/i);
    fireEvent.change(textarea, { target: { value: 'Abuela materna' } });
    expect(onChange).toHaveBeenCalledWith({ quienesApoyaCrianza: 'Abuela materna' });
  });

  it('binds protection and subsidy fields', () => {
    const onChange = vi.fn();
    render(<EntornoHogarSection data={emptyData} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/está bajo protección/i), { target: { value: 'true' } });
    fireEvent.change(screen.getByLabelText(/entidad que entrega subsidio/i), { target: { value: 'ICBF' } });
    fireEvent.change(screen.getByLabelText(/cuál subsidio/i), { target: { value: 'Transporte' } });

    expect(onChange).toHaveBeenCalledWith({ estaBajoProteccion: true });
    expect(onChange).toHaveBeenCalledWith({ subsidioEntidad: 'ICBF' });
    expect(onChange).toHaveBeenCalledWith({ subsidioCual: 'Transporte' });
  });
});
