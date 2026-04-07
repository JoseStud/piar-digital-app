# PIAR Digital App

Client-side app and demo for filling out Colombia's PIAR (Plan Individual de Ajustes Razonables) workflow.

The form runs in the browser. PIAR data is not sent to an application server; draft recovery uses local browser storage, and DOCX/PDF imports and exports happen client-side.

## Tech Stack

- Next.js static export
- React and TypeScript
- Tailwind CSS
- pdf-lib and jszip
- Vitest and React Testing Library
- Optional Tauri desktop shell

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to use the app.

## Build

```bash
npm run build
```

The build exports static files to `out/` and generates `out/headers.conf` from the CSP header template.

## Test

```bash
npm run typecheck
npm test
```

## Desktop Package

```bash
npm run desktop:dev
npm run desktop:build
```

The Tauri shell embeds the exported static app and exposes a native save dialog for PIAR exports and bundled template downloads.

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
