/**
 * Renders the planning sections (ajustes razonables table, signatures
 * block, acta de acuerdo) onto PDF pages. Handles fixed-length tuple
 * iteration (5 ajustes rows, 9 docente signatures, 5 activity rows).
 */
import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { getContentWidth, PDF_LAYOUT } from '@piar-digital-app/features/piar/lib/pdf/pdf-table-helpers';
import type { DrawContext } from './types';
import { drawCenteredText, drawTable, ensureSpace } from './tableRenderer';
import { formatStudentFullName } from './formatters';

const {
  fontSize,
  titleFontSize,
  lineHeight,
  tableNumberColumnWidth,
} = PDF_LAYOUT;

/** Renders the planning sections onto the active PDF pages. */
export function drawAjustesRazonables(ctx: DrawContext, data: PIARFormDataV2): void {
  ctx.y -= 5;
  ensureSpace(ctx, lineHeight + 4);
  drawCenteredText(ctx, 'AJUSTES RAZONABLES', fontSize + 1, ctx.fontBold);

  const contentWidth = getContentWidth();
  const numCol = tableNumberColumnWidth;
  const remaining = contentWidth - numCol;
  const areaCol = remaining * 0.15;
  const barrerasCol = remaining * 0.2;
  const tipoCol = remaining * 0.15;
  const apoyoCol = remaining * 0.15;
  const descCol = remaining * 0.2;
  const seguimientoCol = remaining - areaCol - barrerasCol - tipoCol - apoyoCol - descCol;

  drawTable(ctx, {
    gapBefore: 4,
    headerRow: ['#', 'Área', 'Barreras', 'Tipo Ajuste', 'Apoyo Requerido', 'Descripción', 'Seguimiento'],
    bodyRows: data.ajustes.map((row, i) => [
      String(i + 1),
      row.area,
      row.barreras,
      row.tipoAjuste,
      row.apoyoRequerido,
      row.descripcion,
      row.seguimiento,
    ]),
    colWidths: [numCol, areaCol, barrerasCol, tipoCol, apoyoCol, descCol, seguimientoCol],
    repeatHeaderOnPageBreak: true,
  });
}

/** Renders the signature blocks onto the active PDF pages. */
export function drawSignatures(ctx: DrawContext, data: PIARFormDataV2): void {
  ctx.y -= 5;
  ensureSpace(ctx, lineHeight + 4);
  drawCenteredText(ctx, 'FIRMAS', fontSize + 1, ctx.fontBold);

  const contentWidth = getContentWidth();
  const col3 = contentWidth / 3;
  const f = data.firmas;

  for (let group = 0; group < 3; group++) {
    const d0 = f.docentes[group * 3];
    const d1 = f.docentes[group * 3 + 1];
    const d2 = f.docentes[group * 3 + 2];

    drawTable(ctx, {
      gapBefore: group === 0 ? 4 : 8,
      headerRow: ['Docente', 'Docente', 'Docente'],
      bodyRows: [
        [
          `Nombre: ${d0.nombre}`,
          `Nombre: ${d1.nombre}`,
          `Nombre: ${d2.nombre}`,
        ],
        [
          `Área: ${d0.area}`,
          `Área: ${d1.area}`,
          `Área: ${d2.area}`,
        ],
        [
          `Firma: ${d0.firma}`,
          `Firma: ${d1.firma}`,
          `Firma: ${d2.firma}`,
        ],
      ],
      colWidths: [col3, col3, col3],
    });
  }

  drawTable(ctx, {
    gapBefore: 8,
    headerRow: ['Docente Orientador', 'Docente Apoyo Pedagógico', 'Coordinador Pedagógico'],
    bodyRows: [
      [
        `Nombre: ${f.docenteOrientador.nombre}`,
        `Nombre: ${f.docenteApoyoPedagogico.nombre}`,
        `Nombre: ${f.coordinadorPedagogico.nombre}`,
      ],
      [
        `Área: ${f.docenteOrientador.area}`,
        `Área: ${f.docenteApoyoPedagogico.area}`,
        `Área: ${f.coordinadorPedagogico.area}`,
      ],
      [
        `Firma: ${f.docenteOrientador.firma}`,
        `Firma: ${f.docenteApoyoPedagogico.firma}`,
        `Firma: ${f.coordinadorPedagogico.firma}`,
      ],
    ],
    colWidths: [col3, col3, col3],
  });

  const half = contentWidth / 2;
  drawTable(ctx, {
    gapBefore: 8,
    headerRow: ['Firmante PIAR', 'Firmante Acudiente'],
    bodyRows: [[f.firmantePIAR || ' ', f.firmanteAcudiente || ' ']],
    colWidths: [half, half],
  });
}

