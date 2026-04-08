/**
 * Renders the three environment sections (entornoSalud, entornoHogar,
 * entornoEducativo) onto PDF pages. Uses `tableRenderer` for the salud
 * row tuples and free-text rendering for the rest.
 */
import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { getContentWidth, PDF_LAYOUT } from '@piar-digital-app/features/piar/lib/pdf/pdf-table-helpers';
import type { DrawContext } from './types';
import { drawCenteredText, drawTable, ensureSpace } from './tableRenderer';
import { formatBool } from './formatters';

const {
  fontSize,
  lineHeight,
} = PDF_LAYOUT;

/** Renders the health environment section onto the active PDF page. */
export function drawEntornoSalud(ctx: DrawContext, data: PIARFormDataV2): void {
  ctx.y -= 5;
  ensureSpace(ctx, lineHeight + 4);
  drawCenteredText(ctx, 'ENTORNO SALUD', fontSize + 1, ctx.fontBold);

  const contentWidth = getContentWidth();
  const half = contentWidth / 2;
  const es = data.entornoSalud;

  drawTable(ctx, {
    bodyRows: [
      [`Afiliación salud: ${formatBool(es.afiliacionSalud)}`, `Régimen: ${es.regimen ?? '—'}  ${es.regimenCual}  EPS: ${es.eps}`],
      [`Diagnóstico médico: ${formatBool(es.diagnosticoMedico)}`, `¿Cuál?: ${es.diagnosticoCual}`],
      [`Frecuencia sector salud: ${es.sectorSaludFrecuencia}`, `Tratamiento médico: ${es.tratamientoMedicoCual}`],
      [`Lugar atención emergencia: ${es.lugarAtencionEmergencia}`, `Apoyos técnicos: ${formatBool(es.apoyosTecnicos)}  ${es.apoyosTecnicosCuales}`],
    ],
    colWidths: [half, half],
  });

  const col4 = contentWidth / 4;
  drawTable(ctx, {
    headerRow: ['Atención médica', 'Aplica', 'Cuál', 'Frecuencia / Horario'],
    bodyRows: es.atencionMedica.map((row, i) => [
      `Atención ${i + 1}`,
      formatBool(row.aplica),
      row.cual,
      `${row.frecuencia} ${row.horario}`.trim(),
    ]),
    colWidths: [col4, col4 * 0.5, col4 * 1.5, col4],
  });

  drawTable(ctx, {
    headerRow: ['Tratamiento terapéutico', 'Aplica', 'Cuál', 'Frecuencia / Horario'],
    bodyRows: es.tratamientoTerapeutico.map((row, i) => [
      `Tratamiento ${i + 1}`,
      formatBool(row.aplica),
      row.cual,
      `${row.frecuencia} ${row.horario}`.trim(),
    ]),
    colWidths: [col4, col4 * 0.5, col4 * 1.5, col4],
  });

  drawTable(ctx, {
    headerRow: ['Medicamentos', 'Aplica', 'Cuál', 'Frecuencia / Horario'],
    bodyRows: es.medicamentos.map((row, i) => [
      `Medicamento ${i + 1}`,
      formatBool(row.aplica),
      row.cual,
      `${row.frecuencia} ${row.horario}`.trim(),
    ]),
    colWidths: [col4, col4 * 0.5, col4 * 1.5, col4],
  });
}

/** Renders the home environment section onto the active PDF page. */
export function drawEntornoHogar(ctx: DrawContext, data: PIARFormDataV2): void {
  ctx.y -= 5;
  ensureSpace(ctx, lineHeight + 4);
  drawCenteredText(ctx, 'ENTORNO HOGAR', fontSize + 1, ctx.fontBold);

  const contentWidth = getContentWidth();
  const col3 = contentWidth / 3;
  const half = contentWidth / 2;
  const eh = data.entornoHogar;

  drawTable(ctx, {
    headerRow: ['Madre', 'Padre', 'Cuidador principal'],
    bodyRows: [
      [
        `Nombre: ${eh.nombreMadre}`,
        `Nombre: ${eh.nombrePadre}`,
        `Nombre: ${eh.nombreCuidador}`,
      ],
      [
        `Ocupación: ${eh.ocupacionMadre}  Nivel educativo: ${eh.nivelEducativoMadre}`,
        `Ocupación: ${eh.ocupacionPadre}  Nivel educativo: ${eh.nivelEducativoPadre}`,
        `Parentesco: ${eh.parentescoCuidador}  Nivel educativo: ${eh.nivelEducativoCuidador}`,
      ],
    ],
    colWidths: [col3, col3, col3],
  });

  drawTable(ctx, {
    bodyRows: [
      [`Teléfono cuidador: ${eh.telefonoCuidador}`, `Correo cuidador: ${eh.correoCuidador}`],
      [`No. hermanos: ${eh.numHermanos}  Lugar que ocupa: ${eh.lugarQueOcupa}`, `Personas con quienes vive: ${eh.personasConQuienVive}`],
      [`Bajo protección: ${formatBool(eh.estaBajoProteccion)}`, `Subsidio: ${eh.subsidioEntidad}  ${eh.subsidioCual}`],
      [`Quiénes apoyan la crianza: ${eh.quienesApoyaCrianza}`, ' '],
    ],
    colWidths: [half, half],
  });
}

/** Renders the educational environment section onto the active PDF page. */
export function drawEntornoEducativo(ctx: DrawContext, data: PIARFormDataV2): void {
  ctx.y -= 5;
  ensureSpace(ctx, lineHeight + 4);
  drawCenteredText(ctx, 'ENTORNO EDUCATIVO', fontSize + 1, ctx.fontBold);

  const contentWidth = getContentWidth();
  const half = contentWidth / 2;
  const ee = data.entornoEducativo;

  drawTable(ctx, {
    bodyRows: [
      [
        `Vinculado a otra institución: ${formatBool(ee.vinculadoOtraInstitucion)}`,
        `Instituciones anteriores: ${ee.institucionesAnteriores}  Motivo no vinculación: ${ee.noVinculacionMotivo}`,
      ],
      [
        `Último grado cursado: ${ee.ultimoGradoCursado}  Estado: ${ee.estadoGrado ?? '—'}`,
        `Observaciones historial: ${ee.observacionesHistorial}`,
      ],
      [
        `Recibe informe pedagógico: ${formatBool(ee.recibeInformePedagogico)}  Institución: ${ee.institucionInforme}`,
        `Programas complementarios: ${formatBool(ee.programasComplementarios)}  Cuáles: ${ee.programasCuales}`,
      ],
      [
        `Medio de transporte: ${ee.medioTransporte}`,
        `Distancia y tiempo: ${ee.distanciaTiempo}`,
      ],
    ],
    colWidths: [half, half],
  });
}
