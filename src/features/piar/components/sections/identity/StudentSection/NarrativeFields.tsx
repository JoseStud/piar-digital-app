import { Textarea } from '@piar-digital-app/shared/ui/Textarea';
import type { StudentV2 } from '@piar-digital-app/features/piar/model/piar';

interface NarrativeFieldsProps {
  data: StudentV2;
  onChange: (patch: Partial<StudentV2>) => void;
}

export function NarrativeFields({ data, onChange }: NarrativeFieldsProps) {
  return (
    <div className="mt-6 space-y-4">
      <div>
        <label htmlFor="student-capacidades" className="typ-label mb-1 block text-sm text-on-surface">Capacidades</label>
        <Textarea
          id="student-capacidades"
          value={data.capacidades}
          onChange={(e) => onChange({ capacidades: e.target.value })}
          rows={3}
          placeholder="Ej: Muestra habilidad para el dibujo y se expresa bien de forma oral"
        />
      </div>
      <div>
        <label htmlFor="student-gustosIntereses" className="typ-label mb-1 block text-sm text-on-surface">Gustos e intereses</label>
        <Textarea
          id="student-gustosIntereses"
          value={data.gustosIntereses}
          onChange={(e) => onChange({ gustosIntereses: e.target.value })}
          rows={3}
          placeholder="Ej: Le interesan los animales y disfruta las clases de ciencias"
        />
      </div>
      <div>
        <label htmlFor="student-expectativasEstudiante" className="typ-label mb-1 block text-sm text-on-surface">Expectativas del estudiante</label>
        <Textarea
          id="student-expectativasEstudiante"
          value={data.expectativasEstudiante}
          onChange={(e) => onChange({ expectativasEstudiante: e.target.value })}
          rows={3}
          placeholder="Ej: Desea aprender a leer de forma autónoma"
        />
      </div>
      <div>
        <label htmlFor="student-expectativasFamilia" className="typ-label mb-1 block text-sm text-on-surface">Expectativas de la familia</label>
        <Textarea
          id="student-expectativasFamilia"
          value={data.expectativasFamilia}
          onChange={(e) => onChange({ expectativasFamilia: e.target.value })}
          rows={3}
          placeholder="Ej: La familia espera que el estudiante avance en habilidades sociales"
        />
      </div>
      <div>
        <label htmlFor="student-redesApoyo" className="typ-label mb-1 block text-sm text-on-surface">Redes de apoyo</label>
        <Textarea
          id="student-redesApoyo"
          value={data.redesApoyo}
          onChange={(e) => onChange({ redesApoyo: e.target.value })}
          rows={3}
          placeholder="Ej: Terapia ocupacional, grupo de natación los sábados"
        />
      </div>
      <div>
        <label htmlFor="student-otrasObservaciones" className="typ-label mb-1 block text-sm text-on-surface">Otras observaciones</label>
        <Textarea
          id="student-otrasObservaciones"
          value={data.otrasObservaciones}
          onChange={(e) => onChange({ otrasObservaciones: e.target.value })}
          rows={3}
          placeholder="Ej: Observaciones adicionales relevantes para el PIAR"
        />
      </div>
    </div>
  );
}
