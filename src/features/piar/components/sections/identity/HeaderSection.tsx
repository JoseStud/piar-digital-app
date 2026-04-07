'use client';

import { memo } from 'react';
import { Input } from '@piar-digital-app/shared/ui/Input';
import { fieldPlaceholders, sectionGuides } from '@piar-digital-app/features/piar/content/guidance';
import { SectionGuide } from '@piar-digital-app/features/piar/components/form/SectionGuide';
import type { HeaderV2, Jornada } from '@piar-digital-app/features/piar/model/piar';
import { BOOL_SELECT_CLASS } from '@piar-digital-app/features/piar/lib/forms/boolSelect';

interface HeaderSectionProps {
  data: HeaderV2;
  onChange: (patch: Partial<HeaderV2>) => void;
}

export const HeaderSection = memo(function HeaderSection({ data, onChange }: HeaderSectionProps) {
  return (
    <>
      <SectionGuide sectionId="informacionGeneral" guide={sectionGuides.informacionGeneral} defaultExpanded={false} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="header-fechaDiligenciamiento" className="typ-label mb-1 block text-sm text-on-surface">Fecha de diligenciamiento</label>
          <Input
            id="header-fechaDiligenciamiento"
            type="date"
            value={data.fechaDiligenciamiento}
            onChange={(e) => onChange({ fechaDiligenciamiento: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="header-lugarDiligenciamiento" className="typ-label mb-1 block text-sm text-on-surface">Lugar de diligenciamiento</label>
          <Input
            id="header-lugarDiligenciamiento"
            type="text"
            value={data.lugarDiligenciamiento}
            onChange={(e) => onChange({ lugarDiligenciamiento: e.target.value })}
            placeholder={fieldPlaceholders['header.lugarDiligenciamiento']?.placeholder}
          />
        </div>

        <div>
          <label htmlFor="header-nombrePersonaDiligencia" className="typ-label mb-1 block text-sm text-on-surface">Nombre de la persona que diligencia</label>
          <Input
            id="header-nombrePersonaDiligencia"
            type="text"
            value={data.nombrePersonaDiligencia}
            onChange={(e) => onChange({ nombrePersonaDiligencia: e.target.value })}
            placeholder={fieldPlaceholders['header.nombrePersonaDiligencia']?.placeholder}
          />
        </div>

        <div>
          <label htmlFor="header-rolPersonaDiligencia" className="typ-label mb-1 block text-sm text-on-surface">Rol</label>
          <Input
            id="header-rolPersonaDiligencia"
            type="text"
            value={data.rolPersonaDiligencia}
            onChange={(e) => onChange({ rolPersonaDiligencia: e.target.value })}
            placeholder={fieldPlaceholders['header.rolPersonaDiligencia']?.placeholder}
          />
        </div>

        <div>
          <label htmlFor="header-institucionEducativa" className="typ-label mb-1 block text-sm text-on-surface">Institución educativa</label>
          <Input
            id="header-institucionEducativa"
            type="text"
            value={data.institucionEducativa}
            onChange={(e) => onChange({ institucionEducativa: e.target.value })}
            placeholder={fieldPlaceholders['header.institucionEducativa']?.placeholder}
          />
        </div>

        <div>
          <label htmlFor="header-sede" className="typ-label mb-1 block text-sm text-on-surface">Sede</label>
          <Input
            id="header-sede"
            type="text"
            value={data.sede}
            onChange={(e) => onChange({ sede: e.target.value })}
            placeholder={fieldPlaceholders['header.sede']?.placeholder}
          />
        </div>

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
