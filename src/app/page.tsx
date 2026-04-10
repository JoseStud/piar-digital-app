/**
 * Marketing landing page (`/`). Indexable. Pure server component with
 * keyword-rich content about PIAR and Decreto 1421. Links to
 * `/diligenciar` for users who want to start filling out the form.
 *
 * @see ./diligenciar/page.tsx — the workflow route
 */
import { MarketingLandingPage } from '@piar-digital-app/features/piar/screens/MarketingLandingPage';

/** Landing route — marketing content, no workflow state. */
export default function Home() {
  return <MarketingLandingPage />;
}
