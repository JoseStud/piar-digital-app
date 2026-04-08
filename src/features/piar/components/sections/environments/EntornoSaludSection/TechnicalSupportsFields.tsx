/** Assistive technology and technical support selections. */
import { Input } from '@piar-digital-app/shared/ui/Input';
import { boolNullToString, stringToBoolNull, BOOL_SELECT_CLASS } from '@piar-digital-app/features/piar/lib/forms/boolSelect';
import type { EntornoSaludData } from '@piar-digital-app/features/piar/model/piar';

interface TechnicalSupportsFieldsProps {
  data: EntornoSaludData;
  onChange: (patch: Partial<EntornoSaludData>) => void;
}

export function TechnicalSupportsFields({ data, onChange }: TechnicalSupportsFieldsProps) {
  return (
    <div className="mt-6 space-y-3">
      <h3 className="typ-label text-sm font-medium text-on-surface">Apoyos técnicos/tecnológicos</h3>

      <div>
        <label htmlFor="salud-apoyosTecnicos" className="typ-label mb-1 block text-sm text-on-surface">
          ¿Requiere apoyos técnicos o tecnológicos?
        </label>
        <select
          id="salud-apoyosTecnicos"
          value={boolNullToString(data.apoyosTecnicos)}
          onChange={(e) => onChange({ apoyosTecnicos: stringToBoolNull(e.target.value) })}
          className={BOOL_SELECT_CLASS}
        >
          <option value="">Sin respuesta</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      </div>

      {data.apoyosTecnicos === true && (
        <div>
          <label htmlFor="salud-apoyosTecnicosCuales" className="typ-label mb-1 block text-sm text-on-surface">
            ¿Cuáles apoyos?
          </label>
          <Input
            id="salud-apoyosTecnicosCuales"
            type="text"
            value={data.apoyosTecnicosCuales}
            onChange={(e) => onChange({ apoyosTecnicosCuales: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
