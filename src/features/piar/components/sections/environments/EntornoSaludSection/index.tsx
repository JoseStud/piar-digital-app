'use client';

import { memo } from 'react';
import { sectionGuides } from '@/features/piar/content/guidance';
import { SectionGuide } from '@/features/piar/components/form/SectionGuide';
import type { EntornoSaludData, EntornoSaludRow } from '@/features/piar/model/piar';
import { CoverageFields } from './CoverageFields';
import { DiagnosisFields } from './DiagnosisFields';
import { HealthRowGroup } from './HealthRowGroup';
import { TechnicalSupportsFields } from './TechnicalSupportsFields';

interface EntornoSaludSectionProps {
  data: EntornoSaludData;
  onChange: (patch: Partial<EntornoSaludData>) => void;
}

export const EntornoSaludSection = memo(function EntornoSaludSection({
  data,
  onChange,
}: EntornoSaludSectionProps) {
  const updateAtencionMedica = (index: 0 | 1 | 2, rowPatch: Partial<EntornoSaludRow>) => {
    const next = [...data.atencionMedica] as EntornoSaludData['atencionMedica'];
    next[index] = { ...next[index], ...rowPatch };
    onChange({ atencionMedica: next });
  };

  const updateTratamientoTerapeutico = (index: 0 | 1 | 2, rowPatch: Partial<EntornoSaludRow>) => {
    const next = [...data.tratamientoTerapeutico] as EntornoSaludData['tratamientoTerapeutico'];
    next[index] = { ...next[index], ...rowPatch };
    onChange({ tratamientoTerapeutico: next });
  };

  const updateMedicamentos = (index: 0 | 1, rowPatch: Partial<EntornoSaludRow>) => {
    const next = [...data.medicamentos] as EntornoSaludData['medicamentos'];
    next[index] = { ...next[index], ...rowPatch };
    onChange({ medicamentos: next });
  };

  return (
    <>
      <SectionGuide sectionId="entornoSalud" guide={sectionGuides.entornoSalud} defaultExpanded={false} />
      <CoverageFields data={data} onChange={onChange} />
      <DiagnosisFields data={data} onChange={onChange} />
      <HealthRowGroup
        title="Atención médica"
        rowLabelPrefix="Atención médica"
        indices={[0, 1, 2]}
        rows={data.atencionMedica}
        onRowChange={(index, patch) => updateAtencionMedica(index as 0 | 1 | 2, patch)}
      />
      <HealthRowGroup
        title="Tratamiento terapéutico"
        rowLabelPrefix="Tratamiento terapéutico"
        indices={[0, 1, 2]}
        rows={data.tratamientoTerapeutico}
        onRowChange={(index, patch) => updateTratamientoTerapeutico(index as 0 | 1 | 2, patch)}
      />
      <HealthRowGroup
        title="Medicamentos"
        rowLabelPrefix="Medicamento"
        indices={[0, 1]}
        rows={data.medicamentos}
        showHorario={true}
        onRowChange={(index, patch) => updateMedicamentos(index as 0 | 1, patch)}
      />
      <TechnicalSupportsFields data={data} onChange={onChange} />
    </>
  );
});
