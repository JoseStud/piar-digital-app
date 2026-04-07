import { Input } from '@piar-digital-app/shared/ui/Input';
import { boolNullToString, stringToBoolNull, BOOL_SELECT_CLASS } from '@piar-digital-app/features/piar/lib/forms/boolSelect';
import type { StudentV2, TipoIdentificacion } from '@piar-digital-app/features/piar/model/piar';

interface IdentityFieldsProps {
  data: StudentV2;
  onChange: (patch: Partial<StudentV2>) => void;
}

export function IdentityFields({ data, onChange }: IdentityFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="student-nombres" className="typ-label mb-1 block text-sm text-on-surface">Nombres</label>
          <Input
            id="student-nombres"
            type="text"
            value={data.nombres}
            onChange={(e) => onChange({ nombres: e.target.value })}
            placeholder="Ej: Juan David"
          />
        </div>
        <div>
          <label htmlFor="student-apellidos" className="typ-label mb-1 block text-sm text-on-surface">Apellidos</label>
          <Input
            id="student-apellidos"
            type="text"
            value={data.apellidos}
            onChange={(e) => onChange({ apellidos: e.target.value })}
            placeholder="Ej: Martínez Rojas"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div>
          <label htmlFor="student-tipoIdentificacion" className="typ-label mb-1 block text-sm text-on-surface">Tipo de identificación</label>
          <select
            id="student-tipoIdentificacion"
            value={data.tipoIdentificacion}
            onChange={(e) => onChange({ tipoIdentificacion: e.target.value as TipoIdentificacion })}
            className={BOOL_SELECT_CLASS}
          >
            <option value="">Seleccionar</option>
            <option value="TI">TI</option>
            <option value="CC">CC</option>
            <option value="CE">CE</option>
            <option value="RC">RC</option>
            <option value="NUIP">NUIP</option>
            <option value="PEP">PEP</option>
            <option value="PPT">PPT</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label htmlFor="student-numeroIdentificacion" className="typ-label mb-1 block text-sm text-on-surface">Número de identificación</label>
          <Input
            id="student-numeroIdentificacion"
            type="text"
            value={data.numeroIdentificacion}
            onChange={(e) => onChange({ numeroIdentificacion: e.target.value })}
            placeholder="Ej: 1.098.765.432"
          />
        </div>
        <div>
          <label htmlFor="student-lugarNacimiento" className="typ-label mb-1 block text-sm text-on-surface">Lugar de nacimiento</label>
          <Input
            id="student-lugarNacimiento"
            type="text"
            value={data.lugarNacimiento}
            onChange={(e) => onChange({ lugarNacimiento: e.target.value })}
            placeholder="Ej: Bogotá"
          />
        </div>
        <div>
          <label htmlFor="student-fechaNacimiento" className="typ-label mb-1 block text-sm text-on-surface">Fecha de nacimiento</label>
          <Input
            id="student-fechaNacimiento"
            type="date"
            value={data.fechaNacimiento}
            onChange={(e) => onChange({ fechaNacimiento: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div>
          <label htmlFor="student-edad" className="typ-label mb-1 block text-sm text-on-surface">Edad</label>
          <Input
            id="student-edad"
            type="text"
            value={data.edad}
            onChange={(e) => onChange({ edad: e.target.value })}
            placeholder="Ej: 10 años"
          />
        </div>
        <div>
          <label htmlFor="student-grado" className="typ-label mb-1 block text-sm text-on-surface">Grado</label>
          <Input
            id="student-grado"
            type="text"
            value={data.grado}
            onChange={(e) => onChange({ grado: e.target.value })}
            placeholder="Ej: 5° de primaria"
          />
        </div>
        <div>
          <label htmlFor="student-gradoAspiraIngresar" className="typ-label mb-1 block text-sm text-on-surface">Grado al que aspira ingresar</label>
          <Input
            id="student-gradoAspiraIngresar"
            type="text"
            value={data.gradoAspiraIngresar}
            onChange={(e) => onChange({ gradoAspiraIngresar: e.target.value })}
            placeholder="Ej: 6°"
          />
        </div>
        <div>
          <label htmlFor="student-vinculadoSistemaAnterior" className="typ-label mb-1 block text-sm text-on-surface">¿El año anterior estuvo vinculado al Sistema Educativo?</label>
          <select
            id="student-vinculadoSistemaAnterior"
            value={boolNullToString(data.vinculadoSistemaAnterior)}
            onChange={(e) => onChange({ vinculadoSistemaAnterior: stringToBoolNull(e.target.value) })}
            className={BOOL_SELECT_CLASS}
          >
            <option value="">Sin respuesta</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
    </>
  );
}
