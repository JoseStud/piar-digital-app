/** Tiny conditional-class-name helper used throughout the UI components. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
