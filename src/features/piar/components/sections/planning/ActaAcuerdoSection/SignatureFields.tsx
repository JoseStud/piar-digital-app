import { Input } from '@piar-digital-app/shared/ui/Input';
import type { ActaAcuerdoData } from '@piar-digital-app/features/piar/model/piar';

interface SignatureFieldsProps {
  data: ActaAcuerdoData;
  onChange: (patch: Partial<ActaAcuerdoData>) => void;
}

export function SignatureFields({ data, onChange }: SignatureFieldsProps) {
  return (
    <div className="mt-6 space-y-3">
      <h3 className="typ-label text-sm font-semibold text-on-surface">Firmas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="acta-firmaEstudiante" className="typ-label mb-1 block text-sm text-on-surface">
            Firma del estudiante
          </label>
          <Input
            id="acta-firmaEstudiante"
            type="text"
            value={data.firmaEstudiante}
            onChange={(e) => onChange({ firmaEstudiante: e.target.value })}
            placeholder="Firma del estudiante"
          />
        </div>
        <div>
          <label htmlFor="acta-firmaAcudiente" className="typ-label mb-1 block text-sm text-on-surface">
            Firma del acudiente
          </label>
          <Input
            id="acta-firmaAcudiente"
            type="text"
            value={data.firmaAcudiente}
            onChange={(e) => onChange({ firmaAcudiente: e.target.value })}
            placeholder="Firma del acudiente"
          />
        </div>
        <div>
          <label htmlFor="acta-firmaDocentes" className="typ-label mb-1 block text-sm text-on-surface">
            Firma de docentes
          </label>
          <Input
            id="acta-firmaDocentes"
            type="text"
            value={data.firmaDocentes}
            onChange={(e) => onChange({ firmaDocentes: e.target.value })}
            placeholder="Firma de docentes"
          />
        </div>
        <div>
          <label htmlFor="acta-firmaDirectivo" className="typ-label mb-1 block text-sm text-on-surface">
            Firma del directivo docente
          </label>
          <Input
            id="acta-firmaDirectivo"
            type="text"
            value={data.firmaDirectivo}
            onChange={(e) => onChange({ firmaDirectivo: e.target.value })}
            placeholder="Firma del directivo docente"
          />
        </div>
      </div>
    </div>
  );
}
