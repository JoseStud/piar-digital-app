/** Tests for the pure inline validation helpers used by the header/student identity fields. */
import { describe, expect, it } from 'vitest';
import {
  validateAge,
  validateFecha,
  validateNumericId,
  validateNotEmpty,
} from '@piar-digital-app/features/piar/lib/forms/field-validation';

describe('field-validation', () => {
  it('validates dates in YYYY-MM-DD and DD/MM/AAAA formats', () => {
    expect(validateFecha('2026-04-09')).toBeNull();
    expect(validateFecha('09/04/2026')).toBeNull();
    expect(validateFecha('2026-02-30')).toBe('La fecha debe ser valida.');
    expect(validateFecha('2026/04/09')).toBe('La fecha debe tener el formato AAAA-MM-DD o DD/MM/AAAA.');
  });

  it('validates numeric identification values', () => {
    expect(validateNumericId('123456789')).toBeNull();
    expect(validateNumericId('123.456')).toBe('El número de identificación solo debe contener dígitos, sin puntos ni espacios.');
    expect(validateNumericId('')).toBe('El número de identificación no puede estar vacío.');
  });

  it('validates required labels as non-empty', () => {
    expect(validateNotEmpty('Ana', 'Nombres')).toBeNull();
    expect(validateNotEmpty('   ', 'Nombres')).toBe('El campo Nombres no puede estar vacío.');
  });

  it('validates ages within the student range', () => {
    expect(validateAge('10')).toBeNull();
    expect(validateAge('10 años')).toBeNull();
    expect(validateAge('0')).toBe('La edad debe estar entre 1 y 25 años.');
    expect(validateAge('26')).toBe('La edad debe estar entre 1 y 25 años.');
    expect(validateAge('abc')).toBe('La edad debe escribirse como un número entre 1 y 25 años.');
  });
});
