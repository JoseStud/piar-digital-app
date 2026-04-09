# Architecture

PIAR Digital is a static, client-side Next.js app. The browser owns the form state, exports, offline cache, and draft recovery; there is no application server, no SSR path, and no API routes. Production builds are served as static files by Nginx, with an optional Tauri shell wrapping the same export for desktop use.

## Build And Runtime

- Next.js 14 is configured for `output: 'export'`.
- `npm run build` runs `next build` and then generates `out/headers.conf` from the CSP template.
- The static export lands in `out/` and is what Nginx serves.
- The desktop build reuses the same web bundle through the Tauri pipeline.
- Runtime data flow stays in the browser: imports parse local files, autosave writes browser storage, and exports create PDF/DOCX bytes client-side.
- `PiarHomePage` is the thin client-side route wrapper; `usePiarWorkflow` owns the workflow state machine and `FormWorkspace` is lazy-loaded only after the user enters form mode so the landing bundle stays small.
- `public/sw.js` registers as a same-origin service worker after first load and caches the app shell plus discovered `/_next/static/` assets for offline reuse.

## Layer Map

- `src/app/` - route entry points and route-level metadata. Both `/` and `/diligenciar` render `PiarHomePage` (imported and rendered in `src/app/page.tsx`); `/diligenciar/page.tsx` re-exports the root page as its default export.
- `src/features/piar/screens/` - page-level mode roots: `PiarHomePage`, `usePiarWorkflow`, `AppStartScreen`, and the lazy-loaded `FormWorkspace`.
- `src/features/piar/components/` - PIAR form sections (`sections/`), shared form chrome (`form/`), PDF upload/download UI (`pdf/`), and feedback surfaces (`feedback/`).
- `src/features/piar/lib/` - `persistence/` and `portable/` for draft storage and import/export envelopes, `pdf/` and `docx/` for generators/importers, `forms/` for shared input helpers, and `assets/` for bundled-file download glue.
- `src/features/piar/model/` - the canonical data model and section ordering.
- `src/features/piar/content/` - Spanish copy, site branding, guidance text, and the assessment catalogs that drive the form options.
- `src/shared/` - shared UI primitives (`ui/`) and cross-cutting utilities (`lib/` — `cx`, `desktop-runtime`, `save-file`, `storage-safe`). `ConfirmDialog` and `useModalDialog` are the shared modal primitives used by the clear-form and export flows.
- `src/embedded/` - `PiarDigitalApp`, the embeddable React entry point so host pages can mount the workflow outside Next.js.
- `src/types/` - global ambient declarations for asset modules and the Tauri runtime bridge.

Within `src/features/piar/lib/docx/docx-field-manifest/`, the public manifest exports stay stable but the internals are split by concern: `definitions.ts` assembles the manifest from the canonical schema, `section-metadata.ts` owns the reconciled export section titles/order, and `presentation-metadata.ts` owns DOCX labels and rich-text control metadata. That keeps Word template concerns out of `src/features/piar/model/piar-schema.ts` while preserving one shared manifest for generation and import fallback.

## Mode State Machine

```
PiarHomePage
  └─ usePiarWorkflow -> Mode state machine: start -> restore-prompt -> form
      ├─ AppStartScreen -> UploadZone -> importPIARPdf / importPIARDocx -> parsePIARData
      │                                  -> { data, warnings }
      └─ FormWorkspace (lazy-loaded)
           ├─ PIARForm -> usePIARFormController -> section slices + touchedSections
           │   ├─ computeSectionCompleteness -> ProgressNav touched + filled/total summary
           │   ├─ SectionErrorBoundary per section render
           │   └─ usePIARAutosave -> ProgressStore (encrypted + unload recovery) -> localStorage
           ├─ DownloadButton -> save-before-export -> export preflights -> generatePIARPdf / generatePIARDocx
           │                                  -> embeds full form JSON in hidden `piar_app_state`
           │                                     (PDF) or custom XML (DOCX)
           └─ ConfirmDialog -> useModalDialog -> portal, focus trap, inert background, focus restore
```

