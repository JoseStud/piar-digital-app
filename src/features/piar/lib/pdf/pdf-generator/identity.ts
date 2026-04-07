import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { getContentWidth, PDF_LAYOUT } from '@piar-digital-app/features/piar/lib/pdf/pdf-table-helpers';
import type { DrawContext } from './types';
import { drawCenteredText, drawTable, ensureSpace } from './tableRenderer';
import { formatBool } from './formatters';

const {
  fontSize,
  titleFontSize,
  lineHeight,
} = PDF_LAYOUT;

export function drawHeader(ctx: DrawContext, data: PIARFormDataV2): void {
  ctx.y -= 10;
  const h = data.header;
  const institution = h.institucionEducativa.trim().toUpperCase() || 'INSTITUCIÓN EDUCATIVA';
  drawCenteredText(ctx, institution, titleFontSize, ctx.fontBold);
  drawCenteredText(ctx, 'PLAN INDIVIDUAL DE AJUSTES RAZONABLES', fontSize + 1, ctx.fontBold);
  drawCenteredText(ctx, 'Decreto 1421 de 2017 — Anexo 2', fontSize, ctx.fontBold);
  ctx.y -= 6;

  const contentWidth = getContentWidth();
  const halfWidth = contentWidth / 2;

  drawTable(ctx, {
    bodyRows: [
      [`Fecha: ${h.fechaDiligenciamiento}`, `Lugar: ${h.lugarDiligenciamiento}`],
      [`Persona que diligencia: ${h.nombrePersonaDiligencia}`, `Rol: ${h.rolPersonaDiligencia}`],
      [`Institución Educativa: ${h.institucionEducativa}`, `Sede: ${h.sede}   Jornada: ${h.jornada}`],
    ],
    colWidths: [halfWidth, halfWidth],
  });
}

export function drawStudentData(ctx: DrawContext, data: PIARFormDataV2): void {
  ctx.y -= 5;
  ensureSpace(ctx, lineHeight + 4);
  drawCenteredText(ctx, 'DATOS DEL ESTUDIANTE', fontSize + 1, ctx.fontBold);

  const contentWidth = getContentWidth();
  const col4 = contentWidth / 4;
  const col3 = contentWidth / 3;
  const s = data.student;

  drawTable(ctx, {
    bodyRows: [[
      `Nombres: ${s.nombres}`,
      `Apellidos: ${s.apellidos}`,
      `Tipo ID: ${s.tipoIdentificacion}`,
      `No. Identificación: ${s.numeroIdentificacion}`,
    ]],
    colWidths: [col4, col4, col4, col4],
  });

  drawTable(ctx, {
    bodyRows: [[
      `Lugar nacimiento: ${s.lugarNacimiento}`,
      `Fecha nacimiento: ${s.fechaNacimiento}  Edad: ${s.edad}`,
      `Grado: ${s.grado}  Aspira ingresar: ${s.gradoAspiraIngresar}  Vinc. SE: ${formatBool(s.vinculadoSistemaAnterior)}`,
    ]],
    colWidths: [col3, col3, col3],
  });

  drawTable(ctx, {
    bodyRows: [[
      `Departamento: ${s.departamento}`,
      `Municipio: ${s.municipio}`,
      `Barrio: ${s.barrio}`,
      `Dirección: ${s.direccion}`,
    ]],
    colWidths: [col4, col4, col4, col4],
  });

  drawTable(ctx, {
    bodyRows: [[
      `Teléfono: ${s.telefono}`,
      `Correo: ${s.correo}`,
      `Víctima conflicto: ${formatBool(s.victimaConflicto)}  Registro: ${s.victimaConflictoRegistro}`,
    ]],
    colWidths: [col3, col3, col3],
  });

  drawTable(ctx, {
    bodyRows: [[
      `Centro protección: ${formatBool(s.centroProteccion)}  Lugar: ${s.centroProteccionLugar}`,
      `Grupo étnico: ${formatBool(s.grupoEtnico)}  Cuál: ${s.grupoEtnicoCual}`,
      ' ',
    ]],
    colWidths: [col3, col3, col3],
  });

  drawTable(ctx, {
    headerRow: ['Campo', 'Descripción'],
    bodyRows: [
      ['Capacidades', s.capacidades || ' '],
      ['Gustos e intereses', s.gustosIntereses || ' '],
      ['Expectativas del estudiante', s.expectativasEstudiante || ' '],
      ['Expectativas de la familia', s.expectativasFamilia || ' '],
      ['Redes de apoyo', s.redesApoyo || ' '],
    ],
    colWidths: [contentWidth * 0.3, contentWidth * 0.7],
    repeatHeaderOnPageBreak: true,
  });
}
