/** Free-text "Descripción de habilidades" and "Estrategias y acciones" sections. Both are simple textareas with auto-grow. */
'use client';

import React, { memo } from 'react';
import { Textarea } from '@piar-digital-app/shared/ui/Textarea';

interface DescripcionHabilidadesSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export const DescripcionHabilidadesSection = memo(function DescripcionHabilidadesSection({
  value,
  onChange,
}: DescripcionHabilidadesSectionProps) {
  return (
    <div className="space-y-3">
      <Textarea
        aria-label="Descripción de Habilidades y Destrezas del Estudiante"
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
});

interface EstrategiasAccionesSectionProps {
  value: string;
  fechaRevision: string;
  onValueChange: (value: string) => void;
  onFechaRevisionChange: (value: string) => void;
}

export const EstrategiasAccionesSection = memo(function EstrategiasAccionesSection({
  value,
  fechaRevision,
  onValueChange,
  onFechaRevisionChange,
}: EstrategiasAccionesSectionProps) {
  return (
    <div className="space-y-3">
      <Textarea
        aria-label="Estrategias y/o Acciones a Desarrollar con el Estudiante"
        rows={6}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha sugerida de próxima revisión y actualización
        </label>
        <p className="text-xs text-gray-500 mb-1">
          Anualmente en el proceso ordinario; actualizar si hay cambios en el estudiante o su contexto.
        </p>
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm"
          value={fechaRevision}
          onChange={(e) => onFechaRevisionChange(e.target.value)}
        />
      </div>
    </div>
  );
});
