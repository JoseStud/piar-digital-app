/** Context sub-fields: tri-state condition flags (hasDiscapacidad, hasTalentos, etc.). */
import { Input } from '@piar-digital-app/shared/ui/Input';
import { boolNullToString, stringToBoolNull, BOOL_SELECT_CLASS } from '@piar-digital-app/features/piar/lib/forms/boolSelect';
import type { StudentV2 } from '@piar-digital-app/features/piar/model/piar';

interface ContextFieldsProps {
  data: StudentV2;
  onChange: (patch: Partial<StudentV2>) => void;
}

export function ContextFields({ data, onChange }: ContextFieldsProps) {
  const showVictimaRegistro = data.victimaConflicto === true || data.victimaConflictoRegistro !== '';
  const showCentroProteccionLugar = data.centroProteccion === true || data.centroProteccionLugar !== '';
  const showGrupoEtnicoCual = data.grupoEtnico === true || data.grupoEtnicoCual !== '';

  return (
    <div className="mt-6">
      <h3 className="typ-label mb-3 text-sm font-medium text-on-surface">Información de contexto</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="student-victimaConflicto" className="typ-label mb-1 block text-sm text-on-surface">¿Se reconoce como víctima del conflicto armado?</label>
          <select
            id="student-victimaConflicto"
            value={boolNullToString(data.victimaConflicto)}
            onChange={(e) => onChange({ victimaConflicto: stringToBoolNull(e.target.value) })}
            className={BOOL_SELECT_CLASS}
          >
            <option value="">Sin respuesta</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <label htmlFor="student-centroProteccion" className="typ-label mb-1 block text-sm text-on-surface">¿Está en algún Centro de Protección?</label>
          <select
            id="student-centroProteccion"
            value={boolNullToString(data.centroProteccion)}
            onChange={(e) => onChange({ centroProteccion: stringToBoolNull(e.target.value) })}
            className={BOOL_SELECT_CLASS}
          >
            <option value="">Sin respuesta</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <label htmlFor="student-grupoEtnico" className="typ-label mb-1 block text-sm text-on-surface">¿Se reconoce o pertenece a un grupo étnico?</label>
          <select
            id="student-grupoEtnico"
            value={boolNullToString(data.grupoEtnico)}
            onChange={(e) => onChange({ grupoEtnico: stringToBoolNull(e.target.value) })}
            className={BOOL_SELECT_CLASS}
          >
            <option value="">Sin respuesta</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      {(showVictimaRegistro || showCentroProteccionLugar || showGrupoEtnicoCual) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {showVictimaRegistro && (
            <div>
              <label htmlFor="student-victimaConflictoRegistro" className="typ-label mb-1 block text-sm text-on-surface">Registro o detalle de víctima</label>
              <Input
                id="student-victimaConflictoRegistro"
                type="text"
                value={data.victimaConflictoRegistro}
                onChange={(e) => onChange({ victimaConflictoRegistro: e.target.value })}
                placeholder="Ej: RUV u observación"
              />
            </div>
          )}
          {showCentroProteccionLugar && (
            <div>
              <label htmlFor="student-centroProteccionLugar" className="typ-label mb-1 block text-sm text-on-surface">Centro de protección</label>
              <Input
                id="student-centroProteccionLugar"
                type="text"
                value={data.centroProteccionLugar}
                onChange={(e) => onChange({ centroProteccionLugar: e.target.value })}
                placeholder="Nombre o lugar"
              />
            </div>
          )}
          {showGrupoEtnicoCual && (
            <div>
              <label htmlFor="student-grupoEtnicoCual" className="typ-label mb-1 block text-sm text-on-surface">¿Cuál grupo étnico?</label>
              <Input
                id="student-grupoEtnicoCual"
                type="text"
                value={data.grupoEtnicoCual}
                onChange={(e) => onChange({ grupoEtnicoCual: e.target.value })}
                placeholder="Ej: Pueblo indígena, raizal"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
