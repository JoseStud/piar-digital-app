/** Input field with blur-triggered validation hint and accessibility wiring. */
'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { FieldHint } from '@piar-digital-app/shared/ui/FieldHint';
import { Input, type InputProps } from '@piar-digital-app/shared/ui/Input';

type Validator = (value: string) => string | null;

export interface ValidatedInputFieldProps extends Omit<InputProps, 'id' | 'value' | 'onChange' | 'onBlur' | 'aria-invalid' | 'aria-describedby'> {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  validate: Validator;
}

export function ValidatedInputField({
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
        {...inputProps}
        aria-invalid={Boolean(hint)}
        aria-describedby={hint ? hintId : undefined}
      />
      <div id={hintId}>
        <FieldHint message={hint} />
      </div>
    </div>
  );
}
