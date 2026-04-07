'use client';

import { useCallback, useMemo } from 'react';
import type { PIARFormDataV2 } from '@/features/piar/model/piar';
import { SECTION_LIST } from '@/features/piar/model/section-list';
import { SectionHeader } from '@/features/piar/components/form/SectionHeader';
import { ProgressNav } from '@/features/piar/components/form/ProgressNav';
import { usePIARFormController, type PIARSectionHandlers } from './usePIARFormController';
import { usePIARAutosave } from './usePIARAutosave';
import { useActiveSectionObserver } from './useActiveSectionObserver';
import { SaveStatusBanner } from './SaveStatusBanner';
import { SECTION_REGISTRY } from './sectionRegistry';

interface PIARFormProps {
  initialData?: PIARFormDataV2;
  onDataChange?: (data: PIARFormDataV2) => void;
}

const SECTION_IDS = SECTION_LIST.map((section) => section.id);

export function PIARForm({ initialData, onDataChange }: PIARFormProps) {
  const {
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
  } = usePIARFormController({ initialData, onDataChange });
  const { saveState, saveMessage, retrySave } = usePIARAutosave(data);
  const activeSection = useActiveSectionObserver(SECTION_IDS);

  const sectionHandlers = useMemo<PIARSectionHandlers>(() => ({
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
  }), [
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
  ]);

  const getSectionStatus = useCallback((id: string): 'active' | 'touched' | 'pending' => {
    if (activeSection === id) return 'active';
    if (touchedSections.has(id)) return 'touched';
    return 'pending';
  }, [activeSection, touchedSections]);

  return (
    <div className="max-w-6xl mx-auto md:flex md:gap-6">
      <ProgressNav activeSection={activeSection} touchedSections={touchedSections} />
      <div className="min-w-0 flex-1">
        <SaveStatusBanner saveState={saveState} saveMessage={saveMessage} onRetry={retrySave} />

        {SECTION_REGISTRY.map((section) => (
          <SectionHeader key={section.id} title={section.title} sectionId={section.id} status={getSectionStatus(section.id)}>
            {section.render(data, sectionHandlers)}
          </SectionHeader>
        ))}
      </div>
    </div>
  );
}
