import { Input } from '@/shared/ui/Input';
import { boolNullToString, stringToBoolNull, BOOL_SELECT_CLASS } from '@/features/piar/lib/forms/boolSelect';
import type { EntornoSaludData } from '@/features/piar/model/piar';

interface DiagnosisFieldsProps {
  data: EntornoSaludData;
  onChange: (patch: Partial<EntornoSaludData>) => void;
}

export function DiagnosisFields({ data, onChange }: DiagnosisFieldsProps) {
  return (
    <div className="mt-6 space-y-3">
      <h3 className="typ-label text-sm font-medium text-on-surface">Diagnóstico médico</h3>

      <div>
        <label htmlFor="salud-diagnosticoMedico" className="typ-label mb-1 block text-sm text-on-surface">
          ¿Tiene diagnóstico médico?
        </label>
        <select
          id="salud-diagnosticoMedico"
          value={boolNullToString(data.diagnosticoMedico)}
          onChange={(e) => onChange({ diagnosticoMedico: stringToBoolNull(e.target.value) })}
          className={BOOL_SELECT_CLASS}
        >
          <option value="">Sin respuesta</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      </div>

      {data.diagnosticoMedico === true && (
        <div>
          <label htmlFor="salud-diagnosticoCual" className="typ-label mb-1 block text-sm text-on-surface">
            ¿Cuál diagnóstico?
          </label>
          <Input
            id="salud-diagnosticoCual"
            type="text"
            value={data.diagnosticoCual}
            onChange={(e) => onChange({ diagnosticoCual: e.target.value })}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="salud-sectorSaludFrecuencia" className="typ-label mb-1 block text-sm text-on-surface">
            Frecuencia de atención en sector salud
          </label>
          <Input
            id="salud-sectorSaludFrecuencia"
            type="text"
            value={data.sectorSaludFrecuencia}
            onChange={(e) => onChange({ sectorSaludFrecuencia: e.target.value })}
            placeholder="Ej: mensual, controles semestrales"
          />
        </div>
        <div>
          <label htmlFor="salud-tratamientoMedicoCual" className="typ-label mb-1 block text-sm text-on-surface">
            Tratamiento médico actual
          </label>
          <Input
            id="salud-tratamientoMedicoCual"
            type="text"
            value={data.tratamientoMedicoCual}
            onChange={(e) => onChange({ tratamientoMedicoCual: e.target.value })}
            placeholder="Tratamiento o seguimiento indicado"
          />
        </div>
      </div>
    </div>
  );
}
