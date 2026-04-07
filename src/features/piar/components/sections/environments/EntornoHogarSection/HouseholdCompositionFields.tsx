import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { boolNullToString, stringToBoolNull, BOOL_SELECT_CLASS } from '@/features/piar/lib/forms/boolSelect';
import type { EntornoHogarData } from '@/features/piar/model/piar';

interface HouseholdCompositionFieldsProps {
  data: EntornoHogarData;
  onChange: (patch: Partial<EntornoHogarData>) => void;
}

export function HouseholdCompositionFields({ data, onChange }: HouseholdCompositionFieldsProps) {
  return (
    <div className="mt-6 space-y-3">
      <h3 className="typ-label text-sm font-medium text-on-surface">Composición del hogar</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="hogar-numHermanos" className="typ-label mb-1 block text-sm text-on-surface">
            Número de hermanos
          </label>
          <Input
            id="hogar-numHermanos"
            type="text"
            value={data.numHermanos}
            onChange={(e) => onChange({ numHermanos: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="hogar-lugarQueOcupa" className="typ-label mb-1 block text-sm text-on-surface">
            Lugar que ocupa entre los hermanos
          </label>
          <Input
            id="hogar-lugarQueOcupa"
            type="text"
            value={data.lugarQueOcupa}
            onChange={(e) => onChange({ lugarQueOcupa: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label htmlFor="hogar-quienesApoyaCrianza" className="typ-label mb-1 block text-sm text-on-surface">
          ¿Quiénes apoyan la crianza?
        </label>
        <Textarea
          id="hogar-quienesApoyaCrianza"
          value={data.quienesApoyaCrianza}
          onChange={(e) => onChange({ quienesApoyaCrianza: e.target.value })}
          rows={2}
        />
      </div>
      <div>
        <label htmlFor="hogar-personasConQuienVive" className="typ-label mb-1 block text-sm text-on-surface">
          Personas con quienes vive
        </label>
        <Textarea
          id="hogar-personasConQuienVive"
          value={data.personasConQuienVive}
          onChange={(e) => onChange({ personasConQuienVive: e.target.value })}
          rows={2}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="hogar-estaBajoProteccion" className="typ-label mb-1 block text-sm text-on-surface">
            ¿Está bajo protección?
          </label>
          <select
            id="hogar-estaBajoProteccion"
            value={boolNullToString(data.estaBajoProteccion)}
            onChange={(e) => onChange({ estaBajoProteccion: stringToBoolNull(e.target.value) })}
            className={BOOL_SELECT_CLASS}
          >
            <option value="">Sin respuesta</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <label htmlFor="hogar-subsidioEntidad" className="typ-label mb-1 block text-sm text-on-surface">
            Entidad que entrega subsidio
          </label>
          <Input
            id="hogar-subsidioEntidad"
            type="text"
            value={data.subsidioEntidad}
            onChange={(e) => onChange({ subsidioEntidad: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="hogar-subsidioCual" className="typ-label mb-1 block text-sm text-on-surface">
            ¿Cuál subsidio?
          </label>
          <Input
            id="hogar-subsidioCual"
            type="text"
            value={data.subsidioCual}
            onChange={(e) => onChange({ subsidioCual: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
