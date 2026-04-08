---
title: Onboarding Documentation, Code Comments, and Encryption Polish
date: 2026-04-07
status: approved
audience: implementation
---

# Onboarding Documentation, Code Comments, and Encryption Polish

## Goal

Make it easy for a new contributor (or future-you) to understand the PIAR
Digital app, by:

1. Finishing the in-progress `codex-encrypt-local-draft-storage` work and
   landing it as a clean commit, with comments that explain the non-obvious
   parts of the encryption design.
2. Adding heavy code comments across most source files: file headers, JSDoc on
   exported APIs, and inline `why:` comments at non-obvious decision points.
3. Boilerplating a developer-facing `docs/` folder (English) and an
   audience-facing GitHub wiki (Spanish), plus the `.github/` community files
   a public OSS repo is expected to have.
4. Polishing the existing `README.md` so a casual visitor immediately
   understands what the app is, what it isn't, and where to go next.

The work ships as a single PR on the existing
`codex-encrypt-local-draft-storage` branch, structured as **6 sequenced
commits** so each kind of change is reviewable in isolation.

## Out of scope

- CI workflow setup. Adding `.github/workflows/ci.yml` is its own design
  discussion and would surprise the user if added casually as part of a docs
  PR.
- Migration path for users who have pre-encryption drafts in localStorage.
  The current `unencrypted_data` error is the right behavior; a real migration
  needs its own design.
- Refactoring the encryption code, the autosave queue, or the IndexedDB
  helpers. The encryption polish commit is comments-only.
- Pushing the `wiki/` content to the live GitHub wiki repo. The folder ships
  in this PR; the actual `git push` to `<repo>.wiki.git` happens after merge.
- Shipping screenshots for the README and wiki. Captions and TODO markers
  ship; image files do not.
- Opening the PR. The branch ends ready, with a suggested PR title and body,
  but the actual `gh pr create` is the user's call.

## Decisions

These are the locked-in answers from the brainstorming dialogue. They drive
the rest of the spec.

| # | Question | Decision |
|---|---|---|
| 1 | Primary goal | Onboarding-focused (option A) |
| 2 | Code comment depth | Heavy: file headers + JSDoc + inline `why:` comments (option C) |
| 3 | In-progress encryption work | Treat as part of docs scope, ship in one branch (option D) |
| 4 | Wiki vs. `docs/` split | Wiki = audience-facing Spanish, `docs/` = developer-facing English (option A) |
| 5 | Language | Wiki Spanish, `docs/` and code comments English (option A) |
| 6 | `.github/` community files in scope | Yes, all of them, minus CI workflow (option A) |
| 7 (Section 1) | Encryption polish scope | Comments only, skip the test rename (option B) |
| 7 (Section 2) | `assessment-catalogs.ts` warning style | Normal JSDoc, no special treatment (option C) |
| 7 (Section 3) | `CLAUDE.md` vs. `docs/architecture.md` overlap | `docs/architecture.md` is canonical, `CLAUDE.md` shrinks to a one-paragraph pointer (option A) |
| 7 (Section 4) | Wiki sidebar | Include `wiki/_Sidebar.md` (option A) |
| 7 (Section 5) | Issue templates | Question template included (option A) |
| 7 (Section 6) | README privacy summary | Yes, prominent privacy & security summary section (option A) |
| 7 (Section 7) | Encryption freeze | Encryption work is fine as-is, freeze it as commit 1 (option A) |

Placeholders the user filled in:

- **Security contact email:** `support@piar.plus`
- **CODEOWNERS handle:** `@JoseStud`
- **DCO sign-off required:** No
- **GitHub Discussions enabled:** No (wiki FAQ + issues only)

## Approach

One feature branch (`codex-encrypt-local-draft-storage`, the existing
branch), one PR, **6 commits in this order**:

1. **Encryption polish + comments** — freeze the existing uncommitted
   encryption diff into a real commit, add comments explaining the
   non-obvious parts.
2. **Architecture comments** — file headers, JSDoc, and inline `why:`
   comments across source tree (~125 files touched).
