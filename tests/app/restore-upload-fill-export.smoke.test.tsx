import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiligenciarPage from '@/app/diligenciar/page';
import { importPIARPdf } from '@/features/piar/lib/pdf/pdf-importer';
import { downloadPIARPortableFile } from '@/features/piar/lib/portable/download';
import { createEmptyPIARFormDataV2, PIARFormDataV2 } from '@/features/piar/model/piar';

vi.mock('@/features/piar/lib/pdf/pdf-importer', async () => {
  const actual = await vi.importActual<typeof import('@/features/piar/lib/pdf/pdf-importer')>('@/features/piar/lib/pdf/pdf-importer');
  return {
    ...actual,
    importPIARPdf: vi.fn(),
  };
});

const importPIARPdfMock = vi.mocked(importPIARPdf);
const downloadPIARPortableFileMock = vi.mocked(downloadPIARPortableFile);

vi.mock('@/features/piar/lib/portable/download', () => ({
  downloadPIARPortableFile: vi.fn(),
}));

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

function createPdfFile(): File {
  const file = new File(['pdf'], 'restaurar.pdf', { type: 'application/pdf' });
  Object.defineProperty(file, 'arrayBuffer', {
    value: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
  });
  return file;
}

describe('Restore, upload, fill and export smoke', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    downloadPIARPortableFileMock.mockResolvedValue();

    if (!('createObjectURL' in URL)) {
      Object.defineProperty(URL, 'createObjectURL', {
        configurable: true,
        writable: true,
        value: () => 'blob:generated',
      });
    }
    if (!('revokeObjectURL' in URL)) {
      Object.defineProperty(URL, 'revokeObjectURL', {
        configurable: true,
        writable: true,
        value: () => {},
      });
    }
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('imports from upload zone and opens the form with restored values', async () => {
    const user = userEvent.setup();
    const imported = createEmptyPIARFormDataV2();
    imported.student.nombres = 'Subido';
    importPIARPdfMock.mockResolvedValue({ ok: true, data: imported, warnings: [] });

    render(<DiligenciarPage />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, createPdfFile());

    expect(((await screen.findByLabelText('Nombres')) as HTMLInputElement).value).toBe('Subido');
    expect(screen.queryByText(/La importacion corrigio/i)).toBeNull();
  }, 30000);

  it('shows a correction banner when imported data is sanitized', async () => {
    const user = userEvent.setup();
    const imported = createEmptyPIARFormDataV2();
    imported.student.nombres = 'Corregido';
    importPIARPdfMock.mockResolvedValue({
      ok: true,
      data: imported,
      warnings: [{ code: 'invalid_type', path: 'student.vinculadoSistemaAnterior' }],
    });

    render(<DiligenciarPage />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, createPdfFile());

    expect(((await screen.findByLabelText('Nombres')) as HTMLInputElement).value).toBe('Corregido');
    expect(screen.getByText(/La importacion corrigio 1 ajuste en los datos/i)).toBeDefined();
  }, 30000);

  it('preserves imported progress when returning to app start before making edits', async () => {
    const user = userEvent.setup();
    const imported = createEmptyPIARFormDataV2();
    imported.student.nombres = 'Subido';
    importPIARPdfMock.mockResolvedValue({ ok: true, data: imported, warnings: [] });

    render(<DiligenciarPage />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, createPdfFile());

    expect(((await screen.findByLabelText('Nombres')) as HTMLInputElement).value).toBe('Subido');

    await user.click(screen.getByRole('button', { name: 'Volver' }));

    const savedEnvelope = JSON.parse(localStorageMock.getItem('piar-form-progress')!) as {
      data: PIARFormDataV2;
    };
    expect(savedEnvelope.data.student.nombres).toBe('Subido');

    await user.click(await screen.findByRole('button', { name: 'Comenzar PIAR Nuevo' }));
    await user.click(await screen.findByRole('button', { name: 'Restaurar' }));

    expect(((await screen.findByLabelText('Nombres')) as HTMLInputElement).value).toBe('Subido');
  }, 30000);

  it('fills the form and exports a PDF with embedded recovery data', async () => {
    const user = userEvent.setup();

    render(<DiligenciarPage />);
    await user.click(screen.getByRole('button', { name: 'Comenzar PIAR Nuevo' }));

    const nombresInput = await screen.findByLabelText('Nombres');
    fireEvent.change(nombresInput, { target: { value: 'Ana QA' } });

    await user.click(screen.getByRole('button', { name: /^generar pdf$/i }));
    await user.click(screen.getByRole('button', { name: /continuar con pdf/i }));

    const savedRaw = localStorageMock.getItem('piar-form-progress');
    expect(savedRaw).toBeTruthy();
    const savedEnvelope = JSON.parse(savedRaw as string) as { data: PIARFormDataV2 };
    expect(savedEnvelope.data.student.nombres).toBe('Ana QA');
    expect(downloadPIARPortableFileMock).toHaveBeenCalledTimes(1);
    expect(downloadPIARPortableFileMock).toHaveBeenCalledWith('pdf', expect.objectContaining({
      student: expect.objectContaining({ nombres: 'Ana QA' }),
    }));
  }, 60000);
});