`parsePIARData` is the sole import normalizer: it validates the
`{ v, data }` envelope and walks the payload against the canonical
schema in `src/features/piar/model/piar-schema.ts`, returning a
fully-populated `PIARFormDataV2` plus a list of repair warnings. All
data that reaches React state or the PDF/DOCX generators has already
been through `parsePIARData` (or was built directly by
`createEmptyPIARFormDataV2`), so downstream code can trust the full V2
shape without re-merging.

`PIARForm` owns the canonical form snapshot for the editing workspace
through `usePIARFormController`. The controller now does shallow
section updates only; it does not re-run any deep merge on mount. Each
section render is wrapped in `SectionErrorBoundary` so one broken
section does not take down the whole editor, and `ProgressNav` combines
touched-section state with deterministic `filled/total` counts from
`section-completeness.ts`. The section order now mirrors the reconciled
export layout, including separate `firmantes-piar`, `ajustes`,
`firmas-docentes`, `firmas-especiales`, and `acta` subsections. When
`usePiarWorkflow` imports, restores, clears, or starts a new draft it
swaps the current snapshot and bumps `formKey` so the workspace
remounts with fresh local state.

`usePIARAutosave` still debounces encrypted saves, but failed writes now
retry automatically with exponential backoff (`500ms`, `1000ms`,
`2000ms`) before the UI settles into a manual retry state. The same hook
still writes the synchronous plaintext unload-recovery slot during
`pagehide` and `visibilitychange -> hidden`.

`DownloadButton` performs the save-before-export step for both formats.
It persists the current draft to encrypted storage before generating the
file, but it still lets the export continue if storage save fails
because the in-memory form snapshot is authoritative for the download.
The PDF warning and the blank-context warning are handled by the same
dialog state machine, with `ConfirmDialog` and `useModalDialog`
providing the accessible modal shell.

The DOCX export path normalizes the trusted template into the reconciled
visible layout before content controls are injected. That lets the app
preserve one canonical section order and field breakdown across the
editor, PDF export, and DOCX export even when the upstream template
arrives without explicit visible slots for every persisted field. The
normalizer only patches the known legacy competency-table shape (100
rows before the observations block is appended later); newer reconciled
templates pass through unchanged. There is no hidden-metadata recovery
layer anymore: DOCX round-trip fidelity depends on the visible content
controls and the embedded custom XML payload.

## Path Aliases

- `@piar-digital-app/*` is the canonical scoped alias used throughout the app source. It also maps to `src/*` and is kept stable so a host project that mounts `src/embedded/PiarDigitalApp.tsx` can resolve internal imports under that namespace.
- `@/*` is the Next.js convention shortcut and also maps to `src/*`. New code should prefer the scoped alias to keep the embeddable entry point self-consistent.

## Tailwind Theme Tokens

- Theme values are defined in `tailwind.config.ts` with CSS variables.
- The palette uses semantic `surface`, `primary`, `secondary`, and `error` tokens.
- Spacing, shadows, and border radii are customized to match the PIAR UI.

## Build Pipeline

- `npm run build` -> `next build` -> static export -> `npm run csp:headers` -> `out/`.
- CI runs `node scripts/check-bundle-size.mjs` after the build and fails if the total gzipped JavaScript in `out/_next/static/chunks/` exceeds the configured budget.
- Docker passes `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_CONTACT_EMAIL` at build time.
- Standalone deployments can also pass `NEXT_PUBLIC_PIAR_DOCX_TEMPLATE_URL` and `NEXT_PUBLIC_PIAR_DOCX_TEMPLATE_SOURCE_NAME` when they want to enable DOCX export without committing the template asset to this repository.
- `npm run desktop:build` produces the Tauri desktop package from the same source tree.

## Read Next

- [data-model.md](data-model.md) for the versioning contract and root form shape.
- [persistence-and-encryption.md](persistence-and-encryption.md) for draft storage and encryption details.
- [pdf-docx-roundtrip.md](pdf-docx-roundtrip.md) for the embedded payload and importer/exporter flow.
- [contributing.md](contributing.md) for setup and day-to-day contributor workflow.
