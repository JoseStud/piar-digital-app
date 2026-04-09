/** Tests for the PIAR autosave hook: debounce, dirty tracking, encrypted save queue, retry backoff, and pagehide unload-recovery flush. */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { usePIARAutosave } from '@piar-digital-app/features/piar/components/form/PIARForm/usePIARAutosave';
import { ProgressStore } from '@piar-digital-app/features/piar/lib/persistence/progress-store';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

async function flushMicrotasks(times = 2) {
  for (let index = 0; index < times; index += 1) {
    await Promise.resolve();
  }
}

async function advanceTimers(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await flushMicrotasks();
  });
}

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
    expect(result.current.retryCount).toBe(0);
    expect(result.current.isRetrying).toBe(false);
    expect(saveSpy).not.toHaveBeenCalled();

    rerender({ data: second });
    expect(result.current.saveState).toBe('saving');
    expect(result.current.retryCount).toBe(0);
    expect(result.current.isRetrying).toBe(false);

    await advanceTimers(499);
    expect(saveSpy).not.toHaveBeenCalled();

    await advanceTimers(1);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(second);
    expect(result.current.saveState).toBe('saved');
    expect(result.current.saveMessage).toBeNull();
    expect(result.current.retryCount).toBe(0);
    expect(result.current.isRetrying).toBe(false);
  });

  it('retries failed saves automatically with exponential backoff', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const saveSpy = vi.spyOn(ProgressStore, 'save').mockImplementation(async () => ({
      ok: false,
      code: 'storage_unavailable',
      message: 'El almacenamiento local no esta disponible en este navegador.',
    }));
    const initial = createEmptyPIARFormDataV2();
    const next = createEmptyPIARFormDataV2();
    next.student.nombres = 'Reintento';

    const { result, rerender } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initial } },
    );

    rerender({ data: next });

    await advanceTimers(500);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(Date.now()).toBe(500);
    expect(result.current.saveState).toBe('failed');
    expect(result.current.retryCount).toBe(1);
    expect(result.current.isRetrying).toBe(true);

    await advanceTimers(499);
    expect(saveSpy).toHaveBeenCalledTimes(1);

    await advanceTimers(1);
    expect(saveSpy).toHaveBeenCalledTimes(2);
    expect(Date.now()).toBe(1000);
    expect(result.current.retryCount).toBe(2);
    expect(result.current.isRetrying).toBe(true);

    await advanceTimers(999);
    expect(saveSpy).toHaveBeenCalledTimes(2);

    await advanceTimers(1);
    expect(saveSpy).toHaveBeenCalledTimes(3);
    expect(Date.now()).toBe(2000);
    expect(result.current.retryCount).toBe(3);
    expect(result.current.isRetrying).toBe(true);

    await advanceTimers(1999);
    expect(saveSpy).toHaveBeenCalledTimes(3);

    await advanceTimers(1);
    expect(saveSpy).toHaveBeenCalledTimes(4);
    expect(Date.now()).toBe(4000);
    expect(result.current.saveState).toBe('failed');
    expect(result.current.retryCount).toBe(3);
    expect(result.current.isRetrying).toBe(false);
  });

  it('resets the retry counter after a successful retry', async () => {
    vi.useFakeTimers();
    const saveSpy = vi.spyOn(ProgressStore, 'save')
      .mockResolvedValueOnce({
        ok: false,
        code: 'storage_unavailable',
        message: 'El almacenamiento local no esta disponible en este navegador.',
      })
      .mockResolvedValueOnce({ ok: true, data: null });
    const initial = createEmptyPIARFormDataV2();
    const next = createEmptyPIARFormDataV2();
    next.student.apellidos = 'Alvarez';

    const { result, rerender } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initial } },
    );

    rerender({ data: next });

    await advanceTimers(500);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(result.current.retryCount).toBe(1);
    expect(result.current.isRetrying).toBe(true);

    await advanceTimers(1000);
    expect(saveSpy).toHaveBeenCalledTimes(2);
    expect(result.current.saveState).toBe('saved');
    expect(result.current.saveMessage).toBeNull();
    expect(result.current.retryCount).toBe(0);
    expect(result.current.isRetrying).toBe(false);
  });

  it('cancels a pending retry when fresh data arrives', async () => {
    vi.useFakeTimers();
    const saveSpy = vi.spyOn(ProgressStore, 'save').mockResolvedValue({
      ok: false,
      code: 'storage_unavailable',
      message: 'El almacenamiento local no esta disponible en este navegador.',
    });
    const initial = createEmptyPIARFormDataV2();
    const next = createEmptyPIARFormDataV2();
    next.student.nombres = 'Primera version';
    const newer = createEmptyPIARFormDataV2();
    newer.student.nombres = 'Nueva version';

    const { result, rerender } = renderHook(
      ({ data }) => usePIARAutosave(data),
      { initialProps: { data: initial } },
    );

    rerender({ data: next });
    await advanceTimers(500);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(result.current.retryCount).toBe(1);
    expect(result.current.isRetrying).toBe(true);

    rerender({ data: newer });
    expect(result.current.saveState).toBe('saving');
    expect(result.current.retryCount).toBe(0);
    expect(result.current.isRetrying).toBe(false);

    await advanceTimers(499);
    expect(saveSpy).toHaveBeenCalledTimes(1);

    await advanceTimers(1);
    expect(saveSpy).toHaveBeenCalledTimes(2);
    expect(saveSpy).toHaveBeenLastCalledWith(newer);
    expect(result.current.retryCount).toBe(1);
    expect(result.current.isRetrying).toBe(true);
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
      await flushMicrotasks();
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenLastCalledWith(next);
    expect(result.current.saveState).toBe('saved');
    expect(result.current.retryCount).toBe(0);
    expect(result.current.isRetrying).toBe(false);

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
      await flushMicrotasks();
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenLastCalledWith(hidden);
    expect(result.current.saveState).toBe('saved');
    expect(result.current.retryCount).toBe(0);
    expect(result.current.isRetrying).toBe(false);

    saveSpy.mockClear();
    const unmountedData = createEmptyPIARFormDataV2();
    unmountedData.student.grado = '5';
    rerender({ data: unmountedData });

    unmount();
    await act(async () => {
      await flushMicrotasks();
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenLastCalledWith(unmountedData);

    await advanceTimers(5000);
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });
});
