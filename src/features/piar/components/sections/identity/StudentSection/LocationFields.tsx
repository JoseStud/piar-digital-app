/** Location sub-fields: dirección, municipio, departamento, etc. */
import { Input } from '@piar-digital-app/shared/ui/Input';
import type { StudentV2 } from '@piar-digital-app/features/piar/model/piar';

interface LocationFieldsProps {
  data: StudentV2;
  onChange: (patch: Partial<StudentV2>) => void;
}

export function LocationFields({ data, onChange }: LocationFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div>
          <label htmlFor="student-departamento" className="typ-label mb-1 block text-sm text-on-surface">Departamento</label>
          <Input
            id="student-departamento"
            type="text"
            value={data.departamento}
            onChange={(e) => onChange({ departamento: e.target.value })}
            placeholder="Ej: Cundinamarca"
          />
        </div>
        <div>
          <label htmlFor="student-municipio" className="typ-label mb-1 block text-sm text-on-surface">Municipio</label>
          <Input
            id="student-municipio"
            type="text"
            value={data.municipio}
            onChange={(e) => onChange({ municipio: e.target.value })}
            placeholder="Ej: Bogotá"
          />
        </div>
        <div>
          <label htmlFor="student-barrio" className="typ-label mb-1 block text-sm text-on-surface">Barrio / Vereda</label>
          <Input
            id="student-barrio"
            type="text"
            value={data.barrio}
            onChange={(e) => onChange({ barrio: e.target.value })}
            placeholder="Ej: El Prado"
          />
        </div>
        <div>
          <label htmlFor="student-direccion" className="typ-label mb-1 block text-sm text-on-surface">Dirección</label>
          <Input
            id="student-direccion"
            type="text"
            value={data.direccion}
            onChange={(e) => onChange({ direccion: e.target.value })}
            placeholder="Ej: Calle 45 #12-30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="student-telefono" className="typ-label mb-1 block text-sm text-on-surface">Teléfono</label>
          <Input
            id="student-telefono"
            type="text"
            value={data.telefono}
            onChange={(e) => onChange({ telefono: e.target.value })}
            placeholder="Ej: 310 456 7890"
          />
        </div>
        <div>
          <label htmlFor="student-correo" className="typ-label mb-1 block text-sm text-on-surface">Correo electrónico</label>
          <Input
            id="student-correo"
            type="email"
            value={data.correo}
            onChange={(e) => onChange({ correo: e.target.value })}
            placeholder="Ej: acudiente@ejemplo.com"
          />
        </div>
      </div>
    </>
  );
}
