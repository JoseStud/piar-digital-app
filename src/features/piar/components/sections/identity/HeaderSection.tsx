/** Renders the HeaderV2 fields (fecha, lugar, persona que diligencia, rol, institución, sede, jornada). */
'use client';

import { memo } from 'react';
import { fieldPlaceholders, sectionGuides } from '@piar-digital-app/features/piar/content/guidance';
import { SectionGuide } from '@piar-digital-app/features/piar/components/form/SectionGuide';
import type { HeaderV2, Jornada } from '@piar-digital-app/features/piar/model/piar';
import { BOOL_SELECT_CLASS } from '@piar-digital-app/features/piar/lib/forms/boolSelect';
import {
  validateFecha,
  validateNotEmpty,
} from '@piar-digital-app/features/piar/lib/forms/field-validation';
import { ValidatedInputField } from '@piar-digital-app/shared/ui/ValidatedInputField';

interface HeaderSectionProps {
  data: HeaderV2;
  onChange: (patch: Partial<HeaderV2>) => void;
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
