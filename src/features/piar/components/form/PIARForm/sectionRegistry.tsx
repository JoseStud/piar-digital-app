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
  title: string;
  render: (data: PIARFormDataV2, handlers: PIARSectionHandlers) => ReactNode;
}

const SECTION_DEFINITIONS: Record<PiarSectionId, Omit<SectionRegistryEntry, 'id'>> = {
  'info-general': {
    title: 'Información General',
    render: (data, handlers) => <HeaderSection data={data.header} onChange={handlers.handleHeaderChange} />,
  },
  estudiante: {
    title: 'Datos del Estudiante',
    render: (data, handlers) => <StudentSection data={data.student} onChange={handlers.handleStudentChange} />,
  },
  salud: {
    title: 'Entorno Salud',
    render: (data, handlers) => <EntornoSaludSection data={data.entornoSalud} onChange={handlers.handleEntornoSaludChange} />,
  },
  hogar: {
    title: 'Entorno Hogar',
    render: (data, handlers) => <EntornoHogarSection data={data.entornoHogar} onChange={handlers.handleEntornoHogarChange} />,
  },
  educativo: {
    title: 'Entorno Educativo',
    render: (data, handlers) => <EntornoEducativoSection data={data.entornoEducativo} onChange={handlers.handleEntornoEducativoChange} />,
  },
  valoracion: {
    title: 'Valoración Pedagógica',
    render: (data, handlers) => <ValoracionPedagogicaSection data={data.valoracionPedagogica} onChange={handlers.handleValoracionChange} />,
  },
  competencias: {
    title: 'Competencias y Dispositivos de Aprendizaje',
    render: (data, handlers) => <CompetenciasDispositivosSection data={data.competenciasDispositivos} onChange={handlers.handleCompetenciasChange} />,
  },
  habilidades: {
    title: 'Descripción de Habilidades y Destrezas del Estudiante',
    render: (data, handlers) => <DescripcionHabilidadesSection value={data.descripcionHabilidades} onChange={handlers.handleDescripcionChange} />,
  },
  estrategias: {
    title: 'Estrategias y/o Acciones a Desarrollar con el Estudiante',
    render: (data, handlers) => (
      <EstrategiasAccionesSection
        value={data.estrategiasAcciones}
        fechaRevision={data.fechaProximaRevision}
        onValueChange={handlers.handleEstrategiasChange}
        onFechaRevisionChange={handlers.handleFechaRevisionChange}
      />
    ),
  },
  'firmantes-piar': {
    title: 'Firmantes del PIAR',
    render: (data, handlers) => <PiarSignatoriesSection data={data.firmas} onChange={handlers.handleFirmasChange} />,
  },
  ajustes: {
    title: 'Ajustes Razonables',
    render: (data, handlers) => <AjustesRazonablesSection data={data.ajustes} onChange={handlers.handleAjustesChange} />,
  },
  'firmas-docentes': {
    title: 'Firmas Docentes',
    render: (data, handlers) => <TeacherSignaturesSection data={data.firmas} onChange={handlers.handleFirmasChange} />,
  },
  'firmas-especiales': {
    title: 'Firmas Especiales',
    render: (data, handlers) => <SpecialSignaturesSection data={data.firmas} onChange={handlers.handleFirmasChange} />,
  },
  acta: {
    title: 'Acta de Acuerdo',
    render: (data, handlers) => <ActaAcuerdoSection data={data.acta} header={data.header} student={data.student} onChange={handlers.handleActaChange} />,
  },
};

/** Ordered section registry consumed by the form renderer. */
export const SECTION_REGISTRY: SectionRegistryEntry[] = SECTION_LIST.map((section) => ({
  id: section.id,
  title: SECTION_DEFINITIONS[section.id].title,
  render: SECTION_DEFINITIONS[section.id].render,
}));
