import { useCallback, useRef, useState } from 'react';
import type { PiarSectionId } from '@piar-digital-app/features/piar/model/section-list';
import {
  type PIARFormDataV2,
  type HeaderV2,
  type StudentV2,
  type EntornoSaludData,
  type EntornoHogarData,
  type EntornoEducativoData,
  type ValoracionPedagogicaData,
  type CompetenciasDispositivosData,
  type FirmasV2,
  type ActaAcuerdoData,
  createEmptyPIARFormDataV2,
} from '@piar-digital-app/features/piar/model/piar';

interface UsePIARFormControllerArgs {
  initialData?: PIARFormDataV2;
  onDataChange?: (data: PIARFormDataV2) => void;
}

/** Section-level mutators for the canonical PIAR form state. */
export interface PIARSectionHandlers {
  handleHeaderChange: (patch: Partial<HeaderV2>) => void;
  handleStudentChange: (patch: Partial<StudentV2>) => void;
  handleEntornoSaludChange: (patch: Partial<EntornoSaludData>) => void;
  handleEntornoHogarChange: (patch: Partial<EntornoHogarData>) => void;
  handleEntornoEducativoChange: (patch: Partial<EntornoEducativoData>) => void;
  handleValoracionChange: (patch: Partial<ValoracionPedagogicaData>) => void;
  handleCompetenciasChange: (patch: Partial<CompetenciasDispositivosData>) => void;
  handleDescripcionChange: (value: string) => void;
  handleEstrategiasChange: (value: string) => void;
  handleFechaRevisionChange: (value: string) => void;
  handleAjustesChange: (ajustes: PIARFormDataV2['ajustes']) => void;
  handleFirmasChange: (patch: Partial<FirmasV2>) => void;
  handleActaChange: (patch: Partial<ActaAcuerdoData>) => void;
}

interface UsePIARFormControllerResult extends PIARSectionHandlers {
  data: PIARFormDataV2;
  touchedSections: Set<PiarSectionId>;
}

type MergeSectionKey =
  | 'header'
  | 'student'
  | 'entornoSalud'
  | 'entornoHogar'
  | 'entornoEducativo'
  | 'valoracionPedagogica'
  | 'competenciasDispositivos'
  | 'firmas'
  | 'acta';

type ReplaceSectionKey =
  | 'descripcionHabilidades'
  | 'estrategiasAcciones'
  | 'fechaProximaRevision'
  | 'ajustes';

/**
 * State controller for the PIAR form.
 *
 * Holds the full PIARFormDataV2 in React state and exposes section-level
 * patch functions. Every patch goes through `update((prev) => ({
 * ...prev, section: { ...prev.section, ...patch } }))` so the state is
 * always a fresh object — important because PIARForm uses referential
 * equality on the data prop to drive the autosave hook's dirty
 * tracking.
 *
 * Patches are merged shallowly per-section. Fixed-length tuple fields
 * (`ajustes`, `firmas.docentes`, etc.) are passed in as full tuples,
 * not as variable-length arrays.
 */
