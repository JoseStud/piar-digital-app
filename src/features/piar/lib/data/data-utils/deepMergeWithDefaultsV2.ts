/**
 * Merges arbitrary partial PIAR data with the V2 default shape.
 *
 * Used by every importer to ensure the data handed to React state has the
 * full `PIARFormDataV2` shape, regardless of which fields were present in
 * the source. Missing fields fall back to `createEmptyPIARFormDataV2`
 * defaults; present fields with the right type are preserved verbatim;
 * present fields with the wrong type are dropped and the slot is defaulted.
 *
 * @see ./sectionMergers.ts
 * @see ../../portable/piar-import.ts
 */
import {
  type PIARFormDataV2,
  createEmptyPIARFormDataV2,
} from '@piar-digital-app/features/piar/model/piar';
import { type DeepPartial } from './mergeHelpers';
import {
  type LegacyActaFallback,
  mergeActaSection,
  mergeAjustesSection,
  mergeCompetenciasDispositivosSection,
  mergeEntornoEducativoSection,
  mergeEntornoHogarSection,
  mergeEntornoSaludSection,
  mergeFirmasSection,
  mergeHeaderWithLegacyFallback,
  mergeStudentWithLegacyFallback,
  mergeValoracionPedagogicaSection,
} from './sectionMergers';

/** Partial PIAR form shape accepted by the deep merge path, plus a legacy acta fallback slot. */
export type DeepPartialPIARFormDataV2 = DeepPartial<PIARFormDataV2> & {
  acta?: LegacyActaFallback;
};

/** Returns a fully populated V2 PIAR form merged from partial imported data. */
export function deepMergeWithDefaultsV2(parsed: DeepPartialPIARFormDataV2 | undefined): PIARFormDataV2 {
  const empty = createEmptyPIARFormDataV2();
  const source = parsed ?? {};
  const parsedActa = source.acta;

  return {
    _version: 2,
    header: mergeHeaderWithLegacyFallback(source.header, parsedActa, empty.header),
    student: mergeStudentWithLegacyFallback(source.student, parsedActa, empty.student),
    entornoSalud: mergeEntornoSaludSection(source.entornoSalud, empty.entornoSalud),
    entornoHogar: mergeEntornoHogarSection(source.entornoHogar, empty.entornoHogar),
    entornoEducativo: mergeEntornoEducativoSection(source.entornoEducativo, empty.entornoEducativo),
    valoracionPedagogica: mergeValoracionPedagogicaSection(source.valoracionPedagogica, empty.valoracionPedagogica),
    competenciasDispositivos: mergeCompetenciasDispositivosSection(
      source.competenciasDispositivos,
      empty.competenciasDispositivos,
    ),
    descripcionHabilidades: typeof source.descripcionHabilidades === 'string'
      ? source.descripcionHabilidades
      : empty.descripcionHabilidades,
    estrategiasAcciones: typeof source.estrategiasAcciones === 'string'
      ? source.estrategiasAcciones
      : empty.estrategiasAcciones,
    fechaProximaRevision: typeof source.fechaProximaRevision === 'string'
      ? source.fechaProximaRevision
      : empty.fechaProximaRevision,
    ajustes: mergeAjustesSection(source.ajustes, empty.ajustes),
    firmas: mergeFirmasSection(source.firmas, empty.firmas),
    acta: mergeActaSection(parsedActa, empty.acta),
  };
}
