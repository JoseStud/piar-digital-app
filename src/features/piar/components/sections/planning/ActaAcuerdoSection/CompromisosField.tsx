/** Free-text compromisos field (the agreement summary). */
import { Textarea } from '@piar-digital-app/shared/ui/Textarea';

interface CompromisosFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function CompromisosField({ value, onChange }: CompromisosFieldProps) {
  return (
    <div className="mt-6 space-y-2">
      <h3 className="typ-label text-sm font-semibold text-on-surface">Compromisos y acuerdos</h3>
      <Textarea
        id="acta-compromisos"
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describa los compromisos y acuerdos establecidos entre la institución, la familia y el estudiante"
        aria-label="Compromisos y acuerdos"
      />
    </div>
  );
}
