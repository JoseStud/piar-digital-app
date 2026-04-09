/** Tests for the workflow hook: start/restore/import/clear/export transitions. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { usePiarWorkflow } from '@piar-digital-app/features/piar/screens/usePiarWorkflow';
import { ProgressStore } from '@piar-digital-app/features/piar/lib/persistence/progress-store';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { downloadPIARPortableFile } from '@piar-digital-app/features/piar/lib/portable/download';

vi.mock('@piar-digital-app/features/piar/screens/FormWorkspace', () => ({
  FormWorkspace: () => null,
}));

vi.mock('@piar-digital-app/features/piar/lib/portable/download', () => ({
  downloadPIARPortableFile: vi.fn(),
}));

const downloadPIARPortableFileMock = vi.mocked(downloadPIARPortableFile);

describe('usePiarWorkflow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    downloadPIARPortableFileMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('starts in the start mode with clean empty form data', () => {
    const { result } = renderHook(() => usePiarWorkflow());

    expect(result.current.mode).toBe('start');
    expect(result.current.formKey).toBe(0);
    expect(result.current.initialFormData).toEqual(createEmptyPIARFormDataV2());
    expect(result.current.storageNotice).toBeNull();
    expect(result.current.dataCorrectionNotice).toBeNull();
  });

  it('loads empty form state when no saved data exists', async () => {
    vi.spyOn(ProgressStore, 'loadWithStatus').mockResolvedValue({
      ok: false,
      code: 'not_found',
      message: 'No hay progreso guardado.',
    });

    const { result } = renderHook(() => usePiarWorkflow());

    await act(async () => {
      await result.current.handleStartNew();
    });

    expect(result.current.mode).toBe('form');
    expect(result.current.formKey).toBe(1);
    expect(result.current.initialFormData).toEqual(createEmptyPIARFormDataV2());
    expect(result.current.storageNotice).toBeNull();
  });

  it('prompts restore when saved data is found', async () => {
    const loaded = createEmptyPIARFormDataV2();
    loaded.student.nombres = 'Guardado';
    vi.spyOn(ProgressStore, 'loadWithStatus').mockResolvedValue({
      ok: true,
      data: loaded,
      warnings: [{ code: 'invalid_type', path: 'student.vinculadoSistemaAnterior' }],
    });

    const { result } = renderHook(() => usePiarWorkflow());

    await act(async () => {
      await result.current.handleStartNew();
    });

    expect(result.current.mode).toBe('restore-prompt');
    expect(result.current.formKey).toBe(0);
    expect(result.current.initialFormData.student.nombres).toBe('Guardado');
    expect(result.current.dataCorrectionNotice).toContain('1 ajuste');
  });

  it('restores the saved data after accept and returns to form', async () => {
    const loaded = createEmptyPIARFormDataV2();
    loaded.student.nombres = 'Restaurado';
    const saveSpy = vi.spyOn(ProgressStore, 'save').mockResolvedValue({ ok: true, data: null });
    const clearRecoverySpy = vi.spyOn(ProgressStore, 'clearUnloadRecovery').mockImplementation(() => {});
    vi.spyOn(ProgressStore, 'loadWithStatus').mockResolvedValue({
      ok: true,
      data: loaded,
      warnings: [],
    });

    const { result } = renderHook(() => usePiarWorkflow());

    await act(async () => {
      await result.current.handleStartNew();
    });
    await act(async () => {
      await result.current.handleRestoreAccept();
    });

    expect(saveSpy).toHaveBeenCalledWith(loaded);
    expect(clearRecoverySpy).toHaveBeenCalledTimes(1);
    expect(result.current.mode).toBe('form');
    expect(result.current.formKey).toBe(1);
  });

  it('declines restore by clearing progress and opening a blank form', async () => {
    const loaded = createEmptyPIARFormDataV2();
    loaded.student.nombres = 'Anterior';
    vi.spyOn(ProgressStore, 'loadWithStatus').mockResolvedValue({
      ok: true,
      data: loaded,
      warnings: [],
    });
    const clearSpy = vi.spyOn(ProgressStore, 'clear').mockImplementation(() => {});

    const { result } = renderHook(() => usePiarWorkflow());

    await act(async () => {
      await result.current.handleStartNew();
    });
    await act(async () => {
      result.current.handleRestoreDecline();
    });

    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(result.current.mode).toBe('form');
    expect(result.current.initialFormData).toEqual(createEmptyPIARFormDataV2());
  });

  it('returns to the start screen after saving the current draft', async () => {
    const data = createEmptyPIARFormDataV2();
    data.student.apellidos = 'Pérez';
    const saveSpy = vi.spyOn(ProgressStore, 'save').mockResolvedValue({ ok: true, data: null });
    const clearRecoverySpy = vi.spyOn(ProgressStore, 'clearUnloadRecovery').mockImplementation(() => {});

    const { result } = renderHook(() => usePiarWorkflow());

    act(() => {
      result.current.handleDataChange(data);
    });
    await act(async () => {
      await result.current.handleReturnToStart();
    });

    expect(saveSpy).toHaveBeenCalledWith(data);
    expect(clearRecoverySpy).toHaveBeenCalledTimes(1);
    expect(result.current.mode).toBe('start');
  });

  it('opens the clear-progress dialog and clears into a blank form when confirmed', async () => {
    const clearSpy = vi.spyOn(ProgressStore, 'clear').mockImplementation(() => {});

    const { result } = renderHook(() => usePiarWorkflow());

    act(() => {
      result.current.handleClearProgress();
    });
    expect(result.current.isClearDialogOpen).toBe(true);

    await act(async () => {
      result.current.handleClearProgressConfirm();
    });

    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(result.current.isClearDialogOpen).toBe(false);
    expect(result.current.mode).toBe('form');
    expect(result.current.formKey).toBe(1);
    expect(result.current.initialFormData).toEqual(createEmptyPIARFormDataV2());
  });

  it('closes the clear-progress dialog when cancelled', () => {
    const { result } = renderHook(() => usePiarWorkflow());

    act(() => {
      result.current.handleClearProgress();
    });
    expect(result.current.isClearDialogOpen).toBe(true);

    act(() => {
      result.current.handleClearProgressCancel();
    });

    expect(result.current.isClearDialogOpen).toBe(false);
    expect(result.current.clearDialogMessage).toBeNull();
  });

  it('imports data, saves it, and opens the form with correction notice', async () => {
    const imported = createEmptyPIARFormDataV2();
    imported.student.nombres = 'Importado';
    const saveSpy = vi.spyOn(ProgressStore, 'save').mockResolvedValue({ ok: true, data: null });
    vi.spyOn(ProgressStore, 'clearUnloadRecovery').mockImplementation(() => {});

    const { result } = renderHook(() => usePiarWorkflow());

    await act(async () => {
      await result.current.handleImport({
        ok: true,
        data: imported,
        warnings: [{ code: 'invalid_type', path: 'student.numeroIdentificacion' }],
      });
    });

    expect(saveSpy).toHaveBeenCalledWith(imported);
    expect(result.current.mode).toBe('form');
    expect(result.current.formKey).toBe(1);
    expect(result.current.initialFormData.student.nombres).toBe('Importado');
    expect(result.current.dataCorrectionNotice).toContain('1 ajuste');
  });

  it('exports a DOCX backup before clearing with the configured template', async () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Respaldo';
    const saveSpy = vi.spyOn(ProgressStore, 'save').mockResolvedValue({ ok: true, data: null });
    vi.spyOn(ProgressStore, 'clearUnloadRecovery').mockImplementation(() => {});
    downloadPIARPortableFileMock.mockResolvedValue();

    const { result } = renderHook(() => usePiarWorkflow({
      docxTemplate: {
        kind: 'url',
        url: '/template.docx',
        sourceName: '  Ministerio  ',
      },
    }));

    act(() => {
      result.current.handleDataChange(data);
    });

    await act(async () => {
      await result.current.handleExportBackupBeforeClear();
    });

    expect(saveSpy).toHaveBeenCalledWith(data);
    expect(downloadPIARPortableFileMock).toHaveBeenCalledWith('docx', data, {
      docxTemplate: {
        kind: 'url',
        url: '/template.docx',
        sourceName: '  Ministerio  ',
      },
    });
    expect(result.current.clearDialogMessage?.tone).toBe('default');
    expect(result.current.isExportingBackup).toBe(false);
    expect(result.current.docxTemplateSourceName).toBe('Ministerio');
  });
});
