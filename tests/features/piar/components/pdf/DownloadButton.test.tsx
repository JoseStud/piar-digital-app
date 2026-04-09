/** Tests for the export button: PDF warning dialog, missing-context warning, save-before-export flow. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DownloadButton } from '@piar-digital-app/features/piar/components/pdf/DownloadButton';
import { downloadPIARPortableFile } from '@piar-digital-app/features/piar/lib/portable/download';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { installEncryptedProgressStorageMocks } from '../../../../test-utils/encrypted-progress-storage';

vi.mock('@piar-digital-app/features/piar/lib/portable/download', () => ({
  downloadPIARPortableFile: vi.fn(),
}));

const downloadPIARPortableFileMock = vi.mocked(downloadPIARPortableFile);

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

const docxTemplate = {
  kind: 'url',
  url: '/institution-template.docx',
  sourceName: 'Ministerio de Educación Nacional',
} as const;

describe('DownloadButton', () => {
  beforeEach(() => {
    installEncryptedProgressStorageMocks();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('delegates PDF export to the portable download helper', async () => {
    downloadPIARPortableFileMock.mockResolvedValue();

    const user = userEvent.setup();
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Test Student';
    data.header.fechaDiligenciamiento = '2026-03-30';
    render(<DownloadButton getData={() => data} />);

    await user.click(screen.getByRole('button', { name: /^generar pdf$/i }));
    await user.click(screen.getByRole('button', { name: /continuar con pdf/i }));

    await waitFor(() => expect(downloadPIARPortableFileMock).toHaveBeenCalledTimes(1));
    expect(downloadPIARPortableFileMock).toHaveBeenCalledWith('pdf', data);
  });

  it('delegates DOCX export to the portable download helper', async () => {
    downloadPIARPortableFileMock.mockResolvedValue();

    const user = userEvent.setup();
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Test Student';
    render(<DownloadButton getData={() => data} docxTemplate={docxTemplate} />);

    await user.click(screen.getByRole('button', { name: /generar docx editable/i }));

    await waitFor(() => expect(downloadPIARPortableFileMock).toHaveBeenCalledTimes(1));
    expect(downloadPIARPortableFileMock).toHaveBeenCalledWith('docx', data, { docxTemplate });
  });

  it('forwards the trusted DOCX template source to the portable download helper', async () => {
    downloadPIARPortableFileMock.mockResolvedValue();

    const user = userEvent.setup();
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Test Student';
    render(<DownloadButton getData={() => data} docxTemplate={docxTemplate} />);

    await user.click(screen.getByRole('button', { name: /generar docx editable/i }));

    await waitFor(() => expect(downloadPIARPortableFileMock).toHaveBeenCalledTimes(1));
    expect(downloadPIARPortableFileMock).toHaveBeenCalledWith('docx', data, { docxTemplate });
  });

  it('aborts when the user declines the export warning', async () => {
    const user = userEvent.setup();
    const data = createEmptyPIARFormDataV2();
    render(<DownloadButton getData={() => data} />);

    await user.click(screen.getByRole('button', { name: /^generar pdf$/i }));
    expect(screen.getByRole('alertdialog', { name: /antes de exportar a pdf/i })).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(downloadPIARPortableFileMock).not.toHaveBeenCalled();
  });

  it('can remember the PDF warning acknowledgement', async () => {
    downloadPIARPortableFileMock.mockResolvedValue();

    const user = userEvent.setup();
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Test Student';
    render(<DownloadButton getData={() => data} />);

    await user.click(screen.getByRole('button', { name: /^generar pdf$/i }));
    await user.click(screen.getByLabelText(/no volver a mostrar este aviso/i));
    await user.click(screen.getByRole('button', { name: /continuar con pdf/i }));

    expect(localStorageMock.setItem).toHaveBeenCalledWith('piar-pdf-recovery-warning-ack', 'true');
    await waitFor(() => expect(downloadPIARPortableFileMock).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: /^generar pdf$/i }));

    expect(screen.queryByRole('alertdialog', { name: /antes de exportar a pdf/i })).toBeNull();
    await waitFor(() => expect(downloadPIARPortableFileMock).toHaveBeenCalledTimes(2));
  });

  it('chains the PDF warning into the missing-context confirmation before exporting', async () => {
    downloadPIARPortableFileMock.mockResolvedValue();

    const user = userEvent.setup();
    const data = createEmptyPIARFormDataV2();
    render(<DownloadButton getData={() => data} />);

    await user.click(screen.getByRole('button', { name: /^generar pdf$/i }));
    await user.click(screen.getByRole('button', { name: /continuar con pdf/i }));

    expect(screen.getByRole('alertdialog', { name: /faltan datos clave antes de exportar/i })).toBeDefined();
    await user.click(screen.getByRole('button', { name: /generar de todos modos/i }));

    await waitFor(() => expect(downloadPIARPortableFileMock).toHaveBeenCalledTimes(1));
    expect(downloadPIARPortableFileMock).toHaveBeenCalledWith('pdf', data);
  });

  it('shows an error message with icon when PDF generation fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    downloadPIARPortableFileMock.mockRejectedValueOnce(new Error('PDF engine failed'));

    const user = userEvent.setup();
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Test';
    render(<DownloadButton getData={() => data} />);

    await user.click(screen.getByRole('button', { name: /^generar pdf$/i }));
    await user.click(screen.getByRole('button', { name: /continuar con pdf/i }));

    const errorEl = await screen.findByText(/error al generar el pdf/i);
    expect(errorEl).toBeDefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error generating PDF:', expect.any(Error));
    // Error message should contain an icon for accessibility
    const container = errorEl.closest('p');
    expect(container?.querySelector('svg')).not.toBeNull();
  });

  it('shows a storage failure alert while still exporting the file', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    downloadPIARPortableFileMock.mockResolvedValue();

    const user = userEvent.setup();
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Test Student';
    render(<DownloadButton getData={() => data} docxTemplate={docxTemplate} />);

    await user.click(screen.getByRole('button', { name: /generar docx editable/i }));

    await waitFor(() => expect(downloadPIARPortableFileMock).toHaveBeenCalledWith('docx', data, { docxTemplate }));
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to save progress before export:',
      'quota_exceeded',
      'No se pudo guardar el progreso porque el almacenamiento local esta lleno.',
    );
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/no se pudo guardar el progreso porque el almacenamiento local esta lleno/i);
  });

  it('shows an unavailable message when no trusted DOCX template is configured', async () => {
    const data = createEmptyPIARFormDataV2();
    render(<DownloadButton getData={() => data} />);

    expect(screen.getByRole('button', { name: /generar docx editable/i }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByText(/el docx editable solo se habilita/i)).toBeDefined();
    expect(downloadPIARPortableFileMock).not.toHaveBeenCalled();
  });

  it('prompts when both name and institution are empty', async () => {
    const user = userEvent.setup();
    const data = createEmptyPIARFormDataV2();
    render(<DownloadButton getData={() => data} docxTemplate={docxTemplate} />);

    await user.click(screen.getByRole('button', { name: /generar docx editable/i }));
    expect(screen.getByRole('alertdialog', { name: /faltan datos clave antes de exportar/i })).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(downloadPIARPortableFileMock).not.toHaveBeenCalled();
  });
});
