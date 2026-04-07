import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { usePIARFormController } from '@/features/piar/components/form/PIARForm/usePIARFormController';
import { createEmptyPIARFormDataV2 } from '@/features/piar/model/piar';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('usePIARFormController', () => {
  it('merges updates into section state and marks touched sections', () => {
    const onDataChange = vi.fn();
    const initialData = createEmptyPIARFormDataV2();
    initialData.student.nombres = 'Inicial';

    const { result } = renderHook(() => usePIARFormController({
      initialData,
      onDataChange,
    }));

    expect(result.current.data.student.nombres).toBe('Inicial');
    expect(result.current.touchedSections.size).toBe(0);

    act(() => {
      result.current.handleStudentChange({ apellidos: 'García' });
    });

    expect(result.current.data.student.nombres).toBe('Inicial');
    expect(result.current.data.student.apellidos).toBe('García');
    expect(result.current.touchedSections.has('estudiante')).toBe(true);
    expect(result.current.touchedSections.size).toBe(1);
    expect(onDataChange).toHaveBeenCalledTimes(1);
    expect(onDataChange).toHaveBeenLastCalledWith(expect.objectContaining({
      student: expect.objectContaining({
        nombres: 'Inicial',
        apellidos: 'García',
      }),
    }));

    act(() => {
      result.current.handleHeaderChange({ jornada: 'mañana' });
    });

    expect(result.current.data.header.jornada).toBe('mañana');
    expect(result.current.touchedSections.has('info-general')).toBe(true);
    expect(result.current.touchedSections.size).toBe(2);
    expect(onDataChange).toHaveBeenCalledTimes(2);
  });

  it('keeps touched section tracking stable when the same section changes repeatedly', () => {
    const { result } = renderHook(() => usePIARFormController({}));

    act(() => {
      result.current.handleAjustesChange(createEmptyPIARFormDataV2().ajustes);
      result.current.handleAjustesChange(createEmptyPIARFormDataV2().ajustes);
    });

    expect(result.current.touchedSections.has('ajustes')).toBe(true);
    expect(result.current.touchedSections.size).toBe(1);
  });
});
