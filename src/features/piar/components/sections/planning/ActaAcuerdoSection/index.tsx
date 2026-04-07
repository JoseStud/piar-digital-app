'use client';

import { memo } from 'react';
import { sectionGuides } from '@/features/piar/content/guidance';
import { SectionGuide } from '@/features/piar/components/form/SectionGuide';
import type { ActaAcuerdoData, ActaActividad, HeaderV2, StudentV2 } from '@/features/piar/model/piar';
import { ActaSummaryFields } from './ActaSummaryFields';
import { ParticipantsFields } from './ParticipantsFields';
import { CompromisosField } from './CompromisosField';
import { ActividadList } from './ActividadList';
import { SignatureFields } from './SignatureFields';

interface ActaAcuerdoSectionProps {
  data: ActaAcuerdoData;
  header: HeaderV2;
  student: StudentV2;
  onChange: (patch: Partial<ActaAcuerdoData>) => void;
}

export const ActaAcuerdoSection = memo(function ActaAcuerdoSection({
  data,
  header,
  student,
  onChange,
}: ActaAcuerdoSectionProps) {
  const updateActividad = (index: 0 | 1 | 2 | 3 | 4, patch: Partial<ActaActividad>) => {
    const next = [...data.actividades] as ActaAcuerdoData['actividades'];
    next[index] = { ...next[index], ...patch };
    onChange({ actividades: next });
  };

  return (
    <>
      <SectionGuide sectionId="actaAcuerdo" guide={sectionGuides.actaAcuerdo} defaultExpanded={false} />
      <ActaSummaryFields header={header} student={student} />
      <ParticipantsFields data={data} onChange={onChange} />
      <CompromisosField value={data.compromisos} onChange={(compromisos) => onChange({ compromisos })} />
      <ActividadList actividades={data.actividades} onActividadChange={updateActividad} />
      <SignatureFields data={data} onChange={onChange} />
    </>
  );
});
