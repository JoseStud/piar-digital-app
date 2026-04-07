import { Input } from '@/shared/ui/Input';
import { boolNullToString, stringToBoolNull, BOOL_SELECT_CLASS } from '@/features/piar/lib/forms/boolSelect';
import type { EntornoSaludData } from '@/features/piar/model/piar';

interface CoverageFieldsProps {
  data: EntornoSaludData;
  onChange: (patch: Partial<EntornoSaludData>) => void;
}

export function CoverageFields({ data, onChange }: CoverageFieldsProps) {
  const showCoverageDetails = data.afiliacionSalud === true
    || data.regimen !== null
    || data.regimenCual !== ''
    || data.eps !== '';

  return (
    <div className="mt-4 space-y-3">
      <h3 className="typ-label text-sm font-medium text-on-surface">Afiliación al sistema de salud</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="salud-afiliacionSalud" className="typ-label mb-1 block text-sm text-on-surface">
            Afiliación al sistema de salud
          </label>
          <select
            id="salud-afiliacionSalud"
            value={boolNullToString(data.afiliacionSalud)}
            onChange={(e) => onChange({ afiliacionSalud: stringToBoolNull(e.target.value) })}
            className={BOOL_SELECT_CLASS}
          >
            <option value="">Sin respuesta</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>

        {showCoverageDetails && (
          <div>
            <label htmlFor="salud-regimen" className="typ-label mb-1 block text-sm text-on-surface">
              Régimen
            </label>
            <select
              id="salud-regimen"
              value={data.regimen ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange({
                  regimen: val === '' ? null : (val as EntornoSaludData['regimen']),
                });
              }}
              className={BOOL_SELECT_CLASS}
            >
              <option value="">Seleccionar</option>
              <option value="contributivo">Contributivo</option>
              <option value="subsidiado">Subsidiado</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        )}
      </div>

      {showCoverageDetails && (
        <div>
          <label htmlFor="salud-eps" className="typ-label mb-1 block text-sm text-on-surface">
            EPS
          </label>
          <Input
            id="salud-eps"
            type="text"
            value={data.eps}
            onChange={(e) => onChange({ eps: e.target.value })}
            placeholder="Entidad promotora de salud"
          />
        </div>
      )}

      {data.regimen === 'otro' && (
        <div>
          <label htmlFor="salud-regimenCual" className="typ-label mb-1 block text-sm text-on-surface">
            ¿Cuál régimen?
          </label>
          <Input
            id="salud-regimenCual"
            type="text"
            value={data.regimenCual}
            onChange={(e) => onChange({ regimenCual: e.target.value })}
          />
        </div>
      )}

      <div>
        <label htmlFor="salud-lugarAtencionEmergencia" className="typ-label mb-1 block text-sm text-on-surface">
          Lugar de atención en emergencia
        </label>
        <Input
          id="salud-lugarAtencionEmergencia"
          type="text"
          value={data.lugarAtencionEmergencia}
          onChange={(e) => onChange({ lugarAtencionEmergencia: e.target.value })}
        />
      </div>
    </div>
  );
}
