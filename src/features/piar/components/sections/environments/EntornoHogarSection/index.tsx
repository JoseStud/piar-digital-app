/** Composes the EntornoHogar sub-components. */
'use client';

import { memo } from 'react';
import { sectionGuides } from '@piar-digital-app/features/piar/content/guidance';
import { SectionGuide } from '@piar-digital-app/features/piar/components/form/SectionGuide';
import type { EntornoHogarData } from '@piar-digital-app/features/piar/model/piar';
import { ParentFields } from './ParentFields';
import { CaregiverFields } from './CaregiverFields';
import { HouseholdCompositionFields } from './HouseholdCompositionFields';

interface EntornoHogarSectionProps {
  data: EntornoHogarData;
  onChange: (patch: Partial<EntornoHogarData>) => void;
}

export const EntornoHogarSection = memo(function EntornoHogarSection({
  data,
  onChange,
}: EntornoHogarSectionProps) {
  return (
    <>
      <SectionGuide sectionId="entornoHogar" guide={sectionGuides.entornoHogar} defaultExpanded={false} />
      <ParentFields data={data} onChange={onChange} />
      <CaregiverFields data={data} onChange={onChange} />
      <HouseholdCompositionFields data={data} onChange={onChange} />
    </>
  );
});
