/**
 * Registry mapping section ids to their React components and metadata.
 *
 * Adding a new section means: (1) defining the section type in the data
 * model, (2) creating its component, (3) registering it here, and (4)
 * adding it to `model/section-list.ts` so the nav picks it up.
 *
 * @see ../../../model/section-list.ts
 */
import type { ReactNode } from 'react';
import { SECTION_LIST, type PiarSectionId } from '@piar-digital-app/features/piar/model/section-list';
import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { HeaderSection } from '@piar-digital-app/features/piar/components/sections/identity/HeaderSection';
import { StudentSection } from '@piar-digital-app/features/piar/components/sections/identity/StudentSection';
import { EntornoSaludSection } from '@piar-digital-app/features/piar/components/sections/environments/EntornoSaludSection';
import { EntornoHogarSection } from '@piar-digital-app/features/piar/components/sections/environments/EntornoHogarSection';
import { EntornoEducativoSection } from '@piar-digital-app/features/piar/components/sections/environments/EntornoEducativoSection';
import { ValoracionPedagogicaSection } from '@piar-digital-app/features/piar/components/sections/assessment/ValoracionPedagogicaSection';
import { CompetenciasDispositivosSection } from '@piar-digital-app/features/piar/components/sections/assessment/CompetenciasDispositivosSection';
import { DescripcionHabilidadesSection, EstrategiasAccionesSection } from '@piar-digital-app/features/piar/components/sections/assessment/NarrativeSections';
import { AjustesRazonablesSection } from '@piar-digital-app/features/piar/components/sections/planning/AjustesRazonablesSection';
import {
  PiarSignatoriesSection,
  SpecialSignaturesSection,
  TeacherSignaturesSection,
} from '@piar-digital-app/features/piar/components/sections/planning/SignaturesSection';
import { ActaAcuerdoSection } from '@piar-digital-app/features/piar/components/sections/planning/ActaAcuerdoSection';
import type { PIARSectionHandlers } from './usePIARFormController';

interface SectionRegistryEntry {
  id: PiarSectionId;
  annexLabel: string;
  title: string;
  render: (data: PIARFormDataV2, handlers: PIARSectionHandlers) => ReactNode;
}

const SECTION_RENDERERS: Record<PiarSectionId, SectionRegistryEntry['render']> = {
  'info-general': (data, handlers) => <HeaderSection data={data.header} onChange={handlers.handleHeaderChange} />,
  estudiante: (data, handlers) => <StudentSection data={data.student} onChange={handlers.handleStudentChange} />,
  salud: (data, handlers) => <EntornoSaludSection data={data.entornoSalud} onChange={handlers.handleEntornoSaludChange} />,
  hogar: (data, handlers) => <EntornoHogarSection data={data.entornoHogar} onChange={handlers.handleEntornoHogarChange} />,
  educativo: (data, handlers) => <EntornoEducativoSection data={data.entornoEducativo} onChange={handlers.handleEntornoEducativoChange} />,
  valoracion: (data, handlers) => <ValoracionPedagogicaSection data={data.valoracionPedagogica} onChange={handlers.handleValoracionChange} />,
  competencias: (data, handlers) => <CompetenciasDispositivosSection data={data.competenciasDispositivos} onChange={handlers.handleCompetenciasChange} />,
  habilidades: (data, handlers) => <DescripcionHabilidadesSection value={data.descripcionHabilidades} onChange={handlers.handleDescripcionChange} />,
  estrategias: (data, handlers) => (
    <EstrategiasAccionesSection
      value={data.estrategiasAcciones}
      fechaRevision={data.fechaProximaRevision}
      onValueChange={handlers.handleEstrategiasChange}
      onFechaRevisionChange={handlers.handleFechaRevisionChange}
    />
  ),
  'firmantes-piar': (data, handlers) => <PiarSignatoriesSection data={data.firmas} onChange={handlers.handleFirmasChange} />,
  ajustes: (data, handlers) => <AjustesRazonablesSection data={data.ajustes} onChange={handlers.handleAjustesChange} />,
  'firmas-docentes': (data, handlers) => <TeacherSignaturesSection data={data.firmas} onChange={handlers.handleFirmasChange} />,
  'firmas-especiales': (data, handlers) => <SpecialSignaturesSection data={data.firmas} onChange={handlers.handleFirmasChange} />,
  acta: (data, handlers) => <ActaAcuerdoSection data={data.acta} header={data.header} student={data.student} onChange={handlers.handleActaChange} />,
};

/** Ordered section registry consumed by the form renderer. */
export const SECTION_REGISTRY: SectionRegistryEntry[] = SECTION_LIST.map((section) => ({
  id: section.id,
  annexLabel: section.annexLabel,
  title: section.title,
  render: SECTION_RENDERERS[section.id],
}));