/** Renders the agreement acta onto the final PDF page. */
export function drawActaAcuerdo(ctx: DrawContext, data: PIARFormDataV2): void {
  const contentWidth = getContentWidth();
  const half = contentWidth / 2;
  const a = data.acta;
  const h = data.header;
  const s = data.student;
  const studentFullName = formatStudentFullName(s);

  drawCenteredText(ctx, 'ACTA DE ACUERDO', titleFontSize, ctx.fontBold);
  ctx.y -= 6;

  drawTable(ctx, {
    bodyRows: [
      [`Fecha: ${h.fechaDiligenciamiento}`, `Lugar: ${h.lugarDiligenciamiento}`],
      [`Persona que diligencia: ${h.nombrePersonaDiligencia}`, `Rol: ${h.rolPersonaDiligencia}`],
      [`Institución Educativa: ${h.institucionEducativa}`, `Sede: ${h.sede}   Jornada: ${h.jornada}`],
    ],
    colWidths: [half, half],
  });

  drawTable(ctx, {
    gapBefore: 4,
    bodyRows: [[
      `Estudiante: ${studentFullName}`,
      `Edad: ${s.edad}`,
      `Grado: ${s.grado}`,
    ]],
    colWidths: [contentWidth * 0.5, contentWidth * 0.25, contentWidth * 0.25],
  });

  drawTable(ctx, {
    gapBefore: 4,
    headerRow: ['Equipo directivos y docentes', 'Familia participante', 'Parentesco'],
    bodyRows: [[
      a.equipoDirectivosDocentes || ' ',
      a.familiaParticipante || ' ',
      a.parentescoFamiliaParticipante || ' ',
    ]],
    colWidths: [contentWidth * 0.4, contentWidth * 0.4, contentWidth * 0.2],
  });

  drawTable(ctx, {
    gapBefore: 4,
    headerRow: ['Compromisos'],
    bodyRows: [[a.compromisos || ' ']],
    colWidths: [contentWidth],
    repeatHeaderOnPageBreak: true,
  });

  const numCol = tableNumberColumnWidth;
  const actRemaining = contentWidth - numCol;
  drawTable(ctx, {
    gapBefore: 4,
    headerRow: ['#', 'Actividad', 'Descripción', 'Frecuencia'],
    bodyRows: a.actividades.map((act, i) => [
      String(i + 1),
      act.nombre,
      act.descripcion,
      act.frecuencia,
    ]),
    colWidths: [numCol, actRemaining * 0.25, actRemaining * 0.5, actRemaining * 0.25],
    repeatHeaderOnPageBreak: true,
  });

  const col4 = contentWidth / 4;
  drawTable(ctx, {
    gapBefore: 8,
    headerRow: ['Estudiante', 'Acudiente', 'Docentes', 'Directivo'],
    bodyRows: [[
      a.firmaEstudiante || ' ',
      a.firmaAcudiente || ' ',
      a.firmaDocentes || ' ',
      a.firmaDirectivo || ' ',
    ]],
    colWidths: [col4, col4, col4, col4],
  });
}
