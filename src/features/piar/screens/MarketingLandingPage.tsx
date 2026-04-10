/**
 * Marketing landing page for the `/` route.
 *
 * Pure server component — no client-side interactivity. Provides
 * rich, keyword-indexed HTML content for Google about the PIAR tool.
 * The actual form workflow lives at `/diligenciar`.
 */
import Link from 'next/link';

const features = [
  {
    title: 'Privacidad total',
    description:
      'Todos los datos del PIAR se quedan en su navegador. Ningún dato del estudiante se envía a servidores externos.',
  },
  {
    title: 'Exportar PDF y DOCX',
    description:
      'Descargue el PIAR como PDF o como documento Word (.docx) compatible con la plantilla oficial del Ministerio de Educación.',
  },
  {
    title: 'Guardado automático',
    description:
      'El progreso se guarda automáticamente en el dispositivo. Si cierra la pestaña, puede continuar desde donde lo dejó.',
  },
  {
    title: 'Importar archivo existente',
    description:
      'Restaure un PIAR desde un PDF o DOCX generado previamente. Ideal para retomar el trabajo o corregir un formulario anterior.',
  },
];

const steps = [
  {
    num: '1',
    title: 'Abrir el formulario',
    description: 'Haga clic en "Diligenciar PIAR" para abrir el formulario en su navegador. No necesita cuenta ni instalación.',
  },
  {
    num: '2',
    title: 'Diligenciar las secciones',
    description:
      'Complete cada sección del Anexo 2: datos del estudiante, entornos, valoración pedagógica, ajustes razonables y acta de acuerdo.',
  },
  {
    num: '3',
    title: 'Exportar PDF o DOCX',
    description:
      'Cuando termine, descargue el documento en formato PDF (para entregar) o DOCX (para editar con Word o Google Docs).',
  },
];

const faqs = [
  {
    q: '¿Qué es el PIAR?',
    a: 'El Plan Individual de Ajustes Razonables (PIAR) es el instrumento oficial de Colombia para garantizar el acceso equitativo de estudiantes con discapacidad al sistema educativo. Es obligatorio según el Decreto 1421 de 2017 y debe ser elaborado por el docente de aula junto con el equipo de apoyo pedagógico.',
  },
  {
    q: '¿Quién debe diligenciar el PIAR?',
    a: 'El PIAR debe ser diligenciado por el docente titular del aula en coordinación con el docente de apoyo pedagógico, los padres o cuidadores del estudiante, y demás actores del proceso educativo. Corresponde a cada institución educativa elaborarlo para cada estudiante con discapacidad matriculado.',
  },
  {
    q: '¿Qué es el Decreto 1421 de 2017?',
    a: 'El Decreto 1421 de 2017 del Ministerio de Educación Nacional de Colombia reglamenta la educación inclusiva para personas con discapacidad. Establece que todas las instituciones educativas deben garantizar el acceso, la permanencia y la calidad educativa de los estudiantes con discapacidad, y define el PIAR (Anexo 2) como su herramienta de planeación.',
  },
  {
    q: '¿Los datos del formulario se suben a internet?',
    a: 'No. Esta herramienta procesa todo localmente en su navegador. Los datos del estudiante nunca salen de su dispositivo. El borrador se guarda en el almacenamiento local del navegador, cifrado en el dispositivo. Al exportar, el documento se genera directamente en su equipo.',
  },
  {
    q: '¿En qué formatos puedo exportar el PIAR?',
    a: 'Puede exportar el PIAR como PDF (recomendado para entregar a directivos o padres) o como documento DOCX compatible con Microsoft Word y Google Docs. Ambos formatos permiten importar el documento de vuelta a la aplicación para continuar editándolo.',
  },
];

