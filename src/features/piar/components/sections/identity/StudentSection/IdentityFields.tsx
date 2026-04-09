/** Identity sub-fields: nombres, apellidos, documento, fecha de nacimiento, género. */
import { useRef, useState, type ChangeEvent } from 'react';
import { FieldHint } from '@piar-digital-app/shared/ui/FieldHint';
import { Input, type InputProps } from '@piar-digital-app/shared/ui/Input';
import { boolNullToString, stringToBoolNull, BOOL_SELECT_CLASS } from '@piar-digital-app/features/piar/lib/forms/boolSelect';
import type { StudentV2, TipoIdentificacion } from '@piar-digital-app/features/piar/model/piar';
import {
  validateAge,
  validateFecha,
  validateNumericId,
  validateNotEmpty,
} from '@piar-digital-app/features/piar/lib/forms/field-validation';

interface IdentityFieldsProps {
  data: StudentV2;
  onChange: (patch: Partial<StudentV2>) => void;
}

type Validator = (value: string) => string | null;

interface ValidatedInputFieldProps extends Omit<InputProps, 'id' | 'value' | 'onChange' | 'onBlur'> {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  validate: Validator;
}

function ValidatedInputField({
  id,
  label,
  value,
  onValueChange,
  validate,
  ...inputProps
}: ValidatedInputFieldProps) {
  const [hint, setHint] = useState<string | null>(null);
  const hasInteractedRef = useRef(false);
  const hintId = `${id}-hint`;

  const handleBlur = () => {
    const shouldValidate = hasInteractedRef.current || value.trim().length > 0;
    hasInteractedRef.current = true;
    setHint(shouldValidate ? validate(value) : null);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    hasInteractedRef.current = true;
    onValueChange(event.target.value);
    if (hint) {
      setHint(null);
    }
  };

  return (
    <div>
      <label htmlFor={id} className="typ-label mb-1 block text-sm text-on-surface">{label}</label>
      <Input
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={Boolean(hint)}
        aria-describedby={hint ? hintId : undefined}
        {...inputProps}
      />
      <div id={hintId}>
        <FieldHint message={hint} />
      </div>
    </div>
  );
}

export function IdentityFields({ data, onChange }: IdentityFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <ValidatedInputField
          id="student-nombres"
          label="Nombres"
          type="text"
          value={data.nombres}
          onValueChange={(value) => onChange({ nombres: value })}
          placeholder="Ej: Juan David"
          validate={(value) => validateNotEmpty(value, 'Nombres')}
        />
        <ValidatedInputField
          id="student-apellidos"
          label="Apellidos"
          type="text"
          value={data.apellidos}
          onValueChange={(value) => onChange({ apellidos: value })}
          placeholder="Ej: Martínez Rojas"
          validate={(value) => validateNotEmpty(value, 'Apellidos')}
        />
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
        <ValidatedInputField
          id="student-numeroIdentificacion"
          label="Número de identificación"
          type="text"
          value={data.numeroIdentificacion}
          onValueChange={(value) => onChange({ numeroIdentificacion: value })}
          placeholder="Ej: 1098765432"
          validate={validateNumericId}
        />
        <ValidatedInputField
          id="student-lugarNacimiento"
          label="Lugar de nacimiento"
          type="text"
          value={data.lugarNacimiento}
          onValueChange={(value) => onChange({ lugarNacimiento: value })}
          placeholder="Ej: Bogotá"
          validate={(value) => validateNotEmpty(value, 'Lugar de nacimiento')}
        />
        <ValidatedInputField
          id="student-fechaNacimiento"
          label="Fecha de nacimiento"
          type="date"
          value={data.fechaNacimiento}
          onValueChange={(value) => onChange({ fechaNacimiento: value })}
          validate={validateFecha}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <ValidatedInputField
          id="student-edad"
          label="Edad"
          type="text"
          value={data.edad}
          onValueChange={(value) => onChange({ edad: value })}
          placeholder="Ej: 10 años"
          validate={validateAge}
        />
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
