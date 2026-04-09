# Architecture

PIAR Digital is a static, client-side Next.js app. The browser owns the form state, exports, and draft recovery; there is no application server, no SSR path, and no API routes. Production builds are served as static files by Nginx, with an optional Tauri shell wrapping the same export for desktop use.

## Build And Runtime

- Next.js 14 is configured for `output: 'export'`.
- `npm run build` runs `next build` and then generates `out/headers.conf` from the CSP template.
- The static export lands in `out/` and is what Nginx serves.
- The desktop build reuses the same web bundle through the Tauri pipeline.
- Runtime data flow stays in the browser: imports parse local files, autosave writes browser storage, and exports create PDF/DOCX bytes client-side.

## Layer Map

- `src/app/` - route entry points and route-level metadata. Both `/` and `/diligenciar` currently render `PiarHomePage`; `/diligenciar/page.tsx` re-exports the root page module.
- `src/features/piar/screens/` - page-level mode roots: `PiarHomePage`, `AppStartScreen`, and the lazy-loaded `FormWorkspace`.
- `src/features/piar/components/` - PIAR form sections (`sections/`), shared form chrome (`form/`), PDF upload/download UI (`pdf/`), and feedback surfaces (`feedback/`).
- `src/features/piar/lib/` - persistence + crypto, PDF/DOCX import/export and field manifest, portable round-trip helpers, data merging, form helpers, and bundled-asset download glue.
- `src/features/piar/model/` - the canonical data model and section ordering.
- `src/features/piar/content/` - Spanish copy, site branding, guidance text, and the assessment catalogs that drive the form options.
- `src/shared/` - shared UI primitives (`ui/`) and cross-cutting utilities (`lib/` — `cx`, `desktop-runtime`, `save-file`, `storage-safe`).
- `src/embedded/` - `PiarDigitalApp`, the embeddable React entry point so host pages can mount the workflow outside Next.js.
- `src/types/` - global ambient declarations for asset modules and the Tauri runtime bridge.

## Mode State Machine

```
PiarHomePage
  └─ Mode state machine: start -> restore-prompt -> form
      ├─ AppStartScreen -> UploadZone -> importPIARPdf / importPIARDocx -> parsePIARData
      │                                  (schema-tree normalize -> { data, warnings })
      └─ FormWorkspace -> PIARForm (owns PIARFormDataV2 state via usePIARFormController)
           ├─ Section components
           ├─ Auto-save -> usePIARAutosave -> ProgressStore (encrypted) -> localStorage
           └─ DownloadButton -> generatePIARPdf / generatePIARDocx
                                  -> embeds full form JSON in hidden `piar_app_state`
                                     (PDF) or custom XML (DOCX)
```

`parsePIARData` is the sole import normalizer: it validates the
`{ v, data }` envelope and walks the payload against the canonical
schema in `src/features/piar/model/piar-schema.ts`, returning a
fully-populated `PIARFormDataV2` plus a list of repair warnings. All
data that reaches React state or the PDF/DOCX generators has already
been through `parsePIARData` (or was built directly by
`createEmptyPIARFormDataV2`), so downstream code can trust the full V2
shape without re-merging.

## Path Aliases

- `@piar-digital-app/*` is the canonical scoped alias used throughout the app source. It also maps to `src/*` and is kept stable so a host project that mounts `src/embedded/PiarDigitalApp.tsx` can resolve internal imports under that namespace.
- `@/*` is the Next.js convention shortcut and also maps to `src/*`. New code should prefer the scoped alias to keep the embeddable entry point self-consistent.

## Tailwind Theme Tokens

- Theme values are defined in `tailwind.config.ts` with CSS variables.
- The palette uses semantic `surface`, `primary`, `secondary`, and `error` tokens.
- Spacing, shadows, and border radii are customized to match the PIAR UI.

## Build Pipeline

- `npm run build` -> `next build` -> static export -> `npm run csp:headers` -> `out/`.
- Docker passes `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_CONTACT_EMAIL` at build time.
- `npm run desktop:build` produces the Tauri desktop package from the same source tree.

## Read Next

- [data-model.md](data-model.md) for the versioning contract and root form shape.
- [persistence-and-encryption.md](persistence-and-encryption.md) for draft storage and encryption details.
- [pdf-docx-roundtrip.md](pdf-docx-roundtrip.md) for the embedded payload and importer/exporter flow.
- [contributing.md](contributing.md) for setup and day-to-day contributor workflow.
