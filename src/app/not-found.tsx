/** 404 page. Static content with a link back to the landing page. */
export default function NotFound() {
  return (
    <main className="min-h-screen bg-surface px-4 py-8 md:px-8 md:py-16">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center">
        <section className="w-full rounded-xl bg-surface-container-low px-6 py-10 text-center shadow-soft md:px-10">
          <span className="inline-flex rounded-full bg-action-subtle px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-action">
            Ruta no encontrada
          </span>
          <h1 className="typ-title mt-4 text-3xl text-on-surface md:text-4xl">
            Esta pagina no esta disponible
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-on-surface-variant md:text-base">
            La direccion que intento abrir no existe en esta exportacion estatica de PIAR Digital.
          </p>
          <a
            href="/"
            className="typ-label mt-6 inline-flex items-center justify-center rounded-full bg-action px-6 py-3 text-base text-on-primary shadow-soft transition-colors motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:scale-[1.02] motion-safe:active:scale-95"
          >
            Volver al inicio
          </a>
        </section>
      </div>
    </main>
  );
}
