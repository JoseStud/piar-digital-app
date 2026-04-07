import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadZone } from '@piar-digital-app/features/piar/components/pdf/UploadZone';
import { importPIARPdf } from '@piar-digital-app/features/piar/lib/pdf/pdf-importer';
import { importPIARDocx } from '@piar-digital-app/features/piar/lib/docx/docx-importer';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

vi.mock('@piar-digital-app/features/piar/lib/pdf/pdf-importer', async () => {
  const actual = await vi.importActual<typeof import('@piar-digital-app/features/piar/lib/pdf/pdf-importer')>('@piar-digital-app/features/piar/lib/pdf/pdf-importer');
  return {
    ...actual,
    importPIARPdf: vi.fn(),
  };
});

vi.mock('@piar-digital-app/features/piar/lib/docx/docx-importer', async () => {
  const actual = await vi.importActual<typeof import('@piar-digital-app/features/piar/lib/docx/docx-importer')>('@piar-digital-app/features/piar/lib/docx/docx-importer');
  return {
    ...actual,
    importPIARDocx: vi.fn(),
  };
});

const importPIARPdfMock = vi.mocked(importPIARPdf);
const importPIARDocxMock = vi.mocked(importPIARDocx);

function createPdfFile(name: string, type: string): File {
  const file = new File(['pdf'], name, { type });
  Object.defineProperty(file, 'arrayBuffer', {
    value: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
  });
  return file;
}

function createDocxFile(name: string, type: string): File {
  const file = new File(['docx'], name, { type });
  Object.defineProperty(file, 'arrayBuffer', {
    value: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
  });
  return file;
}

describe('UploadZone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('accepts PDFs even when the browser omits the MIME type', async () => {
    const user = userEvent.setup();
    importPIARPdfMock.mockResolvedValue({
      ok: true,
      data: createEmptyPIARFormDataV2(),
      warnings: [],
    });

    render(<UploadZone onImport={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, createPdfFile('restaurar.PDF', ''));

    expect(importPIARPdfMock).toHaveBeenCalledTimes(1);
  });

  it('accepts DOCX files and routes them to the DOCX importer', async () => {
    const user = userEvent.setup();
    importPIARDocxMock.mockResolvedValue({
      ok: true,
      data: createEmptyPIARFormDataV2(),
      warnings: [],
    });

    render(<UploadZone onImport={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(
      input,
      createDocxFile('restaurar.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    );

    expect(importPIARDocxMock).toHaveBeenCalledTimes(1);
  });

  it('allows selecting the same file twice after a failed import', async () => {
    const user = userEvent.setup();
    importPIARPdfMock.mockResolvedValue({
      ok: false,
      code: 'not_piar',
    });

    render(<UploadZone onImport={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createPdfFile('restaurar.pdf', 'application/pdf');

    await user.upload(input, file);
    await user.upload(input, file);

    expect(importPIARPdfMock).toHaveBeenCalledTimes(2);
  });

  it('opens the file picker when the full drop zone is clicked', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});

    render(<UploadZone onImport={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /importar docx o pdf piar generado anteriormente/i }));

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('shows a specific message for unsupported versions', async () => {
    const user = userEvent.setup();
    importPIARPdfMock.mockResolvedValue({
      ok: false,
      code: 'unsupported_version',
    });

    render(<UploadZone onImport={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, createPdfFile('nuevo.pdf', 'application/pdf'));

    expect((await screen.findByRole('alert')).textContent).toContain('versión incompatible');
  });

  it('shows a specific message for corrupt data', async () => {
    const user = userEvent.setup();
    importPIARPdfMock.mockResolvedValue({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });

    render(<UploadZone onImport={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, createPdfFile('dañado.pdf', 'application/pdf'));

    expect((await screen.findByRole('alert')).textContent).toContain('incompletos o corruptos');
  });
});
