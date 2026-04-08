/** Icon set for the confirm dialog tones (info, danger, success). */
// ─────────────────────────────────────────────
// Section: Warning Icon
// ─────────────────────────────────────────────

export function WarningIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none">
      <path d="M10 6v4.8m0 3h.01M8.2 2.8l-5.6 9.7a1.7 1.7 0 001.47 2.55h11.86a1.7 1.7 0 001.47-2.55L11.8 2.8a1.7 1.7 0 00-2.94 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Section: Info Icon
// ─────────────────────────────────────────────

export function InfoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 8v4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="6" r=".8" fill="currentColor" />
    </svg>
  );
}
