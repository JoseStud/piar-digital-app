import {
  OPTION_TAG_SEPARATOR,
  createCheckboxControl,
  getCell,
  getRow,
  getTable,
  setCellContent,
  setCellToInlineSegments,
  setCellToIntensityAndObservation,
} from './shared';
import type { ControlFactory } from '../docx-shared/control-builders';
import { createBlockTextControl } from '../docx-shared/control-builders';
import { createParagraph } from '../docx-shared/xml-primitives';

// ─────────────────────────────────────────────
// Section: Pedagogical Assessment Instrumentation
// ─────────────────────────────────────────────

export function instrumentAssessment(body: Element, doc: Document, factory: ControlFactory): void {
  const table = getTable(body, 6);

  const questionPaths = [
    ['valoracionPedagogica.movilidad.respuestas.mov_1', 2],
    ['valoracionPedagogica.movilidad.respuestas.mov_2', 3],
    ['valoracionPedagogica.movilidad.respuestas.mov_3', 4],
    ['valoracionPedagogica.movilidad.respuestas.mov_4', 5],
    ['valoracionPedagogica.movilidad.respuestas.mov_5', 6],
    ['valoracionPedagogica.comunicacion.respuestas.com_1', 9],
    ['valoracionPedagogica.comunicacion.respuestas.com_2', 10],
    ['valoracionPedagogica.comunicacion.respuestas.com_3', 11],
    ['valoracionPedagogica.accesoInformacion.respuestas.acc_1', 14],
    ['valoracionPedagogica.accesoInformacion.respuestas.acc_2', 15],
    ['valoracionPedagogica.interaccionSocial.respuestas.int_1', 18],
    ['valoracionPedagogica.interaccionSocial.respuestas.int_2', 19],
    ['valoracionPedagogica.academicoPedagogico.respuestas.aca_1', 22],
    ['valoracionPedagogica.academicoPedagogico.respuestas.aca_2', 23],
  ] as const;

  for (const [path, rowIndex] of questionPaths) {
    setCellToInlineSegments(getCell(getRow(table, rowIndex), 1), doc, [
      createCheckboxControl(doc, factory, `${path}${OPTION_TAG_SEPARATOR}true`, `${path} · Sí`),
      ' SI',
    ], { align: 'center' });
    setCellToInlineSegments(getCell(getRow(table, rowIndex), 2), doc, [
      createCheckboxControl(doc, factory, `${path}${OPTION_TAG_SEPARATOR}false`, `${path} · No`),
      ' NO',
    ], { align: 'center' });
  }

  setCellToIntensityAndObservation(
    getCell(getRow(table, 7), 0),
    doc,
    factory,
    'valoracionPedagogica.movilidad.intensidad',
    'valoracionPedagogica.movilidad.observacion',
    'Observación de movilidad',
  );
  setCellToIntensityAndObservation(
    getCell(getRow(table, 12), 0),
    doc,
    factory,
    'valoracionPedagogica.comunicacion.intensidad',
    'valoracionPedagogica.comunicacion.observacion',
    'Observación de comunicación',
  );
  setCellToIntensityAndObservation(
    getCell(getRow(table, 16), 0),
    doc,
    factory,
    'valoracionPedagogica.accesoInformacion.intensidad',
    'valoracionPedagogica.accesoInformacion.observacion',
    'Observación de acceso a la información',
  );
  setCellToIntensityAndObservation(
    getCell(getRow(table, 20), 0),
    doc,
    factory,
    'valoracionPedagogica.interaccionSocial.intensidad',
    'valoracionPedagogica.interaccionSocial.observacion',
    'Observación de interacción social',
  );
  setCellToIntensityAndObservation(
    getCell(getRow(table, 24), 0),
    doc,
    factory,
    'valoracionPedagogica.academicoPedagogico.intensidad',
    'valoracionPedagogica.academicoPedagogico.observacion',
    'Observación académico-pedagógica',
  );

  setCellContent(getCell(getRow(table, 26), 0), [
    createBlockTextControl(
      doc,
      factory,
      'valoracionPedagogica.observacionesGenerales',
      'Observaciones generales',
      'rich',
    ),
  ]);
}

