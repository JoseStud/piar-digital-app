'use client';

import { memo } from 'react';
import { sectionGuides } from '@piar-digital-app/features/piar/content/guidance';
import { SectionGuide } from '@piar-digital-app/features/piar/components/form/SectionGuide';
import type { StudentV2 } from '@piar-digital-app/features/piar/model/piar';
import { IdentityFields } from './IdentityFields';
import { LocationFields } from './LocationFields';
import { ContextFields } from './ContextFields';
import { NarrativeFields } from './NarrativeFields';

interface StudentSectionProps {
  data: StudentV2;
  onChange: (patch: Partial<StudentV2>) => void;
}

export const StudentSection = memo(function StudentSection({ data, onChange }: StudentSectionProps) {
  return (
    <>
      <SectionGuide sectionId="datosEstudiante" guide={sectionGuides.datosEstudiante} defaultExpanded={false} />
      <IdentityFields data={data} onChange={onChange} />
      <LocationFields data={data} onChange={onChange} />
      <ContextFields data={data} onChange={onChange} />
      <NarrativeFields data={data} onChange={onChange} />
    </>
  );
});
