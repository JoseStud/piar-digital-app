import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadPIARPortableFile } from '@/features/piar/lib/portable/download';
import { createEmptyPIARFormDataV2 } from '@/features/piar/model/piar';
import { generatePIARPdf } from '@/features/piar/lib/pdf/pdf-generator';
import { generatePIARDocx } from '@/features/piar/lib/docx/docx-generator';

vi.mock('@/features/piar/lib/pdf/pdf-generator', () => ({
  generatePIARPdf: vi.fn(),
}));

vi.mock('@/features/piar/lib/docx/docx-generator', () => ({
  generatePIARDocx: vi.fn(),
}));

const generatePIARPdfMock = vi.mocked(generatePIARPdf);
const generatePIARDocxMock = vi.mocked(generatePIARDocx);

describe('downloadPIARPortableFile', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    if (!('createObjectURL' in URL)) {
      Object.defineProperty(URL, 'createObjectURL', {
        configurable: true,
        writable: true,
        value: () => 'blob:fake',
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
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete window.__TAURI__;
  });

  it('generates a PDF and triggers a download with a contextual filename', async () => {
    generatePIARPdfMock.mockResolvedValue(new Uint8Array([37, 80, 68, 70]));

    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Test Student';
    data.header.fechaDiligenciamiento = '2026-03-30';

    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(HTMLAnchorElement.prototype, 'remove');

    await downloadPIARPortableFile('pdf', data);
    await vi.runAllTimersAsync();

    expect(generatePIARPdfMock).toHaveBeenCalledTimes(1);
    expect(generatePIARPdfMock).toHaveBeenCalledWith(data);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    expect(appendChildSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake');

    const appendedLink = appendChildSpy.mock.calls[0]?.[0];
    expect(appendedLink).toBeInstanceOf(HTMLAnchorElement);
    expect((appendedLink as HTMLAnchorElement).download).toBe('PIAR_Test_Student_2026-03-30.pdf');
  });

  it('generates a DOCX and triggers a download with the matching extension', async () => {
    generatePIARDocxMock.mockResolvedValue(new Uint8Array([80, 75, 3, 4]));

    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Test Student';
    data.header.fechaDiligenciamiento = '2026-03-30';

    const appendChildSpy = vi.spyOn(document.body, 'appendChild');

    await downloadPIARPortableFile('docx', data);
    await vi.runAllTimersAsync();

    expect(generatePIARDocxMock).toHaveBeenCalledTimes(1);
    expect(generatePIARDocxMock).toHaveBeenCalledWith(data);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);

    const appendedLink = appendChildSpy.mock.calls[0]?.[0];
    expect(appendedLink).toBeInstanceOf(HTMLAnchorElement);
    expect((appendedLink as HTMLAnchorElement).download).toBe('PIAR_Test_Student_2026-03-30.docx');
  });

  it('uses the desktop save command when the Tauri runtime is available', async () => {
    generatePIARDocxMock.mockResolvedValue(new Uint8Array([80, 75, 3, 4]));

    const invoke = vi.fn().mockResolvedValue(true);
    window.__TAURI__ = {
      core: { invoke },
    };

    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Test Student';
    data.header.fechaDiligenciamiento = '2026-03-30';

    const appendChildSpy = vi.spyOn(document.body, 'appendChild');

    await downloadPIARPortableFile('docx', data);

    expect(generatePIARDocxMock).toHaveBeenCalledTimes(1);
    expect(invoke).toHaveBeenCalledWith('save_binary_file', {
      bytes: [80, 75, 3, 4],
      suggestedName: 'PIAR_Test_Student_2026-03-30.docx',
      fileTypeLabel: 'DOCX editable PIAR',
      extensions: ['docx'],
    });
    expect(appendChildSpy).not.toHaveBeenCalled();
  });
});
