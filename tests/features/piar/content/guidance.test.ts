/** Tests asserting the guidance copy strings exist for every section. */
import { describe, it, expect } from 'vitest';
import {
  sectionGuides,
  fieldPlaceholders,
  entornoPrompts,
} from '@piar-digital-app/features/piar/content/guidance';

const ACTIVE_SECTION_IDS = [
  'informacionGeneral',
  'datosEstudiante',
  'firmas',
  'entornoSalud',
  'entornoHogar',
  'entornoEducativo',
  'valoracionPedagogica',
  'competenciasDispositivos',
  'ajustesRazonables',
  'actaAcuerdo',
];

describe('guidance content', () => {
  describe('sectionGuides', () => {
    it('has a guide for every active section', () => {
      for (const id of ACTIVE_SECTION_IDS) {
        expect(sectionGuides[id], `missing guide for ${id}`).toBeDefined();
      }
    });

    it('every guide has a non-empty title and at least one paragraph', () => {
      for (const [id, guide] of Object.entries(sectionGuides)) {
        expect(guide.title.length, `${id} title is empty`).toBeGreaterThan(0);
        expect(guide.paragraphs.length, `${id} has no paragraphs`).toBeGreaterThan(0);
        for (const p of guide.paragraphs) {
          expect(p.length, `${id} has empty paragraph`).toBeGreaterThan(0);
        }
      }
    });

    it('documents synchronized acta fields', () => {
      expect(sectionGuides.actaAcuerdo.paragraphs.join(' ')).toContain('sincronizan automáticamente');
    });
  });

  describe('fieldPlaceholders', () => {
    it('has placeholders for the active header fields', () => {
      for (const field of [
        'institucionEducativa',
        'sede',
        'jornada',
        'lugarDiligenciamiento',
        'nombrePersonaDiligencia',
        'rolPersonaDiligencia',
      ]) {
        expect(fieldPlaceholders[`header.${field}`], `missing header.${field}`).toBeDefined();
      }
    });

    it('has placeholders for current student fields', () => {
      for (const field of [
        'nombres',
        'apellidos',
        'tipoIdentificacion',
        'numeroIdentificacion',
        'lugarNacimiento',
        'fechaNacimiento',
        'edad',
        'grado',
        'departamento',
        'municipio',
        'barrio',
        'direccion',
        'telefono',
        'correo',
      ]) {
        expect(fieldPlaceholders[`student.${field}`], `missing student.${field}`).toBeDefined();
      }
    });

    it('does not keep legacy placeholder keys', () => {
      expect(fieldPlaceholders['header.docentes']).toBeUndefined();
      expect(fieldPlaceholders['header.area']).toBeUndefined();
      expect(fieldPlaceholders['student.nombre']).toBeUndefined();
      expect(fieldPlaceholders['student.identificacion']).toBeUndefined();
      expect(fieldPlaceholders['recomendaciones.0.acciones']).toBeUndefined();
      expect(fieldPlaceholders['periodo.0.matematicas.objetivos']).toBeUndefined();
    });
  });

  describe('entornoPrompts', () => {
    it('has exactly 5 prompts', () => {
      expect(entornoPrompts).toHaveLength(5);
    });

    it('has the expected keys in order', () => {
      const keys = entornoPrompts.map((p) => p.key);
      expect(keys).toEqual([
        'fortalezas',
        'contextoFamiliar',
        'entornoSalud',
        'actividadesExternas',
        'intereses',
      ]);
    });

    it('every prompt has non-empty label, helpText, and placeholder', () => {
      for (const prompt of entornoPrompts) {
        expect(prompt.label.length, `${prompt.key} label empty`).toBeGreaterThan(0);
        expect(prompt.helpText.length, `${prompt.key} helpText empty`).toBeGreaterThan(0);
        expect(prompt.placeholder.length, `${prompt.key} placeholder empty`).toBeGreaterThan(0);
      }
    });
  });
});
