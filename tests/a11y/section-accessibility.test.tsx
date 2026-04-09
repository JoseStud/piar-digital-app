/** Axe coverage for the main PIAR sections, progress nav, and save banner. */
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { renderAndCheck } from './axe-setup';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { HeaderSection } from '@piar-digital-app/features/piar/components/sections/identity/HeaderSection';
import { StudentSection } from '@piar-digital-app/features/piar/components/sections/identity/StudentSection';
import { EntornoSaludSection } from '@piar-digital-app/features/piar/components/sections/environments/EntornoSaludSection';
import { EntornoHogarSection } from '@piar-digital-app/features/piar/components/sections/environments/EntornoHogarSection';
import { EntornoEducativoSection } from '@piar-digital-app/features/piar/components/sections/environments/EntornoEducativoSection';
import { ValoracionPedagogicaSection } from '@piar-digital-app/features/piar/components/sections/assessment/ValoracionPedagogicaSection';
import { CompetenciasDispositivosSection } from '@piar-digital-app/features/piar/components/sections/assessment/CompetenciasDispositivosSection';
import { DescripcionHabilidadesSection, EstrategiasAccionesSection } from '@piar-digital-app/features/piar/components/sections/assessment/NarrativeSections';
import { AjustesRazonablesSection } from '@piar-digital-app/features/piar/components/sections/planning/AjustesRazonablesSection';
import { SignaturesSection } from '@piar-digital-app/features/piar/components/sections/planning/SignaturesSection';
import { ActaAcuerdoSection } from '@piar-digital-app/features/piar/components/sections/planning/ActaAcuerdoSection';
import { ProgressNav } from '@piar-digital-app/features/piar/components/form/ProgressNav';
import { SaveStatusBanner } from '@piar-digital-app/features/piar/components/form/PIARForm/SaveStatusBanner';

const data = createEmptyPIARFormDataV2();

afterEach(() => {
  cleanup();
});

describe('PIAR accessibility', () => {
  it('keeps the header section accessible', async () => {
    await renderAndCheck(
      <HeaderSection data={data.header} onChange={vi.fn()} />,
    );
  });

  it('keeps the student section accessible', async () => {
    await renderAndCheck(
      <StudentSection data={data.student} onChange={vi.fn()} />,
    );
  });

  it('keeps the environment sections accessible', async () => {
    await renderAndCheck(<EntornoSaludSection data={data.entornoSalud} onChange={vi.fn()} />);
    await renderAndCheck(<EntornoHogarSection data={data.entornoHogar} onChange={vi.fn()} />);
    await renderAndCheck(<EntornoEducativoSection data={data.entornoEducativo} onChange={vi.fn()} />);
  });

  it('keeps the assessment sections accessible', async () => {
    await renderAndCheck(<ValoracionPedagogicaSection data={data.valoracionPedagogica} onChange={vi.fn()} />);
    await renderAndCheck(<CompetenciasDispositivosSection data={data.competenciasDispositivos} onChange={vi.fn()} />);
    await renderAndCheck(<DescripcionHabilidadesSection value={data.descripcionHabilidades} onChange={vi.fn()} />);
    await renderAndCheck(
      <EstrategiasAccionesSection
        value={data.estrategiasAcciones}
        fechaRevision={data.fechaProximaRevision}
        onValueChange={vi.fn()}
        onFechaRevisionChange={vi.fn()}
      />,
    );
  });

  it('keeps the planning sections accessible', async () => {
    await renderAndCheck(<AjustesRazonablesSection data={data.ajustes} onChange={vi.fn()} />);
    await renderAndCheck(<SignaturesSection data={data.firmas} onChange={vi.fn()} />);
    await renderAndCheck(<ActaAcuerdoSection data={data.acta} header={data.header} student={data.student} onChange={vi.fn()} />);
  });

  it('keeps the progress navigation accessible', async () => {
    await renderAndCheck(
      <ProgressNav activeSection="" touchedSections={new Set()} />,
    );
  });

  it('keeps the save banner accessible in each state', async () => {
    await renderAndCheck(
      <SaveStatusBanner saveState="idle" saveMessage={null} onRetry={vi.fn()} />,
    );
    await renderAndCheck(
      <SaveStatusBanner saveState="saving" saveMessage={null} onRetry={vi.fn()} />,
    );
    await renderAndCheck(
      <SaveStatusBanner saveState="saved" saveMessage={null} onRetry={vi.fn()} />,
    );
    await renderAndCheck(
      <SaveStatusBanner saveState="failed" saveMessage="No fue posible guardar." onRetry={vi.fn()} />,
    );
  });
});
