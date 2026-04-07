import { Input } from '@/shared/ui/Input';
import { boolNullToString, stringToBoolNull, BOOL_SELECT_CLASS } from '@/features/piar/lib/forms/boolSelect';

interface SiNoRowProps {
  label: string;
  aplica: boolean | null;
  cual: string;
  frecuencia: string;
  showHorario?: boolean;
  horario?: string;
  onAplicaChange: (v: boolean | null) => void;
  onCualChange: (v: string) => void;
  onFrecuenciaChange: (v: string) => void;
  onHorarioChange?: (v: string) => void;
}

export function SiNoRow({
  label,
  aplica,
  cual,
  frecuencia,
  showHorario = false,
  horario = '',
  onAplicaChange,
  onCualChange,
  onFrecuenciaChange,
  onHorarioChange,
}: SiNoRowProps) {
  return (
    <div className="rounded-lg border border-outline-variant/10 bg-surface-container-lowest p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="typ-label text-sm text-on-surface font-medium min-w-[160px]">{label}</span>
        <div className="flex-1 min-w-[120px]">
          <select
            aria-label={`${label} - aplica`}
            value={boolNullToString(aplica)}
            onChange={(e) => onAplicaChange(stringToBoolNull(e.target.value))}
            className={BOOL_SELECT_CLASS}
          >
            <option value="">Sin respuesta</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="typ-label mb-1 block text-xs text-on-surface-variant">¿Cuál?</label>
          <Input
            type="text"
            value={cual}
            onChange={(e) => onCualChange(e.target.value)}
            aria-label={`${label} - cual`}
          />
        </div>
        <div>
          <label className="typ-label mb-1 block text-xs text-on-surface-variant">Frecuencia</label>
          <Input
            type="text"
            value={frecuencia}
            onChange={(e) => onFrecuenciaChange(e.target.value)}
            aria-label={`${label} - frecuencia`}
          />
        </div>
        {showHorario && (
          <div>
            <label className="typ-label mb-1 block text-xs text-on-surface-variant">Horario</label>
            <Input
              type="text"
              value={horario}
              onChange={(e) => onHorarioChange?.(e.target.value)}
              aria-label={`${label} - horario`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
