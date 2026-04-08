/** Renders the FirmasV2 signature block: 9 docente entries (fixed tuple), 3 role objects, 2 free-text signatories. */
'use client';

import { memo } from 'react';
import { Input } from '@piar-digital-app/shared/ui/Input';
import { sectionGuides } from '@piar-digital-app/features/piar/content/guidance';
import { SectionGuide } from '@piar-digital-app/features/piar/components/form/SectionGuide';
import type { FirmasV2, DocenteSignature } from '@piar-digital-app/features/piar/model/piar';

interface SignaturesSectionProps {
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
  onNombreChange: (v: string) => void;
  onAreaChange: (v: string) => void;
  onFirmaChange: (v: string) => void;
}) {
  return (
    <div className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-3 space-y-2">
      <span className="typ-label text-xs font-medium text-on-surface-variant">{label}</span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div>
          <label htmlFor={`docente-${index}-nombre`} className="typ-label mb-1 block text-xs text-on-surface">
            Nombre docente
          </label>
          <Input
            id={`docente-${index}-nombre`}
            type="text"
            value={docente.nombre}
            onChange={(e) => onNombreChange(e.target.value)}
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
            onChange={(e) => onAreaChange(e.target.value)}
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
            onChange={(e) => onFirmaChange(e.target.value)}
            placeholder="Firma"
          />
        </div>
      </div>
    </div>
  );
}

export const SignaturesSection = memo(function SignaturesSection({
  data,
  onChange,
}: SignaturesSectionProps) {
  const updateDocente = (
    index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
    field: keyof DocenteSignature,
    value: string,
  ) => {
    const next = [...data.docentes] as FirmasV2['docentes'];
    next[index] = { ...next[index], [field]: value };
    onChange({ docentes: next });
  };

  const updateRole = (
    role: 'docenteOrientador' | 'docenteApoyoPedagogico' | 'coordinadorPedagogico',
    field: keyof DocenteSignature,
    value: string,
  ) => {
    onChange({ [role]: { ...data[role], [field]: value } });
  };

  const GROUPS = [
    { label: 'Docentes grupo 1', indices: [0, 1, 2] as const },
    { label: 'Docentes grupo 2', indices: [3, 4, 5] as const },
    { label: 'Docentes grupo 3', indices: [6, 7, 8] as const },
  ];

  const ROLES: {
    key: 'docenteOrientador' | 'docenteApoyoPedagogico' | 'coordinadorPedagogico';
    label: string;
    roleIndex: number;
  }[] = [
    { key: 'docenteOrientador', label: 'Docente Orientador / Psicoorientador', roleIndex: 9 },
    { key: 'docenteApoyoPedagogico', label: 'Docente de Apoyo Pedagógico', roleIndex: 10 },
    { key: 'coordinadorPedagogico', label: 'Coordinador/a Académico/a', roleIndex: 11 },
  ];

  return (
    <>
      <SectionGuide sectionId="firmas" guide={sectionGuides.firmas} defaultExpanded={false} />

      {/* Docente groups */}
      {GROUPS.map((group) => (
        <div key={group.label} className="mt-4 space-y-2">
          <h3 className="typ-label text-sm font-semibold text-on-surface">{group.label}</h3>
          {group.indices.map((i) => (
            <DocenteFields
              key={i}
              index={i}
              label={`Docente ${i + 1}`}
              docente={data.docentes[i]}
              onNombreChange={(v) => updateDocente(i, 'nombre', v)}
              onAreaChange={(v) => updateDocente(i, 'area', v)}
              onFirmaChange={(v) => updateDocente(i, 'firma', v)}
            />
          ))}
        </div>
      ))}

      {/* Special roles */}
      <div className="mt-6 space-y-2">
        <h3 className="typ-label text-sm font-semibold text-on-surface">Roles especiales</h3>
        {ROLES.map(({ key, label, roleIndex }) => (
          <DocenteFields
            key={key}
            index={roleIndex}
            label={label}
            docente={data[key]}
            onNombreChange={(v) => updateRole(key, 'nombre', v)}
            onAreaChange={(v) => updateRole(key, 'area', v)}
            onFirmaChange={(v) => updateRole(key, 'firma', v)}
          />
        ))}
      </div>

      {/* PIAR signatories */}
      <div className="mt-6 space-y-3">
        <h3 className="typ-label text-sm font-semibold text-on-surface">Firmantes del PIAR</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firmas-firmantePIAR" className="typ-label mb-1 block text-sm text-on-surface">
              Nombre y firma de quien diligencia el PIAR
            </label>
            <Input
              id="firmas-firmantePIAR"
              type="text"
              value={data.firmantePIAR}
              onChange={(e) => onChange({ firmantePIAR: e.target.value })}
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
              onChange={(e) => onChange({ firmanteAcudiente: e.target.value })}
              placeholder="Ej: Carlos Pérez (padre)"
            />
          </div>
        </div>
      </div>
    </>
  );
});
