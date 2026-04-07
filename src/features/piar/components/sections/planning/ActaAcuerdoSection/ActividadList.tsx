import type { ActaActividad } from '@piar-digital-app/features/piar/model/piar';
import { ActividadCard } from './ActividadCard';

interface ActividadListProps {
  actividades: readonly ActaActividad[];
  onActividadChange: (index: 0 | 1 | 2 | 3 | 4, patch: Partial<ActaActividad>) => void;
}

export function ActividadList({ actividades, onActividadChange }: ActividadListProps) {
  return (
    <div className="mt-6 space-y-3">
      <h3 className="typ-label text-sm font-semibold text-on-surface">Actividades</h3>
      {([0, 1, 2, 3, 4] as const).map((index) => (
        <ActividadCard
          key={index}
          index={index}
          actividad={actividades[index]}
          onPatch={(patch) => onActividadChange(index, patch)}
        />
      ))}
    </div>
  );
}
