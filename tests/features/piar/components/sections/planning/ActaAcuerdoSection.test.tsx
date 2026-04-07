import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ActaAcuerdoSection } from '@/features/piar/components/sections/planning/ActaAcuerdoSection';
import { createEmptyPIARFormDataV2 } from '@/features/piar/model/piar';

afterEach(cleanup);

function createSectionProps() {
  const data = createEmptyPIARFormDataV2();
  return {
    acta: data.acta,
    header: data.header,
    student: data.student,
  };
}

describe('ActaAcuerdoSection', () => {
  it('renders without crash', () => {
    const { acta, header, student } = createSectionProps();
    render(<ActaAcuerdoSection data={acta} header={header} student={student} onChange={() => {}} />);
    expect(screen.getByText('Datos sincronizados del acta')).toBeDefined();
    expect(screen.getByText('Compromisos y acuerdos')).toBeDefined();
    expect(screen.getByText('Actividades')).toBeDefined();
  });

  it('shows canonical header and student facts as read-only values', () => {
    const { acta, header, student } = createSectionProps();
    header.fechaDiligenciamiento = '2026-03-30';
    header.institucionEducativa = 'IE Central';
    student.nombres = 'Ana';
    student.apellidos = 'Perez';

    render(<ActaAcuerdoSection data={acta} header={header} student={student} onChange={() => {}} />);

    const fecha = screen.getByLabelText(/fecha de diligenciamiento/i) as HTMLInputElement;
    const institucion = screen.getByLabelText(/institución educativa/i) as HTMLInputElement;
    const estudiante = screen.getByLabelText(/nombre del estudiante/i) as HTMLInputElement;

    expect(fecha.value).toBe('2026-03-30');
    expect(fecha.readOnly).toBe(true);
    expect(institucion.value).toBe('IE Central');
    expect(estudiante.value).toBe('Ana Perez');
    expect(estudiante.readOnly).toBe(true);
  });

  it('compromisos textarea calls onChange with { compromisos: "test" }', () => {
    const { acta, header, student } = createSectionProps();
    const onChange = vi.fn();
    render(<ActaAcuerdoSection data={acta} header={header} student={student} onChange={onChange} />);
    const compromisos = screen.getByLabelText(/compromisos y acuerdos/i);
    fireEvent.change(compromisos, { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledWith({ compromisos: 'test' });
  });

  it('binds acta participant fields', () => {
    const { acta, header, student } = createSectionProps();
    const onChange = vi.fn();
    render(<ActaAcuerdoSection data={acta} header={header} student={student} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/equipo directivos y docentes/i), { target: { value: 'Rectora y docente' } });
    fireEvent.change(screen.getByLabelText(/^familia participante$/i), { target: { value: 'Madre' } });
    fireEvent.change(screen.getByLabelText(/parentesco de la familia participante/i), { target: { value: 'Madre' } });

    expect(onChange).toHaveBeenCalledWith({ equipoDirectivosDocentes: 'Rectora y docente' });
    expect(onChange).toHaveBeenCalledWith({ familiaParticipante: 'Madre' });
    expect(onChange).toHaveBeenCalledWith({ parentescoFamiliaParticipante: 'Madre' });
  });

  it('changing actividad 0 nombre calls onChange with actividades tuple where only index 0 changed', () => {
    const { acta, header, student } = createSectionProps();
    const onChange = vi.fn();
    render(<ActaAcuerdoSection data={acta} header={header} student={student} onChange={onChange} />);
    const actividadInput = screen.getByLabelText(/actividad/i, {
      selector: '#acta-actividad-0-nombre',
    });
    fireEvent.change(actividadInput, { target: { value: 'Taller de lectura' } });
    expect(onChange).toHaveBeenCalledOnce();
    const call = onChange.mock.calls[0][0];
    expect(call.actividades).toBeDefined();
    expect(call.actividades[0].nombre).toBe('Taller de lectura');
    // Other actividades unchanged
    expect(call.actividades[1]).toEqual(acta.actividades[1]);
    expect(call.actividades[2]).toEqual(acta.actividades[2]);
    expect(call.actividades[3]).toEqual(acta.actividades[3]);
    expect(call.actividades[4]).toEqual(acta.actividades[4]);
  });

  it('firmaEstudiante input calls onChange with { firmaEstudiante: "signed" }', () => {
    const { acta, header, student } = createSectionProps();
    const onChange = vi.fn();
    render(<ActaAcuerdoSection data={acta} header={header} student={student} onChange={onChange} />);
    const firmaInput = screen.getByLabelText(/firma del estudiante/i);
    fireEvent.change(firmaInput, { target: { value: 'signed' } });
    expect(onChange).toHaveBeenCalledWith({ firmaEstudiante: 'signed' });
  });
});
