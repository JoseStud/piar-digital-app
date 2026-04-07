import { Input } from '@/shared/ui/Input';
import type { HeaderV2, StudentV2 } from '@/features/piar/model/piar';
import { formatSedeJornada, formatStudentFullName } from './formatters';

interface ActaSummaryFieldsProps {
  header: HeaderV2;
  student: StudentV2;
}

export function ActaSummaryFields({ header, student }: ActaSummaryFieldsProps) {
  const studentFullName = formatStudentFullName(student);

  return (
    <>
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="typ-label text-sm font-semibold text-on-surface">Datos sincronizados del acta</h3>
          <p className="text-xs text-on-surface-variant">Se toman de Información General.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="acta-fechaDiligenciamiento" className="typ-label mb-1 block text-sm text-on-surface">
              Fecha de diligenciamiento
            </label>
            <Input
              id="acta-fechaDiligenciamiento"
              type="text"
              value={header.fechaDiligenciamiento}
              readOnly
              placeholder="Complete Información General"
            />
          </div>
          <div>
            <label htmlFor="acta-lugarDiligenciamiento" className="typ-label mb-1 block text-sm text-on-surface">
              Lugar de diligenciamiento
            </label>
            <Input
              id="acta-lugarDiligenciamiento"
              type="text"
              value={header.lugarDiligenciamiento}
              readOnly
              placeholder="Complete Información General"
            />
          </div>
          <div>
            <label htmlFor="acta-nombrePersonaDiligencia" className="typ-label mb-1 block text-sm text-on-surface">
              Nombre de quien diligencia
            </label>
            <Input
              id="acta-nombrePersonaDiligencia"
              type="text"
              value={header.nombrePersonaDiligencia}
              readOnly
              placeholder="Complete Información General"
            />
          </div>
          <div>
            <label htmlFor="acta-rolPersonaDiligencia" className="typ-label mb-1 block text-sm text-on-surface">
              Rol de quien diligencia
            </label>
            <Input
              id="acta-rolPersonaDiligencia"
              type="text"
              value={header.rolPersonaDiligencia}
              readOnly
              placeholder="Complete Información General"
            />
          </div>
          <div>
            <label htmlFor="acta-institucionEducativa" className="typ-label mb-1 block text-sm text-on-surface">
              Institución educativa
            </label>
            <Input
              id="acta-institucionEducativa"
              type="text"
              value={header.institucionEducativa}
              readOnly
              placeholder="Complete Información General"
            />
          </div>
          <div>
            <label htmlFor="acta-sede" className="typ-label mb-1 block text-sm text-on-surface">
              Sede y jornada
            </label>
            <Input
              id="acta-sede"
              type="text"
              value={formatSedeJornada(header.sede, header.jornada)}
              readOnly
              placeholder="Complete Información General"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="typ-label text-sm font-semibold text-on-surface">Resumen sincronizado del estudiante</h3>
          <p className="text-xs text-on-surface-variant">Se toma de Datos del Estudiante.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="acta-nombreEstudiante" className="typ-label mb-1 block text-sm text-on-surface">
              Nombre del estudiante
            </label>
            <Input
              id="acta-nombreEstudiante"
              type="text"
              value={studentFullName}
              readOnly
              placeholder="Complete Datos del Estudiante"
            />
          </div>
          <div>
            <label htmlFor="acta-edadEstudiante" className="typ-label mb-1 block text-sm text-on-surface">
              Edad
            </label>
            <Input
              id="acta-edadEstudiante"
              type="text"
              value={student.edad}
              readOnly
              placeholder="Complete Datos del Estudiante"
            />
          </div>
          <div>
            <label htmlFor="acta-gradoEstudiante" className="typ-label mb-1 block text-sm text-on-surface">
              Grado
            </label>
            <Input
              id="acta-gradoEstudiante"
              type="text"
              value={student.grado}
              readOnly
              placeholder="Complete Datos del Estudiante"
            />
          </div>
        </div>
      </div>
    </>
  );
}
