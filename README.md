# PIAR Digital

> Fill out Colombia's PIAR (Plan Individual de Ajustes Razonables) form in your browser, without sending data anywhere.

**GPL-3.0** **Node 20+** **Client-side only**

PIAR Digital is a privacy-first, client-side-only web app for Colombian educators to fill out the PIAR (Decreto 1421, Anexo 2). All form data stays in the browser: no accounts, no database, no server-side form processing. Drafts are autosaved into encrypted local storage with automatic retry and unload recovery; PDF and DOCX exports are generated client-side and embed the source data so re-importing restores the exact form state. After first load, a same-origin service worker keeps the app shell and static assets available offline.

<!-- TODO: add screenshots
![Pantalla de inicio](docs/images/landing.png)
![Editor del formulario](docs/images/editor.png)
![Generación de exportes](docs/images/export.png)
-->

## What this is

- A static web app for filling out the official PIAR form
- A round-trip-capable PDF and DOCX exporter
- An encrypted local autosave so progress survives page reloads
- An offline-capable app shell after the first successful load
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
- Vitest 2 + jsdom + React Testing Library + axe-based accessibility coverage
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

The build exports static files to `out/`, generates `out/headers.conf` from the CSP header template, and CI enforces a gzipped JavaScript bundle budget with `scripts/check-bundle-size.mjs`.

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
npm run desktop:build:store
```

The Tauri shell embeds the exported static app and exposes a native save dialog for PIAR exports. `npm run desktop:build:store` builds the Windows MSIX variant used by `main` branch releases for Microsoft Store packaging. If you want DOCX export in a standalone deployment, provide a same-origin template URL through `NEXT_PUBLIC_PIAR_DOCX_TEMPLATE_URL`.

## Documentation

| If you want to... | Look at |
|---|---|
| Use the app | The [project wiki](https://github.com/JoseStud/piar-digital-app/wiki) |
| Understand the architecture | [`docs/architecture.md`](docs/architecture.md) |
| Contribute code | [`docs/contributing.md`](docs/contributing.md) and [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) |
| Deploy this | [`docs/release.md`](docs/release.md) |
| Review the release policy | [`docs/code-signing-policy.md`](docs/code-signing-policy.md) |
| Check repository provenance rules | [`PROVENANCE.md`](PROVENANCE.md) |
| Report a vulnerability | [`.github/SECURITY.md`](.github/SECURITY.md) |
| Use AI assistants in this repo | [`docs/README.md`](docs/README.md) and any workspace-root `CLAUDE.md` used by your local tooling |

## Release policy

Release policy: see [`docs/code-signing-policy.md`](docs/code-signing-policy.md) and [`docs/release.md`](docs/release.md).

Current repository roles:

- Committer: [`@JoseStud`](https://github.com/JoseStud) (default code owner in [`.github/CODEOWNERS`](.github/CODEOWNERS))
- Reviewer for non-committer contributions: [`@JoseStud`](https://github.com/JoseStud)
- Release publisher: [`@JoseStud`](https://github.com/JoseStud)

Windows desktop releases from `main` attach Microsoft Store-oriented MSIX assets built from this repository. The SignPath-specific repository-control variant is preserved on the `signpath-compliance` branch.

Privacy policy: see [`docs/security.md`](docs/security.md). PIAR form contents stay local to the browser or desktop runtime; the app does not send PIAR form data to third-party services.

## Privacy & security

- No backend. PIAR data never leaves the browser.
- Encrypted drafts. Autosaved progress is encrypted with AES-256-GCM using a non-extractable device key generated in your browser.
- Client-side exports. PDF and DOCX generation happens entirely in your browser and embeds the source form data for re-import.

For the full threat model, see [`docs/persistence-and-encryption.md`](docs/persistence-and-encryption.md) and [`docs/security.md`](docs/security.md).

## Project status

Active development. The data model is at version 2 (`PIAR_DATA_VERSION = 2`); breaking changes bump the version. Encryption is enabled for new drafts. Release metadata is aligned for `0.1.6`; publish annotated tag `v0.1.6` and the matching GitHub release to cut the first public release from `main`.

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
