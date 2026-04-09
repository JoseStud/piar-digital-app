/** Signature editors split to mirror the reconciled export layout. */
'use client';

import { memo } from 'react';
import { Input } from '@piar-digital-app/shared/ui/Input';
import { sectionGuides } from '@piar-digital-app/features/piar/content/guidance';
import { SectionGuide } from '@piar-digital-app/features/piar/components/form/SectionGuide';
import type { FirmasV2, DocenteSignature } from '@piar-digital-app/features/piar/model/piar';

interface SignatureSectionProps {
  data: FirmasV2;
  onChange: (patch: Partial<FirmasV2>) => void;
}

function DocenteFields({
  index,
  label,
  docente,
  onNombreChange,
  onAreaChange,
  onFirmaChange,
}: {
  index: number;
  label: string;
  docente: DocenteSignature;
  onNombreChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onFirmaChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-3">
      <span className="typ-label text-xs font-medium text-on-surface-variant">{label}</span>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <div>
          <label htmlFor={`docente-${index}-nombre`} className="typ-label mb-1 block text-xs text-on-surface">
            Nombre docente
          </label>
          <Input
            id={`docente-${index}-nombre`}
            type="text"
            value={docente.nombre}
            onChange={(event) => onNombreChange(event.target.value)}
            placeholder="Nombre completo"
          />
        </div>
        <div>
          <label htmlFor={`docente-${index}-area`} className="typ-label mb-1 block text-xs text-on-surface">
            Área
          </label>
          <Input
            id={`docente-${index}-area`}
            type="text"
            value={docente.area}
            onChange={(event) => onAreaChange(event.target.value)}
            placeholder="Ej: Matemáticas"
          />
        </div>
        <div>
          <label htmlFor={`docente-${index}-firma`} className="typ-label mb-1 block text-xs text-on-surface">
            Firma
          </label>
          <Input
            id={`docente-${index}-firma`}
            type="text"
            value={docente.firma}
            onChange={(event) => onFirmaChange(event.target.value)}
            placeholder="Firma"
          />
        </div>
      </div>
    </div>
  );
}

const DOCENTE_GROUPS = [
  { label: 'Docentes grupo 1', indices: [0, 1, 2] as const },
  { label: 'Docentes grupo 2', indices: [3, 4, 5] as const },
  { label: 'Docentes grupo 3', indices: [6, 7, 8] as const },
] as const;

const SPECIAL_ROLES = [
  { key: 'docenteOrientador', label: 'Docente Orientador / Psicoorientador', roleIndex: 9 },
  { key: 'docenteApoyoPedagogico', label: 'Docente de Apoyo Pedagógico', roleIndex: 10 },
  { key: 'coordinadorPedagogico', label: 'Coordinador/a Académico/a', roleIndex: 11 },
] as const;

function updateDocentes(
  data: FirmasV2,
  onChange: (patch: Partial<FirmasV2>) => void,
  index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
  field: keyof DocenteSignature,
  value: string,
): void {
  const next = [...data.docentes] as FirmasV2['docentes'];
  next[index] = { ...next[index], [field]: value };
  onChange({ docentes: next });
}

function updateRole(
  data: FirmasV2,
  onChange: (patch: Partial<FirmasV2>) => void,
  role: 'docenteOrientador' | 'docenteApoyoPedagogico' | 'coordinadorPedagogico',
  field: keyof DocenteSignature,
  value: string,
): void {
  onChange({ [role]: { ...data[role], [field]: value } });
}

export const PiarSignatoriesSection = memo(function PiarSignatoriesSection({
  data,
  onChange,
}: SignatureSectionProps) {
  return (
    <>
      <SectionGuide sectionId="firmantes-piar" guide={sectionGuides.firmantesPiar} defaultExpanded={false} />
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="firmas-firmantePIAR" className="typ-label mb-1 block text-sm text-on-surface">
              Nombre y firma de quien diligencia el PIAR
            </label>
            <Input
              id="firmas-firmantePIAR"
              type="text"
              value={data.firmantePIAR}
              onChange={(event) => onChange({ firmantePIAR: event.target.value })}
              placeholder="Ej: María López"
            />
          </div>
          <div>
            <label htmlFor="firmas-firmanteAcudiente" className="typ-label mb-1 block text-sm text-on-surface">
              Nombre y firma del acudiente
            </label>
            <Input
              id="firmas-firmanteAcudiente"
              type="text"
              value={data.firmanteAcudiente}
              onChange={(event) => onChange({ firmanteAcudiente: event.target.value })}
              placeholder="Ej: Carlos Pérez (padre)"
            />
          </div>
        </div>
      </div>
    </>
  );
});

export const TeacherSignaturesSection = memo(function TeacherSignaturesSection({
  data,
  onChange,
}: SignatureSectionProps) {
  return (
    <>
      <SectionGuide sectionId="firmas-docentes" guide={sectionGuides.firmasDocentes} defaultExpanded={false} />
      {DOCENTE_GROUPS.map((group) => (
        <div key={group.label} className="mt-4 space-y-2">
          <h3 className="typ-label text-sm font-semibold text-on-surface">{group.label}</h3>
          {group.indices.map((index) => (
            <DocenteFields
              key={index}
              index={index}
              label={`Docente ${index + 1}`}
              docente={data.docentes[index]}
              onNombreChange={(value) => updateDocentes(data, onChange, index, 'nombre', value)}
              onAreaChange={(value) => updateDocentes(data, onChange, index, 'area', value)}
              onFirmaChange={(value) => updateDocentes(data, onChange, index, 'firma', value)}
            />
          ))}
        </div>
      ))}
    </>
  );
});

export const SpecialSignaturesSection = memo(function SpecialSignaturesSection({
  data,
  onChange,
}: SignatureSectionProps) {
  return (
    <>
      <SectionGuide sectionId="firmas-especiales" guide={sectionGuides.firmasEspeciales} defaultExpanded={false} />
      <div className="space-y-2">
        {SPECIAL_ROLES.map(({ key, label, roleIndex }) => (
          <DocenteFields
            key={key}
            index={roleIndex}
            label={label}
            docente={data[key]}
            onNombreChange={(value) => updateRole(data, onChange, key, 'nombre', value)}
            onAreaChange={(value) => updateRole(data, onChange, key, 'area', value)}
            onFirmaChange={(value) => updateRole(data, onChange, key, 'firma', value)}
          />
        ))}
      </div>
    </>
  );
});
