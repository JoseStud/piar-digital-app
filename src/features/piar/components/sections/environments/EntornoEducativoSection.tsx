/** Educational environment section: prior schooling history, prior pedagogical reports, programs the student participates in. */
'use client';

import { memo } from 'react';
import { Input } from '@piar-digital-app/shared/ui/Input';
import { Textarea } from '@piar-digital-app/shared/ui/Textarea';
import { boolNullToString, stringToBoolNull, BOOL_SELECT_CLASS } from '@piar-digital-app/features/piar/lib/forms/boolSelect';
import { sectionGuides } from '@piar-digital-app/features/piar/content/guidance';
import { SectionGuide } from '@piar-digital-app/features/piar/components/form/SectionGuide';
import type { EntornoEducativoData } from '@piar-digital-app/features/piar/model/piar';

interface EntornoEducativoSectionProps {
  data: EntornoEducativoData;
  onChange: (patch: Partial<EntornoEducativoData>) => void;
}

export const EntornoEducativoSection = memo(function EntornoEducativoSection({
  data,
  onChange,
}: EntornoEducativoSectionProps) {
  const showNoVinculacionMotivo = data.vinculadoOtraInstitucion === false || data.noVinculacionMotivo !== '';

  return (
    <>
      <SectionGuide sectionId="entornoEducativo" guide={sectionGuides.entornoEducativo} defaultExpanded={false} />

      {/* Group 1 — Historial institucional */}
      <div className="mt-4 space-y-3">
        <h3 className="typ-label text-sm font-medium text-on-surface">Historial institucional</h3>

        <div>
          <label htmlFor="educativo-vinculadoOtraInstitucion" className="typ-label mb-1 block text-sm text-on-surface">
            ¿Ha estado vinculado a otra institución educativa?
          </label>
          <select
            id="educativo-vinculadoOtraInstitucion"
            value={boolNullToString(data.vinculadoOtraInstitucion)}
            onChange={(e) => onChange({ vinculadoOtraInstitucion: stringToBoolNull(e.target.value) })}
            className={BOOL_SELECT_CLASS}
          >
            <option value="">Sin respuesta</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>

        {data.vinculadoOtraInstitucion === true && (
          <div>
            <label htmlFor="educativo-institucionesAnteriores" className="typ-label mb-1 block text-sm text-on-surface">
              Instituciones anteriores
            </label>
            <Textarea
              id="educativo-institucionesAnteriores"
              value={data.institucionesAnteriores}
              onChange={(e) => onChange({ institucionesAnteriores: e.target.value })}
              rows={2}
            />
          </div>
        )}

        {showNoVinculacionMotivo && (
          <div>
            <label htmlFor="educativo-noVinculacionMotivo" className="typ-label mb-1 block text-sm text-on-surface">
              Motivo de no vinculación
            </label>
            <Input
              id="educativo-noVinculacionMotivo"
              type="text"
              value={data.noVinculacionMotivo}
              onChange={(e) => onChange({ noVinculacionMotivo: e.target.value })}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="educativo-ultimoGradoCursado" className="typ-label mb-1 block text-sm text-on-surface">
              Último grado cursado
            </label>
            <Input
              id="educativo-ultimoGradoCursado"
              type="text"
              value={data.ultimoGradoCursado}
              onChange={(e) => onChange({ ultimoGradoCursado: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="educativo-estadoGrado" className="typ-label mb-1 block text-sm text-on-surface">
              Estado del grado
            </label>
            <select
              id="educativo-estadoGrado"
              value={data.estadoGrado ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange({
                  estadoGrado: val === '' ? null : (val as EntornoEducativoData['estadoGrado']),
                });
              }}
              className={BOOL_SELECT_CLASS}
            >
              <option value="">Seleccionar</option>
              <option value="aprobado">Aprobado</option>
              <option value="sinTerminar">Sin terminar</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="educativo-observacionesHistorial" className="typ-label mb-1 block text-sm text-on-surface">
            Observaciones del historial
          </label>
          <Textarea
            id="educativo-observacionesHistorial"
            value={data.observacionesHistorial}
            onChange={(e) => onChange({ observacionesHistorial: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      {/* Group 2 — Informe pedagógico */}
      <div className="mt-6 space-y-3">
        <h3 className="typ-label text-sm font-medium text-on-surface">Informe pedagógico</h3>

        <div>
          <label htmlFor="educativo-recibeInformePedagogico" className="typ-label mb-1 block text-sm text-on-surface">
            ¿Recibe informe pedagógico de institución anterior?
          </label>
          <select
            id="educativo-recibeInformePedagogico"
            value={boolNullToString(data.recibeInformePedagogico)}
            onChange={(e) => onChange({ recibeInformePedagogico: stringToBoolNull(e.target.value) })}
            className={BOOL_SELECT_CLASS}
          >
            <option value="">Sin respuesta</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>

        {data.recibeInformePedagogico === true && (
          <div>
            <label htmlFor="educativo-institucionInforme" className="typ-label mb-1 block text-sm text-on-surface">
              Institución que emite el informe
            </label>
            <Input
              id="educativo-institucionInforme"
              type="text"
              value={data.institucionInforme}
              onChange={(e) => onChange({ institucionInforme: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Group 3 — Programas complementarios */}
      <div className="mt-6 space-y-3">
        <h3 className="typ-label text-sm font-medium text-on-surface">Programas complementarios</h3>

        <div>
          <label htmlFor="educativo-programasComplementarios" className="typ-label mb-1 block text-sm text-on-surface">
            ¿Participa en programas complementarios?
          </label>
          <select
            id="educativo-programasComplementarios"
            value={boolNullToString(data.programasComplementarios)}
            onChange={(e) => onChange({ programasComplementarios: stringToBoolNull(e.target.value) })}
            className={BOOL_SELECT_CLASS}
          >
            <option value="">Sin respuesta</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>

        {data.programasComplementarios === true && (
          <div>
            <label htmlFor="educativo-programasCuales" className="typ-label mb-1 block text-sm text-on-surface">
              ¿Cuáles programas?
            </label>
            <Input
              id="educativo-programasCuales"
              type="text"
              value={data.programasCuales}
              onChange={(e) => onChange({ programasCuales: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Group 4 - Desplazamiento */}
      <div className="mt-6 space-y-3">
        <h3 className="typ-label text-sm font-medium text-on-surface">Desplazamiento al colegio</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="educativo-medioTransporte" className="typ-label mb-1 block text-sm text-on-surface">
              Medio de transporte
            </label>
            <Input
              id="educativo-medioTransporte"
              type="text"
              value={data.medioTransporte}
              onChange={(e) => onChange({ medioTransporte: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="educativo-distanciaTiempo" className="typ-label mb-1 block text-sm text-on-surface">
              Distancia y tiempo al colegio
            </label>
            <Input
              id="educativo-distanciaTiempo"
              type="text"
              value={data.distanciaTiempo}
              onChange={(e) => onChange({ distanciaTiempo: e.target.value })}
              placeholder="Ej: 20 minutos en bus"
            />
          </div>
        </div>
      </div>
    </>
  );
});
