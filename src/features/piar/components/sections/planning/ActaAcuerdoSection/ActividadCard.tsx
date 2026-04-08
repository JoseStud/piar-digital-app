/** One actividad row: descripción, responsable, fecha, observaciones. */
import { Input } from '@piar-digital-app/shared/ui/Input';
import { Textarea } from '@piar-digital-app/shared/ui/Textarea';
import type { ActaActividad } from '@piar-digital-app/features/piar/model/piar';

interface ActividadCardProps {
  index: number;
  actividad: ActaActividad;
  onPatch: (patch: Partial<ActaActividad>) => void;
}

export function ActividadCard({ index, actividad, onPatch }: ActividadCardProps) {
  return (
    <div className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-3 space-y-2">
      <span className="typ-label text-xs font-medium text-on-surface-variant">
        Actividad {index + 1}
      </span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div>
          <label
            htmlFor={`acta-actividad-${index}-nombre`}
            className="typ-label mb-1 block text-xs text-on-surface"
          >
            Actividad
          </label>
          <Input
            id={`acta-actividad-${index}-nombre`}
            type="text"
            value={actividad.nombre}
            onChange={(e) => onPatch({ nombre: e.target.value })}
            placeholder="Nombre de la actividad"
          />
        </div>
        <div>
          <label
            htmlFor={`acta-actividad-${index}-frecuencia`}
            className="typ-label mb-1 block text-xs text-on-surface"
          >
            Frecuencia
          </label>
          <Input
            id={`acta-actividad-${index}-frecuencia`}
            type="text"
            value={actividad.frecuencia}
            onChange={(e) => onPatch({ frecuencia: e.target.value })}
            placeholder="Ej: Semanal"
          />
        </div>
        <div className="md:col-span-1">
          <label
            htmlFor={`acta-actividad-${index}-descripcion`}
            className="typ-label mb-1 block text-xs text-on-surface"
          >
            Descripción
          </label>
          <Textarea
            id={`acta-actividad-${index}-descripcion`}
            rows={2}
            value={actividad.descripcion}
            onChange={(e) => onPatch({ descripcion: e.target.value })}
            placeholder="Describe la actividad"
          />
        </div>
      </div>
    </div>
  );
}
