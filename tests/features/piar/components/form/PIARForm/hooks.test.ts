import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { usePIARFormController } from '@piar-digital-app/features/piar/components/form/PIARForm/usePIARFormController';
import { usePIARAutosave } from '@piar-digital-app/features/piar/components/form/PIARForm/usePIARAutosave';
import { useActiveSectionObserver } from '@piar-digital-app/features/piar/components/form/PIARForm/useActiveSectionObserver';
import { createEmptyPIARFormDataV2, type PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { ProgressStore } from '@piar-digital-app/features/piar/lib/persistence/progress-store';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// ─────────────────────────────────────────────
// usePIARFormController Tests
// ─────────────────────────────────────────────
describe('usePIARFormController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('initializes with empty form data when no initialData provided', () => {
    const { result } = renderHook(() => usePIARFormController({}));
    expect(result.current.data._version).toBe(2);
    expect(result.current.touchedSections.size).toBe(0);
  });

  it('initializes with provided initialData', () => {
    const initialData = createEmptyPIARFormDataV2();
    initialData.header.fechaDiligenciamiento = '2024-01-01';

    const { result } = renderHook(() => usePIARFormController({ initialData }));
    expect(result.current.data.header.fechaDiligenciamiento).toBe('2024-01-01');
  });

  it('merges initialData with defaults via deepMergeWithDefaultsV2', () => {
    // Create partial data missing some fields
    const partialData = createEmptyPIARFormDataV2();
    partialData.student.nombres = 'María';
    // Remove a nested field to test merge
    (partialData as unknown as Record<string, unknown>).descripcionHabilidades = undefined;

    const { result } = renderHook(() => usePIARFormController({ initialData: partialData }));
    // Should preserve provided value
    expect(result.current.data.student.nombres).toBe('María');
    // Should have default for missing field
    expect(result.current.data.descripcionHabilidades).toBe('');
  });

  describe('section change handlers', () => {
    it('updates header data and marks section as touched', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      act(() => {
        result.current.handleHeaderChange({ fechaDiligenciamiento: '2024-06-15' });
      });

      expect(result.current.data.header.fechaDiligenciamiento).toBe('2024-06-15');
      expect(result.current.touchedSections.has('info-general')).toBe(true);
    });

    it('updates student data and marks section as touched', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      act(() => {
        result.current.handleStudentChange({ nombres: 'Juan', apellidos: 'Pérez' });
      });

      expect(result.current.data.student.nombres).toBe('Juan');
      expect(result.current.data.student.apellidos).toBe('Pérez');
      expect(result.current.touchedSections.has('estudiante')).toBe(true);
    });

    it('updates entornoSalud data and marks section as touched', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      act(() => {
        result.current.handleEntornoSaludChange({ eps: 'Sura' });
      });

      expect(result.current.data.entornoSalud.eps).toBe('Sura');
      expect(result.current.touchedSections.has('salud')).toBe(true);
    });

    it('updates entornoHogar data and marks section as touched', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      act(() => {
        result.current.handleEntornoHogarChange({ nombreMadre: 'Ana García' });
      });

      expect(result.current.data.entornoHogar.nombreMadre).toBe('Ana García');
      expect(result.current.touchedSections.has('hogar')).toBe(true);
    });

    it('updates entornoEducativo data and marks section as touched', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      act(() => {
        result.current.handleEntornoEducativoChange({ institucionesAnteriores: 'Escuela primaria' });
      });

      expect(result.current.data.entornoEducativo.institucionesAnteriores).toBe('Escuela primaria');
      expect(result.current.touchedSections.has('educativo')).toBe(true);
    });

    it('updates valoracionPedagogica data and marks section as touched', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      act(() => {
        result.current.handleValoracionChange({
          movilidad: { respuestas: {}, intensidad: 'extenso', observacion: 'test' },
        });
      });

      expect(result.current.data.valoracionPedagogica.movilidad.intensidad).toBe('extenso');
      expect(result.current.touchedSections.has('valoracion')).toBe(true);
    });

    it('updates competenciasDispositivos data and marks section as touched', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      act(() => {
        result.current.handleCompetenciasChange({
          memoria: { mem_1: true },
        });
      });

      expect(result.current.data.competenciasDispositivos.memoria.mem_1).toBe(true);
      expect(result.current.touchedSections.has('competencias')).toBe(true);
    });

    it('updates descripcionHabilidades and marks section as touched', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      act(() => {
        result.current.handleDescripcionChange('Habilidades destacadas');
      });

      expect(result.current.data.descripcionHabilidades).toBe('Habilidades destacadas');
      expect(result.current.touchedSections.has('habilidades')).toBe(true);
    });

    it('updates estrategiasAcciones and marks section as touched', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      act(() => {
        result.current.handleEstrategiasChange('Estrategias pedagógicas');
      });

      expect(result.current.data.estrategiasAcciones).toBe('Estrategias pedagógicas');
      expect(result.current.touchedSections.has('estrategias')).toBe(true);
    });

    it('updates fechaProximaRevision and marks estrategias section as touched', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      act(() => {
        result.current.handleFechaRevisionChange('2024-12-01');
      });

      expect(result.current.data.fechaProximaRevision).toBe('2024-12-01');
      expect(result.current.touchedSections.has('estrategias')).toBe(true);
    });

    it('updates ajustes array and marks section as touched', () => {
      const { result } = renderHook(() => usePIARFormController({}));
      const newAjustes = [...result.current.data.ajustes] as PIARFormDataV2['ajustes'];
      newAjustes[0] = { ...newAjustes[0], area: 'Matemáticas' };

      act(() => {
        result.current.handleAjustesChange(newAjustes);
      });

      expect(result.current.data.ajustes[0].area).toBe('Matemáticas');
      expect(result.current.touchedSections.has('ajustes')).toBe(true);
    });

    it('updates firmas data and marks section as touched', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      act(() => {
        result.current.handleFirmasChange({
          firmanteAcudiente: 'Pedro López',
        });
      });

      expect(result.current.data.firmas.firmanteAcudiente).toBe('Pedro López');
      expect(result.current.touchedSections.has('firmas')).toBe(true);
    });

    it('updates acta data and marks section as touched', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      act(() => {
        result.current.handleActaChange({
          compromisos: 'Compromiso de seguimiento',
        });
      });

      expect(result.current.data.acta.compromisos).toBe('Compromiso de seguimiento');
      expect(result.current.touchedSections.has('acta')).toBe(true);
    });
  });

  describe('onDataChange callback', () => {
    it('calls onDataChange callback when data changes', () => {
      const onDataChange = vi.fn();
      const { result } = renderHook(() => usePIARFormController({ onDataChange }));

      act(() => {
        result.current.handleStudentChange({ nombres: 'Juan' });
      });

      expect(onDataChange).toHaveBeenCalledTimes(1);
      expect(onDataChange).toHaveBeenCalledWith(expect.objectContaining({
        student: expect.objectContaining({ nombres: 'Juan' }),
      }));
    });

    it('calls onDataChange with latest data on each change', () => {
      const onDataChange = vi.fn();
      const { result } = renderHook(() => usePIARFormController({ onDataChange }));

      act(() => {
        result.current.handleStudentChange({ nombres: 'Juan' });
      });

      act(() => {
        result.current.handleStudentChange({ apellidos: 'García' });
      });

      expect(onDataChange).toHaveBeenCalledTimes(2);
      const lastCall = onDataChange.mock.calls[1][0];
      expect(lastCall.student.nombres).toBe('Juan');
      expect(lastCall.student.apellidos).toBe('García');
    });

    it('does not call onDataChange if not provided', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      // Should not throw
      act(() => {
        result.current.handleStudentChange({ nombres: 'Test' });
      });

      expect(result.current.data.student.nombres).toBe('Test');
    });
  });

  describe('touchedSections tracking', () => {
    it('does not duplicate section in touchedSections on repeated changes', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      act(() => {
        result.current.handleStudentChange({ nombres: 'Juan' });
      });

      act(() => {
        result.current.handleStudentChange({ apellidos: 'Pérez' });
      });

      // Set should only contain the section once
      expect(result.current.touchedSections.has('estudiante')).toBe(true);
      expect(result.current.touchedSections.size).toBe(1);
    });

    it('tracks multiple touched sections independently', () => {
      const { result } = renderHook(() => usePIARFormController({}));

      act(() => {
        result.current.handleHeaderChange({ fechaDiligenciamiento: '2024-01-01' });
        result.current.handleStudentChange({ nombres: 'Test' });
        result.current.handleEntornoSaludChange({ eps: 'Test EPS' });
      });

      expect(result.current.touchedSections.size).toBe(3);
      expect(result.current.touchedSections.has('info-general')).toBe(true);
      expect(result.current.touchedSections.has('estudiante')).toBe(true);
      expect(result.current.touchedSections.has('salud')).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────
// usePIARAutosave Tests
// ─────────────────────────────────────────────
describe('usePIARAutosave', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
    cleanup();
  });

  it('starts in idle state', () => {
    const data = createEmptyPIARFormDataV2();
    const { result } = renderHook(() => usePIARAutosave(data));

    expect(result.current.saveState).toBe('idle');
    expect(result.current.saveMessage).toBeNull();
  });

  it('does not save on initial render', () => {
    const data = createEmptyPIARFormDataV2();
    renderHook(() => usePIARAutosave(data));

    vi.advanceTimersByTime(1000);

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('transitions to saving state when data changes', () => {
    const initialData = createEmptyPIARFormDataV2();
    const { result, rerender } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initialData } },
    );

    const updatedData = { ...initialData, descripcionHabilidades: 'Test' };
    rerender({ data: updatedData });

    expect(result.current.saveState).toBe('saving');
  });

  it('saves after debounce period (500ms)', () => {
    const initialData = createEmptyPIARFormDataV2();
    const { result, rerender } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initialData } },
    );

    const updatedData = { ...initialData, descripcionHabilidades: 'Test' };
    rerender({ data: updatedData });

    // Before debounce completes
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(localStorageMock.setItem).not.toHaveBeenCalled();

    // After debounce completes
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(localStorageMock.setItem).toHaveBeenCalled();
    expect(result.current.saveState).toBe('saved');
  });

  it('debounces multiple rapid changes', () => {
    const initialData = createEmptyPIARFormDataV2();
    const { rerender } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initialData } },
    );

    // Multiple rapid changes
    rerender({ data: { ...initialData, descripcionHabilidades: 'A' } });
    act(() => { vi.advanceTimersByTime(200); });
    rerender({ data: { ...initialData, descripcionHabilidades: 'AB' } });
    act(() => { vi.advanceTimersByTime(200); });
    rerender({ data: { ...initialData, descripcionHabilidades: 'ABC' } });
    act(() => { vi.advanceTimersByTime(200); });

    // Should not have saved yet (debounce resets each time)
    expect(localStorageMock.setItem).not.toHaveBeenCalled();

    // After final debounce completes
    act(() => { vi.advanceTimersByTime(300); });
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);

    // Verify last value was saved
    const savedEnvelope = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedEnvelope.data.descripcionHabilidades).toBe('ABC');
  });

  it('handles save failure and sets failed state', () => {
    vi.spyOn(ProgressStore, 'save').mockReturnValue({
      ok: false,
      code: 'quota_exceeded',
      message: 'Storage full',
    });

    const initialData = createEmptyPIARFormDataV2();
    const { result, rerender } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initialData } },
    );

    rerender({ data: { ...initialData, descripcionHabilidades: 'Test' } });
    act(() => { vi.advanceTimersByTime(500); });

    expect(result.current.saveState).toBe('failed');
    expect(result.current.saveMessage).toBe('Storage full');
  });

  it('retrySave attempts save again', () => {
    const saveSpy = vi.spyOn(ProgressStore, 'save')
      .mockReturnValueOnce({
        ok: false,
        code: 'quota_exceeded',
        message: 'Storage full',
      })
      .mockReturnValueOnce({ ok: true, data: null });

    const initialData = createEmptyPIARFormDataV2();
    const { result, rerender } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initialData } },
    );

    // Trigger first save (fails)
    rerender({ data: { ...initialData, descripcionHabilidades: 'Test' } });
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current.saveState).toBe('failed');

    // Retry
    act(() => {
      result.current.retrySave();
    });

    expect(saveSpy).toHaveBeenCalledTimes(2);
    expect(result.current.saveState).toBe('saved');
  });

  it('flushes on pagehide event', () => {
    const saveSpy = vi.spyOn(ProgressStore, 'save').mockReturnValue({ ok: true, data: null });
    const initialData = createEmptyPIARFormDataV2();
    const { rerender } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initialData } },
    );

    const updatedData = { ...initialData, descripcionHabilidades: 'Urgent save' };
    rerender({ data: updatedData });

    // Don't wait for debounce - flush immediately on pagehide
    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });

    expect(saveSpy).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenLastCalledWith(updatedData);
  });

  it('flushes when document becomes hidden', () => {
    const saveSpy = vi.spyOn(ProgressStore, 'save').mockReturnValue({ ok: true, data: null });
    const initialData = createEmptyPIARFormDataV2();
    const { rerender } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initialData } },
    );

    const updatedData = { ...initialData, descripcionHabilidades: 'Hidden save' };
    rerender({ data: updatedData });

    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(saveSpy).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenLastCalledWith(updatedData);
  });

  it('does not flush when document becomes visible', () => {
    const initialData = createEmptyPIARFormDataV2();
    const { rerender } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initialData } },
    );

    rerender({ data: { ...initialData, descripcionHabilidades: 'Test' } });

    // Document stays visible
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'visible',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Only debounced save should happen, not immediate flush
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('flushes on unmount', () => {
    const saveSpy = vi.spyOn(ProgressStore, 'save').mockReturnValue({ ok: true, data: null });
    const initialData = createEmptyPIARFormDataV2();
    const { rerender, unmount } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initialData } },
    );

    const updatedData = { ...initialData, descripcionHabilidades: 'Unmount save' };
    rerender({ data: updatedData });
    unmount();

    expect(saveSpy).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenLastCalledWith(updatedData);
  });

  it('does not save if no changes are pending', () => {
    const initialData = createEmptyPIARFormDataV2();
    const { result } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initialData } },
    );

    // No data changes, just call retrySave
    act(() => {
      result.current.retrySave();
    });

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    expect(result.current.saveState).toBe('idle');
  });

  it('clears saveMessage on successful save after failure', () => {
    const saveSpy = vi.spyOn(ProgressStore, 'save')
      .mockReturnValueOnce({
        ok: false,
        code: 'quota_exceeded',
        message: 'Storage full',
      })
      .mockReturnValueOnce({ ok: true, data: null });

    const initialData = createEmptyPIARFormDataV2();
    const { result, rerender } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initialData } },
    );

    // First save fails
    rerender({ data: { ...initialData, descripcionHabilidades: 'Test1' } });
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current.saveMessage).toBe('Storage full');

    // Second save succeeds
    rerender({ data: { ...initialData, descripcionHabilidades: 'Test2' } });
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current.saveState).toBe('saved');
    expect(result.current.saveMessage).toBeNull();

    saveSpy.mockRestore();
  });
});

