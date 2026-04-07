import type { PIARFormDataV2 } from '@/features/piar/model/piar';
import { deepMergeWithDefaultsV2 } from '@/features/piar/lib/data/data-utils';
import { buildPIARPdfPayload } from '@/features/piar/lib/pdf/pdf-payload';
import { createPdfContext, embedHiddenPayloadField } from './assembleDocument';
import { newPage } from './tableRenderer';
import { drawHeader, drawStudentData } from './identity';
import { drawEntornoSalud, drawEntornoHogar, drawEntornoEducativo } from './environments';
import { drawValoracionPedagogica, drawCompetenciasDispositivos, drawNarratives } from './assessment';
import { drawAjustesRazonables, drawSignatures, drawActaAcuerdo } from './planning';

export async function generatePIARPdf(data: PIARFormDataV2): Promise<Uint8Array> {
  const normalizedData = deepMergeWithDefaultsV2(data);
  const { doc, ctx, firstPage } = await createPdfContext();

  drawHeader(ctx, normalizedData);
  drawStudentData(ctx, normalizedData);
  drawEntornoSalud(ctx, normalizedData);
  drawEntornoHogar(ctx, normalizedData);
  drawEntornoEducativo(ctx, normalizedData);
  drawValoracionPedagogica(ctx, normalizedData);
  drawCompetenciasDispositivos(ctx, normalizedData);
  drawNarratives(ctx, normalizedData);
  drawAjustesRazonables(ctx, normalizedData);
  drawSignatures(ctx, normalizedData);
  newPage(ctx);
  drawActaAcuerdo(ctx, normalizedData);

  const payload = buildPIARPdfPayload(normalizedData);
  embedHiddenPayloadField(doc, firstPage, payload);

  // The widget is always hidden, so appearance generation is unnecessary and
  // becomes expensive for large JSON payloads.
  return doc.save({ updateFieldAppearances: false });
}
