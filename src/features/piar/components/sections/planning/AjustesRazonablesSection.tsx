'use client';

import { memo } from 'react';
import { Input } from '@piar-digital-app/shared/ui/Input';
import { Textarea } from '@piar-digital-app/shared/ui/Textarea';
import { sectionGuides } from '@piar-digital-app/features/piar/content/guidance';
import { SectionGuide } from '@piar-digital-app/features/piar/components/form/SectionGuide';
import type { AjusteRazonableRow, PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

interface AjustesRazonablesSectionProps {
  data: PIARFormDataV2['ajustes'];
  onChange: (ajustes: PIARFormDataV2['ajustes']) => void;
}

export const AjustesRazonablesSection = memo(function AjustesRazonablesSection({
  data,
  onChange,
}: AjustesRazonablesSectionProps) {
  const updateRow = (index: 0 | 1 | 2 | 3 | 4, patch: Partial<AjusteRazonableRow>) => {
    const next = [...data] as typeof data;
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <>
      <SectionGuide sectionId="ajustesRazonables" guide={sectionGuides.ajustesRazonables} defaultExpanded={false} />
      <div className="space-y-4 mt-4">
        {([0, 1, 2, 3, 4] as const).map((i) => (
          <div
            key={i}
            className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-4 space-y-3"
          >
            <h3 className="typ-label text-sm font-semibold text-on-surface">
              Ajuste razonable {i + 1}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={`ajuste-${i}-area`}
                  className="typ-label mb-1 block text-sm text-on-surface"
                >
                  Área / Asignatura
                </label>
                <Input
                  id={`ajuste-${i}-area`}
                  type="text"
                  value={data[i].area}
                  onChange={(e) => updateRow(i, { area: e.target.value })}
                  placeholder="Ej: Matemáticas"
                />
              </div>
              <div>
                <label
                  htmlFor={`ajuste-${i}-tipoAjuste`}
                  className="typ-label mb-1 block text-sm text-on-surface"
                >
                  Tipo de ajuste razonable
                </label>
                <Input
                  id={`ajuste-${i}-tipoAjuste`}
                  type="text"
                  value={data[i].tipoAjuste}
                  onChange={(e) => updateRow(i, { tipoAjuste: e.target.value })}
                  placeholder="Ej: Metodológico"
                />
              </div>
              <div>
                <label
                  htmlFor={`ajuste-${i}-apoyoRequerido`}
                  className="typ-label mb-1 block text-sm text-on-surface"
                >
                  Apoyo requerido
                </label>
                <Input
                  id={`ajuste-${i}-apoyoRequerido`}
                  type="text"
                  value={data[i].apoyoRequerido}
                  onChange={(e) => updateRow(i, { apoyoRequerido: e.target.value })}
                  placeholder="Ej: Docente de apoyo pedagógico"
                />
              </div>
              <div>
                <label
                  htmlFor={`ajuste-${i}-barreras`}
                  className="typ-label mb-1 block text-sm text-on-surface"
                >
                  Barreras identificadas
                </label>
                <Textarea
                  id={`ajuste-${i}-barreras`}
                  rows={2}
                  value={data[i].barreras}
                  onChange={(e) => updateRow(i, { barreras: e.target.value })}
                  placeholder="Ej: El formato de las evaluaciones escritas limita la expresión"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor={`ajuste-${i}-descripcion`}
                  className="typ-label mb-1 block text-sm text-on-surface"
                >
                  Descripción del ajuste
                </label>
                <Textarea
                  id={`ajuste-${i}-descripcion`}
                  rows={3}
                  value={data[i].descripcion}
                  onChange={(e) => updateRow(i, { descripcion: e.target.value })}
                  placeholder="Ej: Tiempo adicional para la realización de evaluaciones"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor={`ajuste-${i}-seguimiento`}
                  className="typ-label mb-1 block text-sm text-on-surface"
                >
                  Seguimiento
                </label>
                <Textarea
                  id={`ajuste-${i}-seguimiento`}
                  rows={2}
                  value={data[i].seguimiento}
                  onChange={(e) => updateRow(i, { seguimiento: e.target.value })}
                  placeholder="Ej: Revisión bimestral por el docente de apoyo"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
});