/** Marketing landing page — pure server component. */
export function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 border-b border-border-warm bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-8">
          <span className="text-lg font-headline font-bold text-on-surface">PIAR Digital</span>
          <Link
            href="/diligenciar"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Diligenciar PIAR
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24"
        >
          <p className="typ-label mb-4 text-xs uppercase tracking-[0.14em] text-primary">
            Herramienta gratuita para docentes
          </p>
          <h1
            id="hero-heading"
            className="mb-6 text-4xl font-headline font-extrabold leading-tight tracking-tight text-on-surface md:text-5xl lg:text-6xl"
          >
            Formulario PIAR digital para docentes — Decreto 1421, Anexo 2
          </h1>
          <p className="mb-10 max-w-3xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
            Diligencia el Plan Individual de Ajustes Razonables directamente en tu navegador. Sin
            registros, sin servidores, sin costo. Los datos del estudiante nunca salen de tu
            dispositivo.
          </p>
          <Link
            href="/diligenciar"
            className="inline-block rounded-full bg-primary px-8 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90"
          >
            Diligenciar PIAR ahora
          </Link>
        </section>

        {/* What is PIAR */}
        <section
          aria-labelledby="que-es-heading"
          className="border-t border-border-warm bg-surface-container-low"
        >
          <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
            <p className="typ-label mb-4 text-xs uppercase tracking-[0.14em] text-primary">
              Marco legal
            </p>
            <h2
              id="que-es-heading"
              className="mb-8 text-3xl font-headline font-bold text-on-surface"
            >
              ¿Qué es el PIAR y por qué es obligatorio?
            </h2>
            <div className="space-y-5 max-w-3xl text-base leading-relaxed text-on-surface-variant">
              <p>
                El <strong className="text-on-surface">Plan Individual de Ajustes Razonables (PIAR)</strong> es
                el instrumento central de la educación inclusiva en Colombia, definido en el{' '}
                <strong className="text-on-surface">Decreto 1421 de 2017</strong> del Ministerio de
                Educación Nacional. Es obligatorio para todas las instituciones educativas que atiendan
                estudiantes con discapacidad, independientemente del tipo o grado de discapacidad.
              </p>
              <p>
                El PIAR recoge información sobre el entorno del estudiante (salud, hogar, entorno
                educativo), la valoración pedagógica de sus habilidades, las competencias y
                dispositivos de apoyo requeridos, y los <strong className="text-on-surface">ajustes
                razonables</strong> que la institución se compromete a implementar para garantizar su
                acceso, permanencia y aprendizaje con calidad.
              </p>
              <p>
                El documento oficial se conoce como <strong className="text-on-surface">Anexo 2</strong> del
                Decreto 1421. Debe ser elaborado por el docente de aula junto con el docente de apoyo
                pedagógico, la familia del estudiante y, según el caso, profesionales de la salud o
                trabajo social. Esta herramienta sigue fielmente la estructura del Anexo 2 oficial.
              </p>
              <p>
                Los estudiantes con <strong className="text-on-surface">Necesidades Educativas
                Especiales (NEE)</strong> derivadas de discapacidad física, cognitiva, sensorial,
                psicosocial o múltiple tienen derecho a contar con un PIAR actualizado cada año
                escolar. Su correcta elaboración es un requisito para la certificación de inclusión
                ante las secretarías de educación.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          aria-labelledby="caracteristicas-heading"
          className="border-t border-border-warm"
        >
          <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
            <p className="typ-label mb-4 text-xs uppercase tracking-[0.14em] text-primary">
              Características
            </p>
            <h2
              id="caracteristicas-heading"
              className="mb-10 text-3xl font-headline font-bold text-on-surface"
            >
              Diseñado para el trabajo real del docente
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-border-warm bg-surface-container-low p-6"
                >
                  <h3 className="mb-2 text-lg font-semibold text-on-surface">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          aria-labelledby="como-se-usa-heading"
          className="border-t border-border-warm bg-surface-container-low"
        >
          <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
            <p className="typ-label mb-4 text-xs uppercase tracking-[0.14em] text-primary">
              Paso a paso
            </p>
            <h2
              id="como-se-usa-heading"
              className="mb-10 text-3xl font-headline font-bold text-on-surface"
            >
              ¿Cómo se usa?
            </h2>
            <ol className="space-y-8">
              {steps.map((s) => (
                <li key={s.num} className="flex gap-6">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white"
                  >
                    {s.num}
                  </span>
                  <div>
                    <h3 className="mb-1 text-lg font-semibold text-on-surface">{s.title}</h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant">{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="border-t border-border-warm">
          <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
            <p className="typ-label mb-4 text-xs uppercase tracking-[0.14em] text-primary">
              Preguntas frecuentes
            </p>
            <h2
              id="faq-heading"
              className="mb-10 text-3xl font-headline font-bold text-on-surface"
            >
              Preguntas frecuentes
            </h2>
            <dl className="space-y-8 max-w-3xl">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <dt className="mb-2 text-base font-semibold text-on-surface">{faq.q}</dt>
                  <dd className="text-sm leading-relaxed text-on-surface-variant">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* CTA */}
        <section
          aria-labelledby="cta-heading"
          className="border-t border-border-warm bg-surface-container-low"
        >
          <div className="mx-auto max-w-5xl px-4 py-16 text-center md:px-8 md:py-24">
            <h2
              id="cta-heading"
              className="mb-4 text-3xl font-headline font-bold text-on-surface md:text-4xl"
            >
              Empiece a diligenciar el PIAR hoy
            </h2>
            <p className="mb-10 text-base leading-relaxed text-on-surface-variant">
              Sin registro. Sin instalación. Sus datos permanecen en su dispositivo.
            </p>
            <Link
              href="/diligenciar"
              className="inline-block rounded-full bg-primary px-10 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90"
            >
              Diligenciar PIAR
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-warm">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
          <p className="text-xs leading-relaxed text-on-surface-variant">
            PIAR Digital es una herramienta de código abierto, gratuita y sin publicidad. No está
            afiliada al Ministerio de Educación Nacional de Colombia. El contenido del formulario se
            procesa exclusivamente en su navegador y nunca se transmite a servidores externos.
          </p>
        </div>
      </footer>
    </div>
  );
}
