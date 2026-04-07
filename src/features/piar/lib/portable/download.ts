import type { PIARPortableFormat } from '@/features/piar/lib/portable/format';
import type { PIARFormDataV2 } from '@/features/piar/model/piar';
import { saveBinaryFile } from '@/shared/lib/save-file';

function getPortableFileConfig(format: PIARPortableFormat): {
  mimeType: string;
  fileTypeLabel: string;
  extensions: string[];
} {
  if (format === 'docx') {
    return {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileTypeLabel: 'DOCX editable PIAR',
      extensions: ['docx'],
    };
  }

  return {
    mimeType: 'application/pdf',
    fileTypeLabel: 'PDF PIAR',
    extensions: ['pdf'],
  };
}

export function buildPIARExportBaseName(data: PIARFormDataV2): string {
  const nombreVal = `${data.student.nombres} ${data.student.apellidos}`.trim();
  const nombre = nombreVal || 'sin_nombre';
  const fecha = data.header.fechaDiligenciamiento || new Date().toISOString().slice(0, 10);
  const safeName = nombre.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ _-]/g, '').replace(/\s+/g, '_');

  return `PIAR_${safeName}_${fecha}`;
}

export async function downloadPIARPortableFile(
  format: PIARPortableFormat,
  data: PIARFormDataV2,
): Promise<void> {
  const { mimeType, fileTypeLabel, extensions } = getPortableFileConfig(format);
  const bytes = format === 'docx'
    ? await (await import('@/features/piar/lib/docx/docx-generator')).generatePIARDocx(data)
    : await (await import('@/features/piar/lib/pdf/pdf-generator')).generatePIARPdf(data);

  await saveBinaryFile({
    bytes,
    fileName: `${buildPIARExportBaseName(data)}.${format}`,
    mimeType,
    fileTypeLabel,
    extensions,
  });
}
