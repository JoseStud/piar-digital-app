'use client';

import { memo } from 'react';
import { sectionGuides } from '@/features/piar/content/guidance';
import { SectionGuide } from '@/features/piar/components/form/SectionGuide';
import type { EntornoHogarData } from '@/features/piar/model/piar';
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
