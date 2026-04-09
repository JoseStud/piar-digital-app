# PIAR Digital

> Fill out Colombia's PIAR (Plan Individual de Ajustes Razonables) form in your browser, without sending data anywhere.

**GPL-3.0** **Node 20+** **Client-side only**

PIAR Digital is a privacy-first, client-side-only web app for Colombian educators to fill out the PIAR (Decreto 1421, Anexo 2). All form data stays in the browser: no accounts, no database, no server-side form processing. Drafts are autosaved into encrypted local storage; PDF and DOCX exports are generated client-side and embed the source data so re-importing restores the exact form state.

<!-- TODO: add screenshots
![Pantalla de inicio](docs/images/landing.png)
![Editor del formulario](docs/images/editor.png)
![Generación de exportes](docs/images/export.png)
-->

## What this is

- A static web app for filling out the official PIAR form
- A round-trip-capable PDF and DOCX exporter
- An encrypted local autosave so progress survives page reloads
- Optionally a Tauri desktop application

## What this is not

- A backend service or SaaS
- An official Ministerio de Educación product
- A multi-user database
- A certification of your institution's PIAR process

## Tech Stack

- Next.js 14 with `output: 'export'` for static export
- React 18 + TypeScript 5
- Tailwind CSS 3
- pdf-lib for PDF generation
- jszip for DOCX generation
- Vitest 2 + jsdom + React Testing Library
- Optional Tauri 2 desktop shell
- Node 20-24

## Quickstart

```bash
git clone https://github.com/JoseStud/piar-digital-app.git
cd piar-digital-app
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

The build exports static files to `out/` and generates `out/headers.conf` from the CSP header template.

## Test

```bash
npm run lint
npm run typecheck
npm test
```

## Desktop package

```bash
npm run desktop:dev
npm run desktop:build
```

The Tauri shell embeds the exported static app and exposes a native save dialog for PIAR exports and bundled template downloads.

## Documentation

| If you want to... | Look at |
|---|---|
| Use the app | The [project wiki](https://github.com/JoseStud/piar-digital-app/wiki) |
| Understand the architecture | [`docs/architecture.md`](docs/architecture.md) |
| Contribute code | [`docs/contributing.md`](docs/contributing.md) and [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) |
| Deploy this | [`docs/release.md`](docs/release.md) |
| Report a vulnerability | [`.github/SECURITY.md`](.github/SECURITY.md) |
| Use AI assistants in this repo | [`docs/README.md`](docs/README.md) and any workspace-root `CLAUDE.md` used by your local tooling |

## Privacy & security

- No backend. PIAR data never leaves the browser.
- Encrypted drafts. Autosaved progress is encrypted with AES-256-GCM using a non-extractable device key generated in your browser.
- Client-side exports. PDF and DOCX generation happens entirely in your browser and embeds the source form data for re-import.

For the full threat model, see [`docs/persistence-and-encryption.md`](docs/persistence-and-encryption.md) and [`docs/security.md`](docs/security.md).

## Project status

Active development. The data model is at version 2 (`PIAR_DATA_VERSION = 2`); breaking changes bump the version. Encryption is enabled for new drafts. There are no tagged releases yet - track `main`.

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
