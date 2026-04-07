import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import {
  VALORACION_ASPECTOS,
  COMPETENCIAS_GRUPOS,
} from '@piar-digital-app/features/piar/content/assessment-catalogs';
import { getContentWidth, PDF_LAYOUT } from '@piar-digital-app/features/piar/lib/pdf/pdf-table-helpers';
import type { DrawContext } from './types';
import { drawCenteredText, drawTable, ensureSpace } from './tableRenderer';

const {
  fontSize,
  lineHeight,
} = PDF_LAYOUT;

export function drawValoracionPedagogica(ctx: DrawContext, data: PIARFormDataV2): void {
  ctx.y -= 5;
  ensureSpace(ctx, lineHeight + 4);
  drawCenteredText(ctx, 'VALORACIÓN PEDAGÓGICA', fontSize + 1, ctx.fontBold);

  const contentWidth = getContentWidth();
  const labelCol = contentWidth * 0.6;
  const answerCol = contentWidth * 0.4;
  const vp = data.valoracionPedagogica;

  for (const aspecto of VALORACION_ASPECTOS) {
    const aspect = vp[aspecto.key];
    const bodyRows: string[][] = aspecto.questions.map((q) => {
      const answer = aspect.respuestas[q.id];
      return [q.label, answer === null || answer === undefined ? '—' : answer ? 'Sí' : 'No'];
    });

    bodyRows.push(['Intensidad de apoyo', aspect.intensidad ?? '—']);
    bodyRows.push(['Observación', aspect.observacion || ' ']);

    drawTable(ctx, {
      gapBefore: 4,
      headerRow: [aspecto.label, 'Respuesta'],
      bodyRows,
      colWidths: [labelCol, answerCol],
      repeatHeaderOnPageBreak: true,
    });
  }

  if (vp.observacionesGenerales) {
    drawTable(ctx, {
      gapBefore: 4,
      headerRow: ['Observaciones Generales'],
      bodyRows: [[vp.observacionesGenerales]],
      colWidths: [contentWidth],
    });
  }
}

export function drawCompetenciasDispositivos(ctx: DrawContext, data: PIARFormDataV2): void {
  ctx.y -= 5;
  ensureSpace(ctx, lineHeight + 4);
  drawCenteredText(ctx, 'COMPETENCIAS Y DISPOSITIVOS DE APRENDIZAJE', fontSize + 1, ctx.fontBold);

  const contentWidth = getContentWidth();
  const labelCol = contentWidth * 0.8;
  const answerCol = contentWidth * 0.2;
  const cd = data.competenciasDispositivos;

  for (const grupo of COMPETENCIAS_GRUPOS) {
    const groupData = cd[grupo.key];
    const bodyRows: string[][] = grupo.items.map((item) => {
      const val = groupData[item.id];
      return [item.label, val === null || val === undefined ? '—' : val ? 'Sí' : 'No'];
    });

    drawTable(ctx, {
      gapBefore: 4,
      headerRow: [grupo.label, 'Sí/No'],
      bodyRows,
      colWidths: [labelCol, answerCol],
      repeatHeaderOnPageBreak: true,
    });
  }

  if (cd.observacionesCompetencias) {
    drawTable(ctx, {
      gapBefore: 4,
      headerRow: ['Observaciones – Competencias y Dispositivos'],
      bodyRows: [[cd.observacionesCompetencias]],
      colWidths: [contentWidth],
    });
  }
}

export function drawNarratives(ctx: DrawContext, data: PIARFormDataV2): void {
  ctx.y -= 5;
  ensureSpace(ctx, lineHeight + 4);
  drawCenteredText(ctx, 'NARRATIVAS Y ESTRATEGIAS', fontSize + 1, ctx.fontBold);

  const contentWidth = getContentWidth();

  drawTable(ctx, {
    gapBefore: 4,
    headerRow: ['Descripción de Habilidades'],
    bodyRows: [[data.descripcionHabilidades || ' ']],
    colWidths: [contentWidth],
    repeatHeaderOnPageBreak: true,
  });

  drawTable(ctx, {
    gapBefore: 4,
    headerRow: ['Estrategias y Acciones'],
    bodyRows: [[data.estrategiasAcciones || ' ']],
    colWidths: [contentWidth],
    repeatHeaderOnPageBreak: true,
  });

  drawTable(ctx, {
    gapBefore: 4,
    bodyRows: [[`Fecha sugerida de próxima revisión: ${data.fechaProximaRevision || '—'}`]],
    colWidths: [contentWidth],
  });
}