// ─────────────────────────────────────────────
// Section: Competencies Instrumentation
// ─────────────────────────────────────────────

export function instrumentCompetencies(body: Element, doc: Document, factory: ControlFactory): void {
  const table = getTable(body, 7);
  const rowMappings = [
    ['competenciasDispositivos.competenciasLectoras02.cl02_1', 1],
    ['competenciasDispositivos.competenciasLectoras02.cl02_2', 2],
    ['competenciasDispositivos.competenciasLectoras02.cl02_3', 3],
    ['competenciasDispositivos.competenciasLectoras02.cl02_4', 4],
    ['competenciasDispositivos.competenciasLectoras02.cl02_5', 5],
    ['competenciasDispositivos.competenciasLectoras02.cl02_6', 6],
    ['competenciasDispositivos.competenciasLectoras02.cl02_7', 7],
    ['competenciasDispositivos.competenciasLectoras02.cl02_8', 8],
    ['competenciasDispositivos.competenciasLectoras02.cl02_9', 9],
    ['competenciasDispositivos.competenciasLectoras02.cl02_10', 10],
    ['competenciasDispositivos.competenciasLectoras02.cl02_11', 11],
    ['competenciasDispositivos.competenciasLectoras02.cl02_12', 12],
    ['competenciasDispositivos.competenciasLectoras02.cl02_13', 13],
    ['competenciasDispositivos.competenciasLectoras02.cl02_14', 14],
    ['competenciasDispositivos.competenciasLectoras02.cl02_15', 15],
    ['competenciasDispositivos.competenciasLectoras02.cl02_16', 16],
    ['competenciasDispositivos.competenciasLectoras02.cl02_17', 17],
    ['competenciasDispositivos.competenciasLectoras02.cl02_18', 18],
    ['competenciasDispositivos.competenciasLectoras311.cl311_1', 21],
    ['competenciasDispositivos.competenciasLectoras311.cl311_2', 22],
    ['competenciasDispositivos.competenciasLectoras311.cl311_3', 23],
    ['competenciasDispositivos.competenciasLectoras311.cl311_4', 24],
    ['competenciasDispositivos.competenciasLectoras311.cl311_5', 25],
    ['competenciasDispositivos.competenciasLectoras311.cl311_6', 26],
    ['competenciasDispositivos.competenciasLectoras311.cl311_7', 27],
    ['competenciasDispositivos.competenciasLectoras311.cl311_8', 28],
    ['competenciasDispositivos.competenciasLectoras311.cl311_9', 30],
    ['competenciasDispositivos.competenciasLectoras311.cl311_10', 31],
    ['competenciasDispositivos.competenciasLectoras311.cl311_11', 32],
    ['competenciasDispositivos.competenciasLectoras311.cl311_12', 33],
    ['competenciasDispositivos.competenciasLectoras311.cl311_13', 34],
    ['competenciasDispositivos.competenciasLectoras311.cl311_14', 35],
    ['competenciasDispositivos.competenciasLectoras311.cl311_15', 37],
    ['competenciasDispositivos.competenciasLectoras311.cl311_16', 38],
    ['competenciasDispositivos.competenciasMatematicas.cm_1', 41],
    ['competenciasDispositivos.competenciasMatematicas.cm_2', 42],
    ['competenciasDispositivos.competenciasMatematicas.cm_3', 43],
    ['competenciasDispositivos.competenciasMatematicas.cm_4', 44],
    ['competenciasDispositivos.competenciasMatematicas.cm_5', 45],
    ['competenciasDispositivos.competenciasMatematicas.cm_6', 46],
    ['competenciasDispositivos.competenciasMatematicas.cm_7', 47],
    ['competenciasDispositivos.competenciasMatematicas.cm_8', 48],
    ['competenciasDispositivos.competenciasMatematicas.cm_9', 49],
    ['competenciasDispositivos.competenciasMatematicas.cm_10', 50],
    ['competenciasDispositivos.competenciasMatematicas.cm_11', 51],
    ['competenciasDispositivos.competenciasMatematicas.cm_12', 52],
    ['competenciasDispositivos.competenciasMatematicas.cm_13', 53],
    ['competenciasDispositivos.competenciasMatematicas.cm_14', 54],
    ['competenciasDispositivos.competenciasMatematicas.cm_15', 55],
    ['competenciasDispositivos.competenciasMatematicas.cm_16', 56],
    ['competenciasDispositivos.competenciasMatematicas.cm_17', 57],
    ['competenciasDispositivos.competenciasMatematicas.cm_18', 58],
    ['competenciasDispositivos.competenciasMatematicas.cm_19', 59],
    ['competenciasDispositivos.memoria.mem_1', 63],
    ['competenciasDispositivos.memoria.mem_2', 64],
    ['competenciasDispositivos.memoria.mem_3', 65],
    ['competenciasDispositivos.memoria.mem_4', 66],
    ['competenciasDispositivos.memoria.mem_5', 67],
    ['competenciasDispositivos.memoria.mem_6', 68],
    ['competenciasDispositivos.memoria.mem_7', 69],
    ['competenciasDispositivos.atencion.ate_1', 71],
    ['competenciasDispositivos.atencion.ate_2', 72],
    ['competenciasDispositivos.atencion.ate_3', 73],
    ['competenciasDispositivos.atencion.ate_4', 74],
    ['competenciasDispositivos.percepcion.per_1', 76],
    ['competenciasDispositivos.percepcion.per_2', 77],
    ['competenciasDispositivos.percepcion.per_3', 78],
    ['competenciasDispositivos.percepcion.per_4', 79],
    ['competenciasDispositivos.percepcion.per_5', 80],
    ['competenciasDispositivos.funcionesEjecutivas.eje_1', 82],
    ['competenciasDispositivos.funcionesEjecutivas.eje_2', 83],
    ['competenciasDispositivos.funcionesEjecutivas.eje_3', 84],
    ['competenciasDispositivos.funcionesEjecutivas.eje_4', 85],
    ['competenciasDispositivos.funcionesEjecutivas.eje_5', 86],
    ['competenciasDispositivos.funcionesEjecutivas.eje_6', 87],
    ['competenciasDispositivos.lenguajeComunicacion.len_1', 90],
    ['competenciasDispositivos.lenguajeComunicacion.len_2', 91],
    ['competenciasDispositivos.lenguajeComunicacion.len_3', 92],
    ['competenciasDispositivos.lenguajeComunicacion.len_4', 93],
    ['competenciasDispositivos.lenguajeComunicacion.len_5', 94],
    ['competenciasDispositivos.lenguajeComunicacion.len_6', 95],
    ['competenciasDispositivos.lenguajeComunicacion.len_7', 96],
    ['competenciasDispositivos.lenguajeComunicacion.len_8', 97],
    ['competenciasDispositivos.lenguajeComunicacion.len_9', 98],
    ['competenciasDispositivos.lenguajeComunicacion.len_10', 99],
  ] as const;

  for (const [path, rowIndex] of rowMappings) {
    setCellToInlineSegments(getCell(getRow(table, rowIndex), 1), doc, [
      createCheckboxControl(doc, factory, `${path}${OPTION_TAG_SEPARATOR}true`, `${path} · Sí`),
      ' SI',
    ], { align: 'center' });
    setCellToInlineSegments(getCell(getRow(table, rowIndex), 2), doc, [
      createCheckboxControl(doc, factory, `${path}${OPTION_TAG_SEPARATOR}false`, `${path} · No`),
      ' NO',
    ], { align: 'center' });
  }

  const finalRow = getRow(table, 19).cloneNode(true) as Element;
  const finalCell = getCell(finalRow, 0);
  setCellContent(finalCell, [
    createParagraph(doc, ['Observaciones generales de competencias y dispositivos']),
    createBlockTextControl(
      doc,
      factory,
      'competenciasDispositivos.observacionesCompetencias',
      'Observaciones de competencias y dispositivos',
      'rich',
    ),
  ]);
  table.appendChild(finalRow);
}
