/** Renders the HeaderV2 fields (fecha, lugar, persona que diligencia, rol, institución, sede, jornada). */
'use client';

import { memo, useRef, useState, type ChangeEvent } from 'react';
import { FieldHint } from '@piar-digital-app/shared/ui/FieldHint';
import { Input, type InputProps } from '@piar-digital-app/shared/ui/Input';
import { fieldPlaceholders, sectionGuides } from '@piar-digital-app/features/piar/content/guidance';
import { SectionGuide } from '@piar-digital-app/features/piar/components/form/SectionGuide';
import type { HeaderV2, Jornada } from '@piar-digital-app/features/piar/model/piar';
import { BOOL_SELECT_CLASS } from '@piar-digital-app/features/piar/lib/forms/boolSelect';
import {
  validateFecha,
  validateNotEmpty,
} from '@piar-digital-app/features/piar/lib/forms/field-validation';

interface HeaderSectionProps {
  data: HeaderV2;
  onChange: (patch: Partial<HeaderV2>) => void;
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

export const HeaderSection = memo(function HeaderSection({ data, onChange }: HeaderSectionProps) {
  return (
    <>
      <SectionGuide sectionId="informacionGeneral" guide={sectionGuides.informacionGeneral} defaultExpanded={false} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ValidatedInputField
          id="header-fechaDiligenciamiento"
          label="Fecha de diligenciamiento"
          type="date"
          value={data.fechaDiligenciamiento}
          onValueChange={(value) => onChange({ fechaDiligenciamiento: value })}
          validate={validateFecha}
        />

        <ValidatedInputField
          id="header-lugarDiligenciamiento"
          label="Lugar de diligenciamiento"
          type="text"
          value={data.lugarDiligenciamiento}
          onValueChange={(value) => onChange({ lugarDiligenciamiento: value })}
          placeholder={fieldPlaceholders['header.lugarDiligenciamiento']?.placeholder}
          validate={(value) => validateNotEmpty(value, 'Lugar de diligenciamiento')}
        />

        <ValidatedInputField
          id="header-nombrePersonaDiligencia"
          label="Nombre de la persona que diligencia"
          type="text"
          value={data.nombrePersonaDiligencia}
          onValueChange={(value) => onChange({ nombrePersonaDiligencia: value })}
          placeholder={fieldPlaceholders['header.nombrePersonaDiligencia']?.placeholder}
          validate={(value) => validateNotEmpty(value, 'Nombre de la persona que diligencia')}
        />

        <ValidatedInputField
          id="header-rolPersonaDiligencia"
          label="Rol"
          type="text"
          value={data.rolPersonaDiligencia}
          onValueChange={(value) => onChange({ rolPersonaDiligencia: value })}
          placeholder={fieldPlaceholders['header.rolPersonaDiligencia']?.placeholder}
          validate={(value) => validateNotEmpty(value, 'Rol')}
        />

        <ValidatedInputField
          id="header-institucionEducativa"
          label="Institución educativa"
          type="text"
          value={data.institucionEducativa}
          onValueChange={(value) => onChange({ institucionEducativa: value })}
          placeholder={fieldPlaceholders['header.institucionEducativa']?.placeholder}
          validate={(value) => validateNotEmpty(value, 'Institución educativa')}
        />

        <ValidatedInputField
          id="header-sede"
          label="Sede"
          type="text"
          value={data.sede}
          onValueChange={(value) => onChange({ sede: value })}
          placeholder={fieldPlaceholders['header.sede']?.placeholder}
          validate={(value) => validateNotEmpty(value, 'Sede')}
        />

        <div>
          <label htmlFor="header-jornada" className="typ-label mb-1 block text-sm text-on-surface">Jornada</label>
          <select
            id="header-jornada"
            value={data.jornada}
            onChange={(e) => onChange({ jornada: e.target.value as Jornada })}
            className={BOOL_SELECT_CLASS}
          >
            <option value="">Seleccionar</option>
            <option value="mañana">Mañana</option>
            <option value="tarde">Tarde</option>
            <option value="nocturna">Nocturna</option>
            <option value="completa">Completa</option>
            <option value="finde">Fin de semana</option>
          </select>
        </div>

        {/* TODO Plan 5: remove once firmas migrated */}
        {/* docentes and area fields moved to firmas section in V2 */}
      </div>
    </>
  );
});