3. **`docs/` developer pages** — 8 new English markdown files.
4. **`.github/` community files** — contributing, security, code of conduct,
   issue/PR templates, codeowners.
5. **`wiki/` markdown** — 6 Spanish wiki pages + Home + sidebar + a
   `wiki/README.md` explaining how to push them to the wiki repo.
6. **README polish** — expand `README.md`, add a docs/wiki pointer table and
   a privacy & security summary.

Reviewer can read commits one at a time. Reverting a single concern is
trivial. Each commit's verification gate is described in the **Verification**
section below.

## Commit 1 — Encryption polish + comments

**Behavior change:** none. This commit takes the existing uncommitted
encryption diff (the 8 modified files in `git status` at the start of this
work) and turns it into a real commit with comments layered on top.

### Files in this commit

- `src/features/piar/lib/persistence/progress-crypto.ts`
- `src/features/piar/lib/persistence/progress-store.ts`
- `src/features/piar/components/form/PIARForm/usePIARAutosave.ts`
- `src/features/piar/components/pdf/DownloadButton.tsx`
- `src/features/piar/screens/PiarHomePage.tsx`
- `tests/features/piar/components/form/PIARForm/usePIARAutosave.test.ts`
- `tests/features/piar/lib/persistence/progress-store.test.ts`
- `tests/test-utils/encrypted-progress-storage.ts`

Plus comment additions in the same files (no other files touched in this
commit).

### Comments to add

