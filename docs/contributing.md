# Contributing

This is the full developer onboarding guide for PIAR Digital. The short version surfaced by GitHub will live in `.github/CONTRIBUTING.md`.

## Prerequisites

- Node 20-24, matching the `package.json` engines range
- npm, because the repository uses `package-lock.json`

## First-time setup

```bash
git clone https://github.com/JoseStud/piar-digital-app.git
cd piar-digital-app
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server at `localhost:3000` |
| `npm run build` | Static export to `out/` plus CSP header generation |
| `npm run lint` | ESLint with `next/core-web-vitals` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest run (single pass) |
| `npm run test:watch` | Vitest watch mode |
| `npm run desktop:dev` | Tauri desktop dev shell |
| `npm run desktop:build` | Tauri desktop release build |

## Running a single test file

```bash
npx vitest run tests/features/piar/lib/pdf/pdf-roundtrip.test.ts
```

Or by name:

```bash
npx vitest run -t "round-trip"
```

## Branch naming

Use `<type>-<short-description>`. Common types: `feat`, `fix`, `docs`, `chore`, `refactor`.

## Commit messages

Use `<type>(<scope>): <imperative summary>`.

Keep the body focused on why the change exists. The diff already shows what changed.

If the work was AI-assisted, end the message with `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`.

## Before opening a PR

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Maintainer requirements

- Maintainers with GitHub access and any future SignPath access must use multi-factor authentication.
- External contributions merge through pull requests reviewed by the repository owner.
- Trusted maintainer pushes to the default branch remain allowed while the repository is single-maintainer.
- Release signing requires manual approval in the `PIAR` GitHub environment.
- Release, signing, and provenance files (`.signpath/**`, `docs/code-signing-policy.md`, `docs/release.md`, `PROVENANCE.md`) require code owner review.

## Where to ask

- General questions and bugs: GitHub issues
- Security issues: see `.github/SECURITY.md`

## AI tooling

- `CLAUDE.md` is a context primer for Claude Code. In this workspace it may live at the parent workspace root rather than inside the app repo; do not edit an out-of-repo `CLAUDE.md` as part of an app PR.
- `docs/superpowers/` holds the AI-assisted brainstorming specs and plans

## House rules

- Field names from the official PIAR template stay in Spanish
- Assessment catalog item ids are immutable
- Boolean tri-state fields use `null` for `sin respuesta`; never coerce them to `false`
