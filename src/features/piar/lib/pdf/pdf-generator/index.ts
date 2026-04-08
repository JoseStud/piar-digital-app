/**
 * Public entry point for the from-scratch PIAR PDF generator.
 *
 * Calls `assembleDocument` to draw every section, embeds the source
 * form data as JSON in the hidden `piar_app_state` field for round-trip
 * support, and returns the resulting PDF bytes. Re-importing the
 * generated file restores the exact form state.
 *
 * @see ./assembleDocument.ts - the page assembly orchestrator
 * @see ../pdf-importer.ts - the round-trip companion
 * @see ../pdf-payload.ts - the hidden-field embedding constants
 */
import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { deepMergeWithDefaultsV2 } from '@piar-digital-app/features/piar/lib/data/data-utils';
import { buildPIARPdfPayload } from '@piar-digital-app/features/piar/lib/pdf/pdf-payload';
import { createPdfContext, embedHiddenPayloadField } from './assembleDocument';
import { newPage } from './tableRenderer';
import { drawHeader, drawStudentData } from './identity';
import { drawEntornoSalud, drawEntornoHogar, drawEntornoEducativo } from './environments';
import { drawValoracionPedagogica, drawCompetenciasDispositivos, drawNarratives } from './assessment';
import { drawAjustesRazonables, drawSignatures, drawActaAcuerdo } from './planning';

/** Generates the PIAR PDF and embeds the source payload for round-trip import. */
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
