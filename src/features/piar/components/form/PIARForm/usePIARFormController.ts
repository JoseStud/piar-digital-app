import { useCallback, useRef, useState } from 'react';
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
import { deepMergeWithDefaultsV2 } from '@piar-digital-app/features/piar/lib/data/data-utils';

interface UsePIARFormControllerArgs {
  initialData?: PIARFormDataV2;
  onDataChange?: (data: PIARFormDataV2) => void;
}

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
  touchedSections: Set<string>;
}

export function usePIARFormController({
  initialData,
  onDataChange,
}: UsePIARFormControllerArgs): UsePIARFormControllerResult {
  const [data, setData] = useState<PIARFormDataV2>(
    () => initialData
      ? deepMergeWithDefaultsV2(initialData)
      : createEmptyPIARFormDataV2(),
  );
  const [touchedSections, setTouchedSections] = useState<Set<string>>(() => new Set());
  const dataRef = useRef(data);
  const onDataChangeRef = useRef(onDataChange);
  onDataChangeRef.current = onDataChange;

  const markSectionTouched = useCallback((sectionId: string) => {
    setTouchedSections((prev) => {
      if (prev.has(sectionId)) return prev;
      const next = new Set(prev);
      next.add(sectionId);
      return next;
    });
  }, []);

  const update = useCallback((updater: (prev: PIARFormDataV2) => PIARFormDataV2) => {
    const next = updater(dataRef.current);
    dataRef.current = next;
    setData(next);
    onDataChangeRef.current?.(next);
  }, []);

  const handleHeaderChange = useCallback(
    (patch: Partial<HeaderV2>) => {
      markSectionTouched('info-general');
      update((prev) => ({ ...prev, header: { ...prev.header, ...patch } }));
    },
    [update, markSectionTouched],
  );

  const handleStudentChange = useCallback(
    (patch: Partial<StudentV2>) => {
      markSectionTouched('estudiante');
      update((prev) => ({ ...prev, student: { ...prev.student, ...patch } }));
    },
    [update, markSectionTouched],
  );

  const handleEntornoSaludChange = useCallback(
    (patch: Partial<EntornoSaludData>) => {
      markSectionTouched('salud');
      update((prev) => ({ ...prev, entornoSalud: { ...prev.entornoSalud, ...patch } }));
    },
    [update, markSectionTouched],
  );

  const handleEntornoHogarChange = useCallback(
    (patch: Partial<EntornoHogarData>) => {
      markSectionTouched('hogar');
      update((prev) => ({ ...prev, entornoHogar: { ...prev.entornoHogar, ...patch } }));
    },
    [update, markSectionTouched],
  );

  const handleEntornoEducativoChange = useCallback(
    (patch: Partial<EntornoEducativoData>) => {
      markSectionTouched('educativo');
      update((prev) => ({ ...prev, entornoEducativo: { ...prev.entornoEducativo, ...patch } }));
    },
    [update, markSectionTouched],
  );

  const handleValoracionChange = useCallback(
    (patch: Partial<ValoracionPedagogicaData>) => {
      markSectionTouched('valoracion');
      update((prev) => ({ ...prev, valoracionPedagogica: { ...prev.valoracionPedagogica, ...patch } }));
    },
    [update, markSectionTouched],
  );

  const handleCompetenciasChange = useCallback(
    (patch: Partial<CompetenciasDispositivosData>) => {
      markSectionTouched('competencias');
      update((prev) => ({ ...prev, competenciasDispositivos: { ...prev.competenciasDispositivos, ...patch } }));
    },
    [update, markSectionTouched],
  );

  const handleDescripcionChange = useCallback(
    (value: string) => {
      markSectionTouched('habilidades');
      update((prev) => ({ ...prev, descripcionHabilidades: value }));
    },
    [update, markSectionTouched],
  );

  const handleEstrategiasChange = useCallback(
    (value: string) => {
      markSectionTouched('estrategias');
      update((prev) => ({ ...prev, estrategiasAcciones: value }));
    },
    [update, markSectionTouched],
  );

  const handleFechaRevisionChange = useCallback(
    (value: string) => {
      markSectionTouched('estrategias');
      update((prev) => ({ ...prev, fechaProximaRevision: value }));
    },
    [update, markSectionTouched],
  );

  const handleAjustesChange = useCallback(
    (ajustes: PIARFormDataV2['ajustes']) => {
      markSectionTouched('ajustes');
      update((prev) => ({ ...prev, ajustes }));
    },
    [update, markSectionTouched],
  );

  const handleFirmasChange = useCallback(
    (patch: Partial<FirmasV2>) => {
      markSectionTouched('firmas');
      update((prev) => ({ ...prev, firmas: { ...prev.firmas, ...patch } }));
    },
    [update, markSectionTouched],
  );

  const handleActaChange = useCallback(
    (patch: Partial<ActaAcuerdoData>) => {
      markSectionTouched('acta');
      update((prev) => ({ ...prev, acta: { ...prev.acta, ...patch } }));
    },
    [update, markSectionTouched],
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
