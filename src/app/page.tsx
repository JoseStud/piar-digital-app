/**
 * Marketing landing page (`/`). Indexable. Pure presentation — no
 * workflow state, no autosave. Links to `/diligenciar` for users who
 * want to start filling out the form.
 *
 * @see ./diligenciar/page.tsx — the workflow route
 */
import { PiarHomePage } from '@piar-digital-app/features/piar/screens/PiarHomePage';

/** Landing route that delegates to the home screen. */
export default function Home() {
  return <PiarHomePage />;
}
