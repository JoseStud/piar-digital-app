/** Renders the 5 valoración pedagógica aspects, each with a respuestas record (item id → tri-state), an intensidad selection, and a free-text observación. Pulls item labels from `assessment-catalogs`. */
'use client';

import { memo } from 'react';
import { boolNullToString, stringToBoolNull, BOOL_SELECT_CLASS } from '@piar-digital-app/features/piar/lib/forms/boolSelect';
import { Textarea } from '@piar-digital-app/shared/ui/Textarea';
import { sectionGuides } from '@piar-digital-app/features/piar/content/guidance';
import { SectionGuide } from '@piar-digital-app/features/piar/components/form/SectionGuide';
import { VALORACION_ASPECTOS, INTENSIDAD_OPTIONS } from '@piar-digital-app/features/piar/content/assessment-catalogs';
import type { ValoracionPedagogicaData } from '@piar-digital-app/features/piar/model/piar';
import type { ValoracionAspectoConfig } from '@piar-digital-app/features/piar/content/assessment-catalogs';

interface ValoracionPedagogicaSectionProps {
  data: ValoracionPedagogicaData;
  onChange: (patch: Partial<ValoracionPedagogicaData>) => void;
}

export const ValoracionPedagogicaSection = memo(function ValoracionPedagogicaSection({
  data,
  onChange,
}: ValoracionPedagogicaSectionProps) {
  const updateRespuesta = (aspectKey: ValoracionAspectoConfig['key'], qId: string, val: boolean | null) => {
    const aspect = data[aspectKey];
    onChange({
      [aspectKey]: { ...aspect, respuestas: { ...aspect.respuestas, [qId]: val } },
    });
  };

  const updateIntensidad = (aspectKey: ValoracionAspectoConfig['key'], val: string) => {
    const aspect = data[aspectKey];
    onChange({ [aspectKey]: { ...aspect, intensidad: val || null } });
  };

  const updateObservacion = (aspectKey: ValoracionAspectoConfig['key'], val: string) => {
    const aspect = data[aspectKey];
    onChange({ [aspectKey]: { ...aspect, observacion: val } });
  };

  return (
    <>
      <SectionGuide sectionId="valoracionPedagogica" guide={sectionGuides.valoracionPedagogica} defaultExpanded={false} />

      <div className="mt-4 space-y-6">
        {VALORACION_ASPECTOS.map((aspecto) => {
          const aspectData = data[aspecto.key];
          return (
            <div key={aspecto.key} className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-4 space-y-3">
              <h3 className="typ-label text-sm font-semibold text-on-surface">{aspecto.label}</h3>

              <div className="space-y-2">
                {aspecto.questions.map((q) => (
                  <div key={q.id} className="flex flex-wrap items-center gap-3">
                    <span className="flex-1 min-w-[200px] text-sm text-on-surface">{q.label}</span>
                    <div className="min-w-[140px]">
                      <select
                        aria-label={`${aspecto.label} - ${q.label}`}
                        value={boolNullToString(aspectData.respuestas[q.id] ?? null)}
                        onChange={(e) => updateRespuesta(aspecto.key, q.id, stringToBoolNull(e.target.value))}
                        className={BOOL_SELECT_CLASS}
                      >
                        <option value="">Sin respuesta</option>
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="typ-label mb-1 block text-sm text-on-surface">
                  Intensidad y duración del apoyo
                </label>
                <select
                  aria-label={`${aspecto.label} - intensidad`}
                  value={aspectData.intensidad ?? ''}
                  onChange={(e) => updateIntensidad(aspecto.key, e.target.value)}
                  className={BOOL_SELECT_CLASS}
                >
                  <option value="">Sin selección</option>
                  {INTENSIDAD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="typ-label mb-1 block text-sm text-on-surface">
                  Observación
                </label>
                <Textarea
                  rows={2}
                  aria-label={`${aspecto.label} - observacion`}
                  value={aspectData.observacion}
                  onChange={(e) => updateObservacion(aspecto.key, e.target.value)}
                />
              </div>
            </div>
          );
        })}

        <div>
          <label className="typ-label mb-1 block text-sm font-medium text-on-surface">
            Observaciones generales
          </label>
          <Textarea
            rows={4}
            aria-label="Observaciones generales de valoración pedagógica"
            value={data.observacionesGenerales}
            onChange={(e) => onChange({ observacionesGenerales: e.target.value })}
          />
        </div>
      </div>
    </>
  );
});
