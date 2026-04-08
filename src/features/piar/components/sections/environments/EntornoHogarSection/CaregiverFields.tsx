/** Caregiver fields used when madre/padre are absent. */
import { Input } from '@piar-digital-app/shared/ui/Input';
import type { EntornoHogarData } from '@piar-digital-app/features/piar/model/piar';
import { NIVEL_EDUCATIVO_OPTIONS, SELECT_CLASS } from './nivelEducativoOptions';

interface CaregiverFieldsProps {
  data: EntornoHogarData;
  onChange: (patch: Partial<EntornoHogarData>) => void;
}

export function CaregiverFields({ data, onChange }: CaregiverFieldsProps) {
  return (
    <div className="mt-6 space-y-3">
      <h3 className="typ-label text-sm font-medium text-on-surface">Cuidador</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="hogar-nombreCuidador" className="typ-label mb-1 block text-sm text-on-surface">
            Nombre del cuidador
          </label>
          <Input
            id="hogar-nombreCuidador"
            type="text"
            value={data.nombreCuidador}
            onChange={(e) => onChange({ nombreCuidador: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="hogar-parentescoCuidador" className="typ-label mb-1 block text-sm text-on-surface">
            Parentesco
          </label>
          <Input
            id="hogar-parentescoCuidador"
            type="text"
            value={data.parentescoCuidador}
            onChange={(e) => onChange({ parentescoCuidador: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="hogar-nivelEducativoCuidador" className="typ-label mb-1 block text-sm text-on-surface">
            Nivel educativo
          </label>
          <select
            id="hogar-nivelEducativoCuidador"
            value={data.nivelEducativoCuidador}
            onChange={(e) => onChange({ nivelEducativoCuidador: e.target.value })}
            className={SELECT_CLASS}
          >
            {NIVEL_EDUCATIVO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hogar-telefonoCuidador" className="typ-label mb-1 block text-sm text-on-surface">
            Teléfono
          </label>
          <Input
            id="hogar-telefonoCuidador"
            type="text"
            value={data.telefonoCuidador}
            onChange={(e) => onChange({ telefonoCuidador: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="hogar-correoCuidador" className="typ-label mb-1 block text-sm text-on-surface">
            Correo electrónico
          </label>
          <Input
            id="hogar-correoCuidador"
            type="email"
            value={data.correoCuidador}
            onChange={(e) => onChange({ correoCuidador: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