export function usePIARFormController({
  initialData,
  onDataChange,
}: UsePIARFormControllerArgs): UsePIARFormControllerResult {
  const [data, setData] = useState<PIARFormDataV2>(
    () => initialData ?? createEmptyPIARFormDataV2(),
  );
  const [touchedSections, setTouchedSections] = useState<Set<PiarSectionId>>(() => new Set());
  const dataRef = useRef(data);
  const onDataChangeRef = useRef(onDataChange);
  onDataChangeRef.current = onDataChange;

  const markSectionTouched = useCallback((sectionId: PiarSectionId) => {
    setTouchedSections((prev) => {
      if (prev.has(sectionId)) return prev;
      const next = new Set(prev);
      next.add(sectionId);
      return next;
    });
  }, []);

  // why: every dispatcher uses the spread-update pattern instead of
  // mutate-then-set so React re-renders consistently AND the autosave
  // hook can detect dirty state via referential equality on the data
  // prop.
  const update = useCallback((updater: (prev: PIARFormDataV2) => PIARFormDataV2) => {
    const next = updater(dataRef.current);
    dataRef.current = next;
    setData(next);
    onDataChangeRef.current?.(next);
  }, []);

  const updateMergedSection = useCallback(
    <K extends MergeSectionKey>(sectionId: PiarSectionId, key: K, patch: Partial<PIARFormDataV2[K]>) => {
      markSectionTouched(sectionId);
      update((prev) => ({
        ...prev,
        [key]: { ...prev[key], ...patch },
      } as PIARFormDataV2));
    },
    [markSectionTouched, update],
  );

  const updateSectionValue = useCallback(
    <K extends ReplaceSectionKey>(sectionId: PiarSectionId, key: K, value: PIARFormDataV2[K]) => {
      markSectionTouched(sectionId);
      update((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [markSectionTouched, update],
  );

  const handleHeaderChange = useCallback(
    (patch: Partial<HeaderV2>) => {
      updateMergedSection('info-general', 'header', patch);
    },
    [updateMergedSection],
  );

  const handleStudentChange = useCallback(
    (patch: Partial<StudentV2>) => {
      updateMergedSection('estudiante', 'student', patch);
    },
    [updateMergedSection],
  );

  const handleEntornoSaludChange = useCallback(
    (patch: Partial<EntornoSaludData>) => {
      updateMergedSection('salud', 'entornoSalud', patch);
    },
    [updateMergedSection],
  );

  const handleEntornoHogarChange = useCallback(
    (patch: Partial<EntornoHogarData>) => {
      updateMergedSection('hogar', 'entornoHogar', patch);
    },
    [updateMergedSection],
  );

  const handleEntornoEducativoChange = useCallback(
    (patch: Partial<EntornoEducativoData>) => {
      updateMergedSection('educativo', 'entornoEducativo', patch);
    },
    [updateMergedSection],
  );

  const handleValoracionChange = useCallback(
    (patch: Partial<ValoracionPedagogicaData>) => {
      updateMergedSection('valoracion', 'valoracionPedagogica', patch);
    },
    [updateMergedSection],
  );

  const handleCompetenciasChange = useCallback(
    (patch: Partial<CompetenciasDispositivosData>) => {
      updateMergedSection('competencias', 'competenciasDispositivos', patch);
    },
    [updateMergedSection],
  );

  const handleDescripcionChange = useCallback(
    (value: string) => {
      updateSectionValue('habilidades', 'descripcionHabilidades', value);
    },
    [updateSectionValue],
  );

  const handleEstrategiasChange = useCallback(
    (value: string) => {
      updateSectionValue('estrategias', 'estrategiasAcciones', value);
    },
    [updateSectionValue],
  );

  const handleFechaRevisionChange = useCallback(
    (value: string) => {
      updateSectionValue('estrategias', 'fechaProximaRevision', value);
    },
    [updateSectionValue],
  );

  const handleAjustesChange = useCallback(
    (ajustes: PIARFormDataV2['ajustes']) => {
      updateSectionValue('ajustes', 'ajustes', ajustes);
    },
    [updateSectionValue],
  );

  const handleFirmasChange = useCallback(
    (patch: Partial<FirmasV2>) => {
      const touchedTargets = new Set<PiarSectionId>();
      if ('firmantePIAR' in patch || 'firmanteAcudiente' in patch) {
        touchedTargets.add('firmantes-piar');
      }
      if ('docentes' in patch) {
        touchedTargets.add('firmas-docentes');
      }
      if (
        'docenteOrientador' in patch
        || 'docenteApoyoPedagogico' in patch
        || 'coordinadorPedagogico' in patch
      ) {
        touchedTargets.add('firmas-especiales');
      }

      if (touchedTargets.size === 0) {
        return;
      }

      touchedTargets.forEach((sectionId) => {
        markSectionTouched(sectionId);
      });

      update((prev) => ({
        ...prev,
        firmas: { ...prev.firmas, ...patch },
      }));
    },
    [markSectionTouched, update],
  );

  const handleActaChange = useCallback(
    (patch: Partial<ActaAcuerdoData>) => {
      updateMergedSection('acta', 'acta', patch);
    },
    [updateMergedSection],
  );

  return {
    data,
    touchedSections,
    handleHeaderChange,
    handleStudentChange,
    handleEntornoSaludChange,
    handleEntornoHogarChange,
    handleEntornoEducativoChange,
    handleValoracionChange,
    handleCompetenciasChange,
    handleDescripcionChange,
    handleEstrategiasChange,
    handleFechaRevisionChange,
    handleAjustesChange,
    handleFirmasChange,
    handleActaChange,
  };
}
