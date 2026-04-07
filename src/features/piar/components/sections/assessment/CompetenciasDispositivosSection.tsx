'use client';

import React, { memo } from 'react';
import { boolNullToString, stringToBoolNull, BOOL_SELECT_CLASS } from '@/features/piar/lib/forms/boolSelect';
import { Textarea } from '@/shared/ui/Textarea';
import { sectionGuides } from '@/features/piar/content/guidance';
import { SectionGuide } from '@/features/piar/components/form/SectionGuide';
import { COMPETENCIAS_GRUPOS } from '@/features/piar/content/assessment-catalogs';
import type { CompetenciasDispositivosData } from '@/features/piar/model/piar';
import type { CompetenciaGroup } from '@/features/piar/content/assessment-catalogs';

interface CompetenciasDispositivosSectionProps {
  data: CompetenciasDispositivosData;
  onChange: (patch: Partial<CompetenciasDispositivosData>) => void;
}

export const CompetenciasDispositivosSection = memo(function CompetenciasDispositivosSection({
  data,
  onChange,
}: CompetenciasDispositivosSectionProps) {
  const updateItem = (groupKey: CompetenciaGroup['key'], itemId: string, val: boolean | null) => {
    onChange({
      [groupKey]: { ...data[groupKey], [itemId]: val },
    });
  };

  return (
    <>
      <SectionGuide sectionId="competenciasDispositivos" guide={sectionGuides.competenciasDispositivos} defaultExpanded={false} />

      <div className="mt-4 space-y-6">
        {COMPETENCIAS_GRUPOS.map((group) => {
          const groupData = data[group.key];
          return (
            <div key={group.key} className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-4 space-y-2">
              <h3 className="typ-label text-sm font-semibold text-on-surface">{group.label}</h3>

              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center gap-3">
                    <span className="flex-1 min-w-[200px] text-sm text-on-surface">{item.label}</span>
                    <div className="min-w-[140px]">
                      <select
                        aria-label={`${group.label} - ${item.label}`}
                        value={boolNullToString(groupData[item.id] ?? null)}
                        onChange={(e) => updateItem(group.key, item.id, stringToBoolNull(e.target.value))}
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
            </div>
          );
        })}

        <div>
          <label className="typ-label mb-1 block text-sm font-medium text-on-surface">
            Observaciones generales de competencias
          </label>
          <Textarea
            rows={4}
            aria-label="Observaciones generales de competencias"
            value={data.observacionesCompetencias}
            onChange={(e) => onChange({ observacionesCompetencias: e.target.value })}
          />
        </div>
      </div>
    </>
  );
});
