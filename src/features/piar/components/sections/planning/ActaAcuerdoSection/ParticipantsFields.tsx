import { Input } from '@piar-digital-app/shared/ui/Input';
import { Textarea } from '@piar-digital-app/shared/ui/Textarea';
import type { ActaAcuerdoData } from '@piar-digital-app/features/piar/model/piar';

interface ParticipantsFieldsProps {
  data: ActaAcuerdoData;
  onChange: (patch: Partial<ActaAcuerdoData>) => void;
}

export function ParticipantsFields({ data, onChange }: ParticipantsFieldsProps) {
  return (
    <div className="mt-6 space-y-3">
      <h3 className="typ-label text-sm font-semibold text-on-surface">Participantes del acta</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="acta-equipoDirectivosDocentes" className="typ-label mb-1 block text-sm text-on-surface">
            Equipo directivos y docentes
          </label>
          <Textarea
            id="acta-equipoDirectivosDocentes"
            value={data.equipoDirectivosDocentes}
            onChange={(e) => onChange({ equipoDirectivosDocentes: e.target.value })}
            rows={2}
          />
        </div>
        <div>
          <label htmlFor="acta-familiaParticipante" className="typ-label mb-1 block text-sm text-on-surface">
            Familia participante
          </label>
          <Textarea
            id="acta-familiaParticipante"
            value={data.familiaParticipante}
            onChange={(e) => onChange({ familiaParticipante: e.target.value })}
            rows={2}
          />
        </div>
        <div>
          <label htmlFor="acta-parentescoFamiliaParticipante" className="typ-label mb-1 block text-sm text-on-surface">
            Parentesco de la familia participante
          </label>
          <Input
            id="acta-parentescoFamiliaParticipante"
            type="text"
            value={data.parentescoFamiliaParticipante}
            onChange={(e) => onChange({ parentescoFamiliaParticipante: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