// ─────────────────────────────────────────────
// useActiveSectionObserver Tests
// ─────────────────────────────────────────────
describe('useActiveSectionObserver', () => {
  let mockIntersectionObserver: ReturnType<typeof vi.fn>;
  let observerCallback: IntersectionObserverCallback;
  const mockObserve = vi.fn();
  const mockDisconnect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockObserve.mockClear();
    mockDisconnect.mockClear();

    mockIntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => {
      observerCallback = callback;
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [0.3],
        takeRecords: () => [],
      };
    });

    vi.stubGlobal('IntersectionObserver', mockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
    // Clean up any created elements
    document.body.innerHTML = '';
  });

  it('returns empty string initially', () => {
    const { result } = renderHook(() =>
      useActiveSectionObserver(['section1', 'section2']),
    );

    expect(result.current).toBe('');
  });

  it('observes section elements with correct IDs', () => {
    // Create section elements in DOM
    const section1 = document.createElement('div');
    section1.id = 'section-section1';
    const section2 = document.createElement('div');
    section2.id = 'section-section2';
    document.body.appendChild(section1);
    document.body.appendChild(section2);

    renderHook(() => useActiveSectionObserver(['section1', 'section2']));

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.3 },
    );
    expect(mockObserve).toHaveBeenCalledTimes(2);
    expect(mockObserve).toHaveBeenCalledWith(section1);
    expect(mockObserve).toHaveBeenCalledWith(section2);
  });

  it('updates active section when intersection is detected', () => {
    const section1 = document.createElement('div');
    section1.id = 'section-section1';
    document.body.appendChild(section1);

    const { result } = renderHook(() =>
      useActiveSectionObserver(['section1']),
    );

    // Simulate intersection
    act(() => {
      observerCallback([
        {
          target: section1,
          isIntersecting: true,
          intersectionRatio: 0.5,
        } as unknown as IntersectionObserverEntry,
      ], {} as IntersectionObserver);
    });

    expect(result.current).toBe('section1');
  });

  it('ignores non-intersecting entries', () => {
    const section1 = document.createElement('div');
    section1.id = 'section-section1';
    document.body.appendChild(section1);

    const { result } = renderHook(() =>
      useActiveSectionObserver(['section1']),
    );

    // Simulate non-intersection
    act(() => {
      observerCallback([
        {
          target: section1,
          isIntersecting: false,
          intersectionRatio: 0,
        } as unknown as IntersectionObserverEntry,
      ], {} as IntersectionObserver);
    });

    expect(result.current).toBe('');
  });

  it('disconnects observer on unmount', () => {
    const section1 = document.createElement('div');
    section1.id = 'section-section1';
    document.body.appendChild(section1);

    const { unmount } = renderHook(() =>
      useActiveSectionObserver(['section1']),
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('handles missing section elements gracefully', () => {
    // No elements in DOM
    const { result } = renderHook(() =>
      useActiveSectionObserver(['nonexistent1', 'nonexistent2']),
    );

    expect(result.current).toBe('');
    // Should not create observer if no elements found
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('re-observes when sectionIds change', () => {
    const section1 = document.createElement('div');
    section1.id = 'section-section1';
    const section2 = document.createElement('div');
    section2.id = 'section-section2';
    document.body.appendChild(section1);
    document.body.appendChild(section2);

    const { rerender } = renderHook(
      ({ ids }) => useActiveSectionObserver(ids),
      { initialProps: { ids: ['section1'] as readonly string[] } },
    );

    expect(mockObserve).toHaveBeenCalledTimes(1);

    rerender({ ids: ['section1', 'section2'] as readonly string[] });

    // Should disconnect old observer and create new one
    expect(mockDisconnect).toHaveBeenCalled();
    // New observer should observe both sections
    expect(mockObserve).toHaveBeenCalledWith(section2);
  });

  it('uses MutationObserver to wait for sections when not initially present', () => {
    const mockMutationObserver = vi.fn((callback: MutationCallback) => {
      // Store callback for manual triggering
      (mockMutationObserver as unknown as { storedCallback: MutationCallback }).storedCallback = callback;
      return {
        observe: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: () => [],
      };
    });
    vi.stubGlobal('MutationObserver', mockMutationObserver);

    // Start with no elements
    renderHook(() => useActiveSectionObserver(['section1']));

    expect(mockMutationObserver).toHaveBeenCalled();

    // Add element and trigger mutation
    const section1 = document.createElement('div');
    section1.id = 'section-section1';
    document.body.appendChild(section1);

    act(() => {
      const callback = (mockMutationObserver as unknown as { storedCallback: MutationCallback }).storedCallback;
      callback([], {} as MutationObserver);
    });

    // Now IntersectionObserver should have been created and observing
    expect(mockObserve).toHaveBeenCalledWith(section1);
  });

  it('handles environment without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    // Should not throw
    const { result } = renderHook(() =>
      useActiveSectionObserver(['section1']),
    );

    expect(result.current).toBe('');
  });
});
