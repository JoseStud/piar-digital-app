# Architecture

PIAR Digital is a static, client-side Next.js app. The browser owns the form state, exports, and draft recovery; there is no application server, no SSR path, and no API routes. Production builds are served as static files by Nginx, with an optional Tauri shell wrapping the same export for desktop use.

## Build And Runtime

- Next.js 14 is configured for `output: 'export'`.
- `npm run build` runs `next build` and then generates `out/headers.conf` from the CSP template.
- The static export lands in `out/` and is what Nginx serves.
- The desktop build reuses the same web bundle through the Tauri pipeline.
- Runtime data flow stays in the browser: imports parse local files, autosave writes browser storage, and exports create PDF/DOCX bytes client-side.

## Layer Map

- `src/app/` - route entry points and route-level metadata.
- `src/features/piar/screens/` - page-level mode roots such as the start screen and form workspace.
- `src/features/piar/components/` - the PIAR form sections, shared form chrome, PDF upload/download UI, and feedback components.
- `src/features/piar/lib/` - persistence, PDF/DOCX import and export, portable round-trip helpers, data merging, and form helpers.
- `src/features/piar/model/` - the canonical data model and section ordering.
- `src/features/piar/content/` - Spanish copy and the assessment catalogs that drive the form options.
- `src/shared/` - shared UI primitives and cross-cutting utilities used outside the PIAR feature tree.

## Mode State Machine

```
PiarHomePage
  └─ Mode state machine: start -> restore-prompt -> form
      ├─ AppStartScreen -> UploadZone -> importPIARPdf / importPIARDocx
      │                                -> parsePIARData -> deepMergeWithDefaultsV2
      └─ FormWorkspace -> PIARForm (owns PIARFormDataV2 state via usePIARFormController)
           ├─ Section components
           ├─ Auto-save -> usePIARAutosave -> ProgressStore -> localStorage
           └─ DownloadButton -> generatePIARPdf / generatePIARDocx
                                  -> embeds full form JSON in hidden `piar_app_state`
```

## Path Aliases

- `@/*` maps to `src/*`.
- `@piar-digital-app/*` also maps to `src/*` for the embeddable alias.

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
