import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { usePIARAutosave } from '@piar-digital-app/features/piar/components/form/PIARForm/usePIARAutosave';
import { ProgressStore } from '@piar-digital-app/features/piar/lib/persistence/progress-store';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: 'visible',
  });
});

describe('usePIARAutosave', () => {
  it('debounces saves and writes the latest data only once', async () => {
    vi.useFakeTimers();
    const saveSpy = vi.spyOn(ProgressStore, 'save').mockResolvedValue({ ok: true, data: null });
    const first = createEmptyPIARFormDataV2();
    const second = createEmptyPIARFormDataV2();
    first.student.nombres = 'Primero';
    second.student.nombres = 'Segundo';

    const { result, rerender } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: first } },
    );

    expect(result.current.saveState).toBe('idle');
    expect(saveSpy).not.toHaveBeenCalled();

    rerender({ data: second });
    expect(result.current.saveState).toBe('saving');

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(saveSpy).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(second);
    expect(result.current.saveState).toBe('saved');
    expect(result.current.saveMessage).toBeNull();
  });

  it('flushes dirty state on pagehide, visibilitychange, and unmount', async () => {
    vi.useFakeTimers();
    const saveSpy = vi.spyOn(ProgressStore, 'save').mockResolvedValue({ ok: true, data: null });
    const initial = createEmptyPIARFormDataV2();
    const next = createEmptyPIARFormDataV2();
    next.student.apellidos = 'Alvarez';

    const { result, rerender, unmount } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initial } },
    );

    rerender({ data: next });

    await act(async () => {
      window.dispatchEvent(new Event('pagehide'));
      await Promise.resolve();
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenLastCalledWith(next);
    expect(result.current.saveState).toBe('saved');

    saveSpy.mockClear();
    const hidden = createEmptyPIARFormDataV2();
    hidden.student.nombres = 'Oculto';
    rerender({ data: hidden });

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });

    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await Promise.resolve();
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenLastCalledWith(hidden);
    expect(result.current.saveState).toBe('saved');

    saveSpy.mockClear();
    const unmountedData = createEmptyPIARFormDataV2();
    unmountedData.student.grado = '5';
    rerender({ data: unmountedData });

    unmount();
    await act(async () => {
      await Promise.resolve();
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenLastCalledWith(unmountedData);
  });
});
