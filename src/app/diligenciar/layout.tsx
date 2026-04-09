/**
 * Layout for the workflow route (`/diligenciar`).
 *
 * Marked as non-indexable (`robots: 'noindex,nofollow'`) because every
 * pageview is a private editing session. The page itself may pass a
 * configured DOCX template source when the host deployment exposes one.
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diligenciar PIAR',
};

/** Returns the workflow route subtree without additional wrappers. */
export default function DiligenciarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