- **`progress-crypto.ts`** — file header explaining the threat model:
  encryption stops casual reads of `localStorage` by other extensions or
  other users on the same OS account, but does **not** protect against
  malicious code running in the same origin or against an attacker with
  filesystem access to the user's IndexedDB. Inline comments on:
  - `PROGRESS_KEY_ID` versioning rationale (string instead of number — a
    future migration can rotate keys without ambiguity).
  - `addStoredKey` race-vs-second-tab logic (why we ignore `ConstraintError`
    and re-read instead of failing).
  - `deviceKeyPromise` reset on failure (why we don't memoize errors).
  - `extractable: false` on `generateKey` — and that this is the entire
    reason an attacker with DOM access cannot dump the raw key.
- **`progress-store.ts`** — file header explaining the two-tier storage
  (encrypted main + unencrypted unload-recovery) and why both exist. Inline
  comments on:
  - `loadWithStatus` checking unload-recovery *first* (so a recent unload's
    plaintext-but-fresh data wins over an older encrypted save).
  - The `unencrypted_data` error code (existing users with pre-encryption
    drafts cannot decrypt — they get a clear error, no silent migration).
  - Error-code mapping rationale.
- **`usePIARAutosave.ts`** — file header on the "fire-and-forget save with
  versioned dirty tracking" model. Inline comments on:
  - `dirtyVersionRef` (why we compare versions inside the save callback — to
    avoid an in-flight save clearing a freshly-edited dirty flag).
  - The `saveQueueRef` chain (why every save goes through a serialized
    promise — to avoid concurrent encrypts racing).
  - The unload handler ordering (sync recovery write *before* queueing the
    async encrypted save, since the async save may not finish before the
    page dies).
- **`DownloadButton.tsx`** — short note in the existing
  `runDownload.saveResult` branch that the Spanish error message from
  `ProgressStore.save` already covers all the new crypto error codes via
  `buildStorageFailureMessage`, so no extra branching is needed.
- **`PiarHomePage.tsx`** — short note next to `saveWithNotice` for the same
  reason.
- **Test files** — one-line file header per test file (per the
  comment style guide). `tests/test-utils/encrypted-progress-storage.ts`
  gets a longer header explaining what it mocks and why.

### Things flagged but NOT changed in this commit

(These are recorded here so a future contributor doesn't need to rediscover
them, but they are explicitly out of scope for this commit.)

1. **`saveWithNotice` in `PiarHomePage.tsx`** and **`runDownload` in
   `DownloadButton.tsx`** both call `ProgressStore.save` and surface
   `result.message` to the user via a Spanish notice. They don't branch on
   the new crypto error codes — they just show the message. That's correct
   because `buildStorageFailureMessage` already returns Spanish strings for
   every code. A short comment in each place documents this so a future
   contributor doesn't add redundant error handling.
2. **The unload recovery has no max age.** If a user crashes their browser
   at midnight and reopens it three weeks later,
   `readUnloadRecoveryWithStatus` will happily restore the three-week-old
   plaintext copy. Probably fine in practice; documented in
   `progress-store.ts` as an explicit decision.
3. **`progress-store.test.ts`** has a new race-condition test whose name
   could be sharper (`keeps first-time device key creation readable across
   concurrent tab caches` is testing the "in-memory cache reset → re-read
   from IDB" path with a single tab). The user explicitly chose to leave
   the test file alone in this commit.

## Commit 2 — Architecture comments

**Behavior change:** none. Comment-only diff across most of the source
tree.

### Comment style guide

There are four kinds of comments. Every comment in this commit fits one of
these four shapes.

**1. File header (every source file).** A 3–10 line block comment at the
top of the file, before imports. Format:

```ts
/**
 * <one-sentence summary of what this file is>
 *
 * <2–4 lines of why-it-exists / how-it-fits / non-obvious facts.
 *  Reference sibling files where the boundary matters.>
 *
 * @see <relative paths to related files, optional>
 */
```

**2. JSDoc on exported functions and types.** One sentence describing what
it does, plus `@param` / `@returns` only when they aren't self-evident from
TypeScript types. **No JSDoc on internal helpers** — TS types already say
what they take and return; redundant doc is just noise that rots.

**3. Inline `// why:` comments** inside complex functions, only at points
where the *reason* for a line isn't obvious from reading it. Litmus test:
"would a competent React/TS developer read this line and ask 'why?'" If
yes, comment. If no, don't.

**4. Section dividers in long files.** Files over ~150 lines get
`// ─── Section Name ─────────` dividers grouping related declarations.
Used sparingly — only where the file genuinely has distinct sub-areas
(e.g., the PDF generator's table layout vs. text rendering vs. assembly).

### What this commit will NOT do

- No comments restating type signatures.
- No comments summarizing the next 5 lines of obvious code.
- No `@param` / `@returns` blocks that don't add information beyond the type.
- No inline comments on leaf React components — file header only.
- No history comments (`// was using X, switched to Y`). Goes in commit message.
- No author/date stamps.
- No comments on test files except a one-line file header explaining what
  is under test. Exception: complex setup helpers like
  `tests/test-utils/encrypted-progress-storage.ts` get a real header and
  inline `why:` comments.

### Coverage by area

| Area | Approx files | Comment density |
|---|---|---|
| `src/features/piar/lib/persistence/` | 2 | High (covered in commit 1) |
| `src/features/piar/lib/pdf/` | ~12 | High |
| `src/features/piar/lib/docx/` | ~25 | High |
| `src/features/piar/lib/portable/` | ~5 | Medium |
| `src/features/piar/lib/data/data-utils/` | ~4 | High |
| `src/features/piar/lib/forms/` | ~3 | Low |
| `src/features/piar/model/piar.ts` | 1 | High (every exported type) |
| `src/features/piar/content/assessment-catalogs.ts` | 1 | High (immutability contract documented in normal JSDoc) |
| `src/features/piar/components/form/` | ~10 | Medium |
| `src/features/piar/components/sections/` | ~15 | Low (file header only) |
| `src/features/piar/components/pdf/`, `feedback/` | ~5 | Low (file header only) |
| `src/features/piar/screens/` | 3 | Medium |
| `src/shared/` | ~20 | Low (file header only) |
| `app/` (Next.js routes) | ~5 | Medium (marketing vs. workflow split, indexability) |
| `tests/` | 41 (the 3 touched in commit 1 already have headers) | One-line file headers only |
| `scripts/` | ~3 | Medium |

Total: ~125 source files + 44 test files touched.

## Commit 3 — `docs/` developer pages

**Behavior change:** none. New files only.

### File list

```
docs/
├── README.md                       # Index — links to every other page
├── architecture.md                 # System overview, build/runtime model, layer map
├── data-model.md                   # PIARFormDataV2 spec, versioning contract
├── persistence-and-encryption.md   # Draft storage, encryption, threat model
├── pdf-docx-roundtrip.md           # How export → reimport works for both formats
├── contributing.md                 # Setup, branching, tests, PR conventions
├── testing.md                      # Test strategy, fixtures, vitest tips
├── security.md                     # Privacy posture, CSP, threat model summary
└── release.md                      # Build, static export, Docker, Tauri
```

`docs/superpowers/specs/` already exists for spec docs from this
brainstorming flow. The 8 new pages live alongside it, not under it.

### Page outlines

**`docs/README.md`** (~30 lines)

- One-paragraph "what this is, what it isn't"
- Indexed link list to every other doc page
- Pointer to the wiki for non-developer audiences
- Pointer to `CLAUDE.md` for AI tooling

**`docs/architecture.md`** (~150 lines)

- "Static export, no backend" — what that means in practice
- Layer map: `app/` → `screens/` → `components/` → `lib/` → `model/` → `content/`
- Mode state machine (`start` → `restore-prompt` → `form`) with the same
  ASCII diagram from `CLAUDE.md`
- Where each top-level concern lives (forms, persistence, PDF, DOCX,
  portable envelope)
- The `@/*` and `@piar-digital-app/*` path aliases
- Tailwind theme tokens and where they come from
- Build pipeline: `next build` → static export → CSP header generation →
  Docker/Nginx serve
- This is the canonical architecture document. `CLAUDE.md` will be reduced
  to a one-paragraph pointer to this page (see "CLAUDE.md changes" below).

**`docs/data-model.md`** (~120 lines)

- The `PIAR_DATA_VERSION` constant and the envelope shape `{ v, data }`
- Full `PIARFormDataV2` shape table (sections, sub-types, what each holds)
- Boolean tri-state convention (`null` / `true` / `false`) and where it
  shows up
- Fixed-length tuple pattern (`ajustes[5]`, `firmas.docentes[9]`, etc.) and
  why immutability matters
- Versioning contract: additive vs. breaking, when to bump `v`,
  `deepMergeWithDefaultsV2` role
- Legacy field handling (the `sectionMergers` fallbacks)
- Worked example: "I want to add a new field — here are the four files I
  touch"

**`docs/persistence-and-encryption.md`** (~100 lines)

- Two-tier storage model (encrypted main + unencrypted unload-recovery)
- Why both exist (the `pagehide` Web Crypto problem)
- Key generation (AES-256-GCM, 256-bit, non-extractable, IndexedDB-stored,
  device-scoped)
- The `keyId` versioning convention
- Threat model: what encryption protects against, what it does *not*
- Error code reference table (every code from `ProgressStoreSaveErrorCode`
  and `ProgressStoreLoadErrorCode` with cause and user-facing message)
- Race-condition-on-key-creation handling
- Pre-encryption draft handling (the `unencrypted_data` error, no
  auto-migration)

**`docs/pdf-docx-roundtrip.md`** (~120 lines)

- Shared envelope validator (`parsePIARData`) and where it lives
- PDF: hidden `piar_app_state` field, how data is embedded, how
  `pdf-importer` extracts it, version-awareness
- DOCX: custom XML root `<piar:document v="2">`, the field manifest, how
  `docx-importer` reads it
- The "structured fields only" round-trip guarantee for DOCX (mirrors the
  existing user-facing warning copy)
- The golden-path tests (`pdf-roundtrip.test.ts`, `docx-roundtrip.test.ts`)
- "If you change the data model, here's what you must update in both
  formats"

**`docs/contributing.md`** (~120 lines)

- Prerequisites (Node version, npm)
- First-time setup (`npm install`, `npm run dev`)
- Branch naming
- Commit message conventions (derived from `git log`)
- The four scripts (`dev`, `build`, `lint`, `typecheck`, `test`)
- How to run a single test file
- The "must pass before PR" checklist:
  `npm run lint && npm run typecheck && npm test && npm run build`
- Where to ask questions (issue tracker, security disclosures)
- Pointer to `.github/CONTRIBUTING.md` (the GitHub-surfaced short version)

**`docs/testing.md`** (~100 lines)

- Vitest + jsdom + RTL stack
- Test file layout (`tests/` mirrors `src/`)
- The `.claude/` and `.superpowers/` excludes
- Fixture conventions (where shared test utilities live)
- Smoke vs. unit tests — which directory holds what
- Testing patterns for the form (driving `usePIARFormController`, asserting
  on saved progress)
- Encryption tests (the IndexedDB mock, how
  `installEncryptedProgressStorageMocks` works)
- "When to add a roundtrip test"

**`docs/security.md`** (~80 lines)

- Privacy posture: no backend, no analytics, no telemetry
- Encryption summary (link to `persistence-and-encryption.md` for depth)
- CSP header generation pipeline
- Same-origin lazy chunk loading (the only network the form does)
- What the user has to trust (the JS bundle, the device, the browser)
- How to report a vulnerability → link to `.github/SECURITY.md`
- Note on Decreto 1421 / Anexo 2 compliance scope (the app helps fill out
  the form; it does not certify the user's institution's process)

**`docs/release.md`** (~80 lines)

- `npm run build` → what's in `out/`
- `headers.conf` generation
- Docker build args (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`)
- `nginx.conf` notes
- Tauri desktop build (`npm run desktop:dev`, `npm run desktop:build`)
- Versioning the data model (when shipping a release that changes the data
  shape)

### `CLAUDE.md` changes (part of this commit)

`CLAUDE.md` overlap with `docs/architecture.md` is resolved by making
`docs/architecture.md` canonical:

- The "Architecture" section in `CLAUDE.md` shrinks to a one-paragraph
  pointer: "See `docs/architecture.md` for the system overview and
  `docs/data-model.md` for the data shape spec."
- The "Commands", "Testing", "Domain Context", and "Versioning Contract"
  sections in `CLAUDE.md` stay as-is — they're already in a form that's
  useful for AI context priming.
- The "Data Flow" ASCII diagram and the "Key Layers" bullets move to
  `docs/architecture.md`. They are removed from `CLAUDE.md`.
- The "Component Patterns" and `PIARFormDataV2` shape sections move to
  `docs/architecture.md` and `docs/data-model.md` respectively, and are
  removed from `CLAUDE.md`.

This is a meaningful edit to `CLAUDE.md`. It happens in commit 3 alongside
the new docs pages so the pointer always points at something that exists.

## Commit 4 — `.github/` community files

**Behavior change:** none. New files only.

### File list

```
.github/
├── CONTRIBUTING.md             # Short, GitHub-surfaced — links to docs/contributing.md
├── SECURITY.md                 # Vulnerability disclosure
├── CODE_OF_CONDUCT.md          # Contributor Covenant 2.1
├── CODEOWNERS                  # Reviewer routing — single line: @JoseStud
├── PULL_REQUEST_TEMPLATE.md    # PR checklist
└── ISSUE_TEMPLATE/
    ├── config.yml              # Disables blank issues, links to wiki FAQ + SECURITY.md
    ├── bug_report.yml          # Form-based bug template
    ├── feature_request.yml     # Form-based feature template
    └── question.yml            # Form-based question template
```

### File outlines

**`.github/CONTRIBUTING.md`** (~40 lines)

- Half-page version. Full developer onboarding lives at
  `docs/contributing.md`; this one is what GitHub surfaces when a user
  clicks "New PR".
- "Thanks for contributing" paragraph
- Three links: `docs/contributing.md`, `docs/architecture.md`,
  `CODE_OF_CONDUCT.md`
- The four must-pass commands as a checklist
- A line on commit message style (derived from `git log`)
- No DCO sign-off requirement (per user decision)

**`.github/SECURITY.md`** (~50 lines)

- Supported versions table (just `main` for now since there are no tagged
  releases yet)
- Reporting a vulnerability: email `support@piar.plus`
- What to include in a report
- Expected response time: honest "best-effort, volunteer-maintained"
  language, no SLA
- Public disclosure policy: after a fix is released or after 90 days,
  whichever is sooner
- In scope: the web app's client-side code, the encryption design, the CSP
  configuration
- Out of scope: vulnerabilities in user devices, third-party browser
  extensions, the underlying browser, social engineering, the user's own
  infrastructure

**`.github/CODE_OF_CONDUCT.md`** (~130 lines)

- Standard Contributor Covenant 2.1, verbatim
- Contact line uses `support@piar.plus`

**`.github/CODEOWNERS`** (~10 lines)

- Single catch-all line: `* @JoseStud`

**`.github/PULL_REQUEST_TEMPLATE.md`** (~30 lines)

- Summary section
- Why section (what problem this solves)
- Test plan checklist
- Checklist: `lint && typecheck && test && build` pass; data-model changes
  documented in `docs/data-model.md`; encryption changes reviewed by
  maintainer; round-trip tests still pass if PDF/DOCX touched
- Link to `CONTRIBUTING.md`

**`.github/ISSUE_TEMPLATE/config.yml`** (~15 lines)

- `blank_issues_enabled: false`
- `contact_links` pointing to the wiki FAQ for usage questions and to
  `SECURITY.md` for security reports
- Note: GitHub Discussions is **not** enabled on the repo (per user
  decision); support channels are wiki FAQ + issues only.

**`.github/ISSUE_TEMPLATE/bug_report.yml`** (~50 lines, GitHub form schema)

- Fields: title prefix, description, steps to reproduce, expected, actual,
  browser+version, OS, screenshots, logs
- Required-field markers
- Note: "Do not include real student data"

**`.github/ISSUE_TEMPLATE/feature_request.yml`** (~30 lines, form schema)

- Fields: problem statement, proposed solution, alternatives considered,
  who benefits, related Decreto/anexo references if applicable

**`.github/ISSUE_TEMPLATE/question.yml`** (~30 lines, form schema)

- Fields: question, what you've already tried (link to wiki FAQ entries
  you've checked), what answer would help
- Required-field markers point users to the wiki FAQ first

## Commit 5 — `wiki/` markdown

**Behavior change:** none. New files only. All page content is in
**Spanish**; only the `wiki/README.md` (which is internal-developer-facing)
is in English.

### File list

```
wiki/
├── README.md                          # English: how to push to the wiki repo
├── _Sidebar.md                        # ES: shows on every wiki page
├── Home.md                            # ES: landing page
├── Que-es-PIAR.md                     # ES: PIAR background, Decreto 1421
├── Privacidad-y-seguridad.md          # ES: privacy + encryption for non-devs
├── Como-usar-la-aplicacion.md         # ES: end-user walkthrough
├── Preguntas-frecuentes.md            # ES: FAQ
├── Despliegue-para-instituciones.md   # ES: IT staff deployment guide
└── Reportar-un-problema.md            # ES: how to file an issue / report a vuln
```

GitHub wiki convention: top-level `.md` files become wiki pages, the
filename (with hyphens) becomes the page name. `Home.md` is the landing
page by convention.

### Page outlines

**`wiki/README.md`** (~30 lines, English)

- Explains that this folder is the source of truth for the GitHub wiki
- The `git clone <repo>.wiki.git` + copy + commit + push procedure
- A note that wiki edits made through GitHub's UI will be overwritten on
  the next sync from this folder
- Suggested workflow: edit in `wiki/` → review in PR → after merge, run a
  small shell script to push. **The script itself is described but not
  shipped** in this commit.

**`wiki/_Sidebar.md`** (~20 lines, Spanish)

- Linked nav list of all wiki pages
- Shown on every page in the live wiki

**`wiki/Home.md`** (~60 lines, Spanish)

- "PIAR Digital — Plan Individual de Ajustes Razonables, en su navegador"
- Plain-Spanish summary paragraph
- Three "para quién es esto" cards: docentes, equipos de apoyo
  psicopedagógico, IT institucional
- "Lo que esta aplicación hace" (3–5 bullets) and "lo que NO hace" (3–5
  bullets — no envía datos, no requiere cuenta, no certifica nada
  legalmente)
- Sidebar-style links to the other 6 pages

**`wiki/Que-es-PIAR.md`** (~80 lines, Spanish)

- What PIAR is in plain Spanish
- Decreto 1421 de 2017, Anexo 2 — short legal context
- Who is required to fill it out and when
- What it's used for
- Disclaimer: this app is a tool to fill out the form, not an official
  MEN/MinEducación product, not a certification of compliance, the
  resulting documents must still be reviewed and signed per institutional
  process
- "¿Esto reemplaza al formato oficial?" → no, produces the same form

**`wiki/Privacidad-y-seguridad.md`** (~100 lines, Spanish)

- Plain-Spanish version of the threat model
- "Sus datos no salen del navegador" — what that means and what it does
  not mean
- Cifrado local: AES-256-GCM, llave generada en su dispositivo, no
  exportable
- "¿Quién puede ver los datos?" — honest list of who can (anyone with
  physical access, anyone with the user's OS account, malware on the
  device)
- "¿Quién no puede verlos?" — Anthropic, the developers, any cloud
  server, network observers
- Recomendaciones para uso institucional: equipos compartidos, pestañas
  privadas, cerrar sesión
- Cómo borrar todo (botón "Limpiar formulario")
- Pointer to `Reportar-un-problema.md`

**`wiki/Como-usar-la-aplicacion.md`** (~120 lines, Spanish)

- Step-by-step user walkthrough: abrir → empezar nuevo o restaurar →
  llenar secciones → guardar → exportar PDF/DOCX → reimportar
- One section per workflow stage
- Placeholder image references like `![Pantalla de inicio](images/inicio.png)`
- A TODO list at the bottom of the page enumerating which screenshots are
  needed
- Tips: autosave, offline use, qué hacer si el navegador se cierra
  inesperadamente
- DOCX vs. PDF guidance, mirroring the existing in-app UX copy

**`wiki/Preguntas-frecuentes.md`** (~80 lines, Spanish)

- "¿Necesito conexión a internet?" → solo para cargar la primera vez
- "¿Mis datos se envían a un servidor?" → no
- "¿Puedo usarlo sin instalar nada?" → sí
- "¿Funciona en celular?" → sí, optimizado para escritorio
- "¿Puedo continuar un PIAR que empecé en otro computador?" → exporte
  DOCX/PDF y lo reimporta
- "¿Si limpio el formulario puedo recuperar los datos?" → no, exporte un
  respaldo antes
- "¿Diferencia entre PDF y DOCX?" → PDF final, DOCX editable
- "¿Esto es oficial del Ministerio?" → no
- "¿Es gratis?" → sí, GPL-3.0
- "¿Cómo reporto un error?" → link

**`wiki/Despliegue-para-instituciones.md`** (~100 lines, Spanish)

- Audience: IT staff at a Secretaría de Educación or institución educativa
- Three deployment options:
  1. Use the public hosted version (placeholder text — link to repo README
     for known instances)
  2. Self-host static (Docker + Nginx — link to `docs/release.md` for
     technical details)
  3. Distribuir la versión de escritorio (Tauri build)
- "Qué necesita su servidor": disk, memory, network — minimal requirements
- "Configuración para .gov.co": CSP, headers, HTTPS, dominio
- "Soporte": link to issue tracker
- This page intentionally does not include build commands; it links to
  `docs/release.md` for those.

**`wiki/Reportar-un-problema.md`** (~50 lines, Spanish)

- For bugs: link to GitHub issues, what to include in a bug report
- For security vulnerabilities: do NOT open a public issue, use the
  process from `.github/SECURITY.md` — link both
- For general questions: also issues, with a "question" template
- Note: the project may be slow to respond and PRs are welcome

### Cross-linking

Each wiki page ends with a "ver también" footer linking to 2–3 related
pages. The `_Sidebar.md` shows a global nav on every page.

## Commit 6 — README polish

**Behavior change:** none. Edits to the existing `README.md`.

### New section order

1. **Title + tagline** — "PIAR Digital — fill out Colombia's PIAR form, in
   your browser, without sending data anywhere."
2. **Badges row** — license badge (GPL-3.0), Node version badge,
   "no backend / client-side only" status badge. **No CI badge.** No
   third-party tracking pixels (no shields.io, no img.shields.io URLs).
   Plain markdown bracket labels like `[![GPL-3.0](https://img.shields.io/badge/...)]`
   are the wrong shape — use bare bracket text like `**[GPL-3.0]**
   **[Node 20+]** **[Client-side only]**` so nothing is fetched at render
   time.
3. **One-paragraph "what this is"** — existing paragraph, lightly edited.
4. **Screenshots** — 2–3 placeholder image references with captions.
   TODO note at the bottom listing which screenshots are needed.
5. **"What this is" / "What this is not" two-column table** — sets
   expectations. Mirrors the Spanish version on `wiki/Home.md` in English.
6. **Quickstart** — existing `## Development` block, lightly edited.
7. **Build** — existing block, kept as-is.
8. **Test** — existing block, kept as-is.
9. **Desktop package** — existing Tauri block, kept as-is.
10. **Documentation pointer table:**
    | Audience | Where to look |
    |---|---|
    | I want to use the app | `wiki/Home.md` |
    | I want to understand the architecture | `docs/architecture.md` |
    | I want to contribute code | `docs/contributing.md` and `.github/CONTRIBUTING.md` |
    | I want to deploy this | `docs/release.md` |
    | I want to report a vulnerability | `.github/SECURITY.md` |
    | I'm an AI assistant working in this repo | `CLAUDE.md` |
11. **Privacy & security summary** — 3-bullet summary. "No backend.
    Drafts are encrypted with AES-256-GCM in your browser. Exports happen
    client-side." Pointer to `docs/security.md`.
12. **Project status** — honest about maturity: data model at v2,
    breaking changes bump the version, encryption enabled for new drafts.
13. **License** — existing block, kept as-is.

### What stays out

- Star history widgets, contributor badges, sponsor buttons
- Architecture diagram image (the prose pointer is enough)
- Emojis in section headers
- Roadmap section
- Acknowledgments section

## Verification

### Per-commit gates

| Commit | Required to pass before moving on |
|---|---|
| 1. Encryption polish + comments | `npm run typecheck` + `npm test` (existing encryption tests must pass; behavior is unchanged) |
| 2. Architecture comments | `npm run typecheck` + `npm run lint` + `npm test` |
| 3. `docs/` pages | `npm run lint` (catches any TS code-block issues) + manual spot-check of code snippets |
| 4. `.github/` files | Manual eyeball of the YAML issue templates |
| 5. `wiki/` markdown | None — pure prose |
| 6. README polish | Mental render of the markdown |

### Final gate before declaring done

After commit 6, one full pass:

```
npm run lint && npm run typecheck && npm test && npm run build
```

Same checklist that ships in `.github/CONTRIBUTING.md` and
`docs/contributing.md`. If anything fails, diagnose root cause and fix on a
follow-up commit on the same branch. Do not amend or force-push.

### What verification will NOT do

- No running of the dev server or manual UI clicking. Comment passes do
  not need this. Manual smoke tests are the user's call after the PR is
  open.
- No pushing the wiki content to the live wiki repo.
- No publishing to npm, Docker Hub, or any registry.
- No opening of the PR. The branch ends ready, with a suggested PR title
  and body, but the actual `gh pr create` is the user's call.

## Rollback plan

Each commit is its own kind of work, so rollback is mechanical:

- **Commit 1** (encryption polish) is also where the existing in-progress
  encryption work becomes a real commit. Reverting it returns the working
  tree to the current uncommitted state on the branch. The user has
  explicitly approved freezing the encryption work as-is.
- **Commit 2** (architecture comments) is comment-only and revertable in
  isolation.
- **Commits 3, 4, 5** (`docs/`, `.github/`, `wiki/`) add files only.
  Revert deletes them. Safe.
- **Commit 6** (README polish) modifies the existing README. Revert is a
  normal edit.

If a single commit needs revision rather than full revert, follow up with
a new commit on the same branch. Never amend history that's already been
pushed.

## Open items

None. All clarifying questions answered, all placeholder values filled in,
all design questions decided.
