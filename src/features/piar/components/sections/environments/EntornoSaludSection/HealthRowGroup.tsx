import type { EntornoSaludRow } from '@piar-digital-app/features/piar/model/piar';
import { SiNoRow } from './SiNoRow';

interface HealthRowGroupProps {
  title: string;
  rowLabelPrefix: string;
  indices: readonly number[];
  rows: readonly EntornoSaludRow[];
  showHorario?: boolean;
  onRowChange: (index: number, patch: Partial<EntornoSaludRow>) => void;
}

export function HealthRowGroup({
  title,
  rowLabelPrefix,
  indices,
  rows,
  showHorario = false,
  onRowChange,
}: HealthRowGroupProps) {
  return (
    <div className="mt-6 space-y-3">
      <h3 className="typ-label text-sm font-medium text-on-surface">{title}</h3>
      {indices.map((index) => (
        <SiNoRow
          key={index}
          label={`${rowLabelPrefix} ${index + 1}`}
          aplica={rows[index].aplica}
          cual={rows[index].cual}
          frecuencia={rows[index].frecuencia}
          showHorario={showHorario}
          horario={rows[index].horario}
          onAplicaChange={(v) => onRowChange(index, { aplica: v })}
          onCualChange={(v) => onRowChange(index, { cual: v })}
          onFrecuenciaChange={(v) => onRowChange(index, { frecuencia: v })}
          onHorarioChange={(v) => onRowChange(index, { horario: v })}
        />
      ))}
    </div>
  );
}
