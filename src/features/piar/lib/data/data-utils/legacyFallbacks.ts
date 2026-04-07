export function splitLegacyStudentName(fullName: string): { nombres: string; apellidos: string } {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { nombres: '', apellidos: '' };
  }

  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace === -1) {
    return { nombres: trimmed, apellidos: '' };
  }

  return {
    nombres: trimmed.slice(0, lastSpace),
    apellidos: trimmed.slice(lastSpace + 1),
  };
}

export function preferNonEmptyString(primary: unknown, fallback: unknown): string {
  if (typeof primary === 'string' && primary.trim() !== '') {
    return primary;
  }

  if (typeof fallback === 'string') {
    return fallback;
  }

  return '';
}
