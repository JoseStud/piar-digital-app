/** Parent fields: madre, padre — names, ages, schooling, occupations. */
import { Input } from '@piar-digital-app/shared/ui/Input';
import type { EntornoHogarData } from '@piar-digital-app/features/piar/model/piar';
import { NIVEL_EDUCATIVO_OPTIONS, SELECT_CLASS } from './nivelEducativoOptions';

interface ParentFieldsProps {
  data: EntornoHogarData;
  onChange: (patch: Partial<EntornoHogarData>) => void;
}

export function ParentFields({ data, onChange }: ParentFieldsProps) {
  return (
    <>
      <div className="mt-4 space-y-3">
        <h3 className="typ-label text-sm font-medium text-on-surface">Madre</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="hogar-nombreMadre" className="typ-label mb-1 block text-sm text-on-surface">
              Nombre de la madre
            </label>
            <Input
              id="hogar-nombreMadre"
              type="text"
              value={data.nombreMadre}
              onChange={(e) => onChange({ nombreMadre: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="hogar-ocupacionMadre" className="typ-label mb-1 block text-sm text-on-surface">
              Ocupación
            </label>
            <Input
              id="hogar-ocupacionMadre"
              type="text"
              value={data.ocupacionMadre}
              onChange={(e) => onChange({ ocupacionMadre: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="hogar-nivelEducativoMadre" className="typ-label mb-1 block text-sm text-on-surface">
              Nivel educativo
            </label>
            <select
              id="hogar-nivelEducativoMadre"
              value={data.nivelEducativoMadre}
              onChange={(e) => onChange({ nivelEducativoMadre: e.target.value })}
              className={SELECT_CLASS}
            >
              {NIVEL_EDUCATIVO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="typ-label text-sm font-medium text-on-surface">Padre</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="hogar-nombrePadre" className="typ-label mb-1 block text-sm text-on-surface">
              Nombre del padre
            </label>
            <Input
              id="hogar-nombrePadre"
              type="text"
              value={data.nombrePadre}
              onChange={(e) => onChange({ nombrePadre: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="hogar-ocupacionPadre" className="typ-label mb-1 block text-sm text-on-surface">
              Ocupación
            </label>
            <Input
              id="hogar-ocupacionPadre"
              type="text"
              value={data.ocupacionPadre}
              onChange={(e) => onChange({ ocupacionPadre: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="hogar-nivelEducativoPadre" className="typ-label mb-1 block text-sm text-on-surface">
              Nivel educativo
            </label>
            <select
              id="hogar-nivelEducativoPadre"
              value={data.nivelEducativoPadre}
              onChange={(e) => onChange({ nivelEducativoPadre: e.target.value })}
              className={SELECT_CLASS}
            >
              {NIVEL_EDUCATIVO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
