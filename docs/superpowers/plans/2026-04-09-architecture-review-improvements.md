# Architecture Review Improvements — 10 PRs

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all actionable improvements from the 2026-04-09 architecture review as independent PRs, one per improvement area.

**Architecture:** Each PR branches from `main`, implements a single improvement with tests, and is submitted via `gh pr create`. All PRs are independent — no cross-dependencies.

**Tech Stack:** Next.js 14, React 18, TypeScript 5, Vitest 2, Tailwind 3, pdf-lib, jszip

## Reality Check Matrix (2026-04-09)

| PR | Agent | Status | Current Reality |
| --- | --- | --- | --- |
| PR 1 | `pr1-autosave` | Not started | Manual retry exists; no automatic exponential retry |
| PR 2 | `pr2-boundaries` | Not started | Only root `ErrorBoundary` exists in `FormWorkspace` |
| PR 3 | `pr3-bundle-ci` | Not started | No bundle-size script/check; current chunks are ~465.8 KB gzipped |
| PR 4 | `pr4-workflow-hook` | Not started | `PiarHomePage.tsx` still owns full state machine (~270 lines) |
| PR 5 | `pr5-a11y` | Not started | No a11y test suite (`vitest-axe` not configured) |
| PR 6 | `pr6-sw` | Not started | PWA manifest exists, but no service worker file/registration |
| PR 7 | `pr7-completeness` | Not started | `ProgressNav` only tracks touched sections, not field completeness |
| PR 8 | `pr8-vitest-parallel` | Not started | `fileParallelism` remains `false` in `vitest.config.mts` |
| PR 9 | `pr9-recovery-clear` | Partially implemented | Recovery clearing happens after save, not on successful load |
| PR 10 | `pr10-inline-validation` | Not started | No inline field-validation helpers or hint component |

---

## PR 1: Autosave Retry with Exponential Backoff

**Branch:** `improvement/autosave-retry`
**Agent:** `pr1-autosave`
**Reality Check:** Not started; only manual retry is implemented today.

**Files:**
- Modify: `src/features/piar/components/form/PIARForm/usePIARAutosave.ts`
- Modify: `src/features/piar/components/form/PIARForm/SaveStatusBanner.tsx`
- Modify: `tests/features/piar/components/form/PIARForm/usePIARAutosave.test.ts`

**Context:** Currently, when autosave fails (e.g., localStorage quota exceeded, crypto failure), the user sees "Error al guardar" with a manual "Reintentar" button. There is no automatic retry. For a form where data loss is the worst outcome, the system should retry automatically before requiring manual intervention.

### Implementation Details

**usePIARAutosave.ts changes:**
- Add `retryCountRef = useRef(0)` and `retryTimerRef = useRef<ReturnType<typeof setTimeout>>()`
- After a failed save in `runSave()`, if `retryCountRef.current < MAX_RETRIES` (3), schedule a retry with exponential delay: `500 * 2^retryCount` (500ms, 1000ms, 2000ms)
- On successful save, reset `retryCountRef.current = 0`
- Add `retryCount` to the return value so the banner can display it
- New `SaveIndicatorState` value is NOT needed — keep `'failed'` but distinguish "retrying" via the retryCount > 0 check
- Clear retry timer on unmount and on new data change (fresh edit resets the retry chain)
- The `retrySave` manual function should also reset `retryCountRef` to 0

**SaveStatusBanner.tsx changes:**
- Accept new `retryCount?: number` prop
- When `saveState === 'failed' && retryCount > 0`, show "Reintentando ({retryCount}/3)..." instead of the error message
- When `retryCount >= MAX_RETRIES`, show full error with manual retry button (existing behavior)

**Test additions:**
- Test that a failed save triggers automatic retry after delay (use `vi.useFakeTimers()`)
- Test that retry uses exponential backoff timing (500, 1000, 2000)
- Test that successful retry resets counter
- Test that 3 consecutive failures stop retrying and show `'failed'`
- Test that a new data change cancels pending retry and resets counter
- Test that unmount clears retry timer

---

## PR 2: Per-Section Error Boundaries

**Branch:** `improvement/section-error-boundaries`
**Agent:** `pr2-boundaries`
**Reality Check:** Not started; section renders are not wrapped with per-section boundaries.

**Files:**
- Create: `src/features/piar/components/form/SectionErrorBoundary.tsx`
- Modify: `src/features/piar/components/form/PIARForm/index.tsx`
- Create: `tests/features/piar/components/form/SectionErrorBoundary.test.tsx`

**Context:** Currently there's a single `ErrorBoundary` at the workflow root. If any section component throws during render, the entire form is replaced with an error panel. Per-section boundaries allow one section to crash while the rest remain editable.

### Implementation Details

**SectionErrorBoundary.tsx:**
- Class component (React error boundaries require class components)
- Props: `{ children: ReactNode; sectionTitle: string }`
- State: `{ hasError: boolean }`
- `getDerivedStateFromError()` → `{ hasError: true }`
- `componentDidCatch()` → `console.error` with section name for debugging
- Fallback UI: a compact error card (smaller than the full-page ErrorBoundary) with:
  - Section title in the error message: "Error en la sección: {sectionTitle}"
  - Brief Spanish message: "Esta sección tuvo un error. Las demás secciones siguen disponibles."
  - "Reintentar" button that resets `hasError` to false (re-mounts the section)
- Uses existing design tokens: `bg-error-container`, `text-on-error-container`

**PIARForm/index.tsx changes:**
- Wrap each section's `{section.render(data, sectionHandlers)}` call inside `<SectionErrorBoundary sectionTitle={section.title}>` in the `.map()` loop
- No other changes needed

**Tests:**
- Test that boundary catches render errors and shows fallback
- Test that other sections remain visible when one crashes
- Test that "Reintentar" button re-renders the section
- Test that `sectionTitle` appears in the error message

---

## PR 3: Bundle Size Tracking in CI

**Branch:** `improvement/bundle-size-ci`
**Agent:** `pr3-bundle-ci`
**Reality Check:** Not started; use a realistic initial budget based on current output.

**Files:**
- Create: `scripts/check-bundle-size.mjs`
- Modify: `.github/workflows/ci.yml`

**Context:** There's no CI check to catch accidental dependency bloat. A script that parses the Next.js build output size and fails on >X KB delta provides cheap insurance against regressions.

### Implementation Details

**scripts/check-bundle-size.mjs:**
- Read all `.js` files in `out/_next/static/chunks/` after build
- Sum their sizes (gzipped via `zlib.gzipSync` for realistic measurement)
- Print a summary table: `chunk name | raw size | gzipped size`
- Compare total gzipped JS against a hard-coded budget (start at **480 KB**; current build is ~465.8 KB gzipped)
- Exit code 1 if over budget, with clear message showing actual vs budget
- Budget value stored as a const at top of file for easy adjustment

**CI workflow changes:**
- Add a "Bundle size check" step in the `build` job, after `npm run build`:
  ```yaml
  - name: Check bundle size
    run: node scripts/check-bundle-size.mjs
  ```

**No tests needed** — this is a build script verified by CI itself.

---

## PR 4: Extract PiarHomePage State Machine

**Branch:** `improvement/extract-piar-workflow-hook`
**Agent:** `pr4-workflow-hook`
**Reality Check:** Not started; no `usePiarWorkflow` hook or dedicated screen-state tests exist.

**Files:**
- Create: `src/features/piar/screens/usePiarWorkflow.ts`
- Modify: `src/features/piar/screens/PiarHomePage.tsx`
- Create: `tests/features/piar/screens/usePiarWorkflow.test.ts`

**Context:** `PiarHomePage.tsx` at 270 lines manages the mode state machine, ref-based data persistence, restore prompts, file upload orchestration, and error handling all in one component. Extracting the state machine into a testable hook makes the mode transitions independently verifiable.

### Implementation Details

**usePiarWorkflow.ts:**
- Extract these from PiarHomePage:
  - `mode` state and `setMode`
  - `initialFormData` state
  - `formKey` state
  - `storageNotice` and `dataCorrectionNotice` states
  - `formDataRef`
  - `isClearDialogOpen`, `isExportingBackup`, `clearDialogMessage` states
  - All callback functions: `handleStartNew`, `handleRestoreAccept`, `handleRestoreDecline`, `handleImport`, `handleDataChange`, `handleClearProgress`, `handleClearProgressConfirm`, `handleReturnToStart`, `handleExportBackupBeforeClear`, `replaceCurrentFormData`, `getFormData`, `openForm`, `resetToEmptyForm`, `saveWithNotice`
- Hook signature: `usePiarWorkflow(options: { docxTemplate?: PIARDocxTemplateSource })`
- Return type: all state values + all handlers needed by PiarHomePage to render

**PiarHomePage.tsx changes:**
- Replace all extracted state/callbacks with a single `usePiarWorkflow()` call
- Destructure the return value
- The component becomes purely a render function (~50 lines) that delegates to `AppStartScreen` or `FormWorkspace` based on `mode`

**Tests:**
- Test initial mode is `'start'`
- Test `handleStartNew` with no saved data → transitions to `'form'`
- Test `handleStartNew` with saved data → transitions to `'restore-prompt'`
- Test `handleRestoreAccept` → transitions to `'form'`
- Test `handleRestoreDecline` → clears storage, transitions to `'form'`
- Test `handleReturnToStart` → saves data, transitions to `'start'`
- Test `handleClearProgressConfirm` → clears storage, transitions to `'form'` with empty data
- Mock `ProgressStore` for all tests

---

## PR 5: Accessibility Testing with axe-core

**Branch:** `improvement/accessibility-testing`
**Agent:** `pr5-a11y`
**Reality Check:** Not started; add coverage for all 12 sections from `SECTION_LIST`.

**Files:**
- Modify: `package.json` (add `vitest-axe` dev dependency)
- Create: `tests/a11y/section-accessibility.test.tsx`
- Create: `tests/a11y/axe-setup.ts`

**Context:** For a government form used by educators supporting students with disabilities, accessibility is critical. Currently there are zero automated a11y tests. Adding axe-core tests verifies ARIA compliance, color contrast (where applicable), and semantic structure.

### Implementation Details

**Dependencies:**
- `npm install -D vitest-axe` (wraps axe-core for vitest)

**tests/a11y/axe-setup.ts:**
- Import `expect` from vitest and `* as matchers` from vitest-axe
- Call `expect.extend(matchers)` to add `toHaveNoViolations()` matcher
- Export a `renderAndCheck` helper that renders a component and runs axe

**tests/a11y/section-accessibility.test.tsx:**
- Test each section component for a11y violations (12 section components total):
  - HeaderSection with empty HeaderV2 data
  - StudentSection with empty StudentV2 data
  - EntornoSaludSection with empty data
  - EntornoHogarSection with empty data
  - EntornoEducativoSection with empty data
  - ValoracionPedagogicaSection with empty data
  - CompetenciasDispositivosSection with empty data
  - DescripcionHabilidadesSection with empty data
  - EstrategiasAccionesSection with empty data
  - AjustesRazonablesSection with empty data
  - SignaturesSection with empty FirmasV2 data
  - ActaAcuerdoSection with empty data
  - ProgressNav with empty touchedSections
  - SaveStatusBanner in each state (idle, saving, saved, failed)
- Each test: render → `axe(container)` → `expect(results).toHaveNoViolations()`
- If violations are found, fix the source component (add missing labels, ARIA attrs)

---

## PR 6: Service Worker for Offline-First

**Branch:** `improvement/service-worker`
**Agent:** `pr6-sw`
**Reality Check:** Not started; `manifest.ts` already exists, so this PR only adds SW runtime behavior.

**Files:**
- Create: `public/sw.js`
- Modify: `src/app/layout.tsx` (add SW registration script)

**Context:** For a privacy-first app that emphasizes no-server-needed, a service worker makes it genuinely offline-first after first load. Currently, losing network means losing the app until reconnection.

### Implementation Details

**public/sw.js:**
- Cache name with version: `'piar-v1'`
- `install` event: precache the app shell — `'/'`, `'/diligenciar'`, and all `/_next/static/` assets
  - Use `self.skipWaiting()` for immediate activation
- `activate` event: delete old caches with different version prefix
  - Use `self.clients.claim()` for immediate control
- `fetch` event strategy:
  - Navigation requests (HTML): network-first with cache fallback
  - Static assets (`/_next/static/`): cache-first with network fallback
  - Everything else: network-first
- Keep it simple — no workbox, no build-time manifest. The static export produces a small, enumerable set of files.

**layout.tsx changes:**
- Add a `<script>` block at the end of `<body>` that registers the SW:
  ```js
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
  ```

**CSP changes:**
- The new inline script needs its SHA-256 hash added to the CSP. The existing `generate-csp-headers.mjs` already handles this automatically by scanning all inline `<script>` tags in the built HTML.

**No unit tests** — service workers are tested by the Docker health check in CI (page loads, responds correctly). A manual smoke test in the PR description covers offline behavior.

---

## PR 7: Form Completeness Indicator

**Branch:** `improvement/form-completeness`
**Agent:** `pr7-completeness`
**Reality Check:** Not started; keep completeness logic deterministic and tied to the stable form schema.

**Files:**
- Create: `src/features/piar/lib/forms/section-completeness.ts`
- Modify: `src/features/piar/components/form/ProgressNav.tsx`
- Modify: `src/features/piar/components/form/PIARForm/index.tsx`
- Create: `tests/features/piar/lib/forms/section-completeness.test.ts`
- Modify: `tests/features/piar/components/form/ProgressNav.test.tsx`

**Context:** `ProgressNav` tracks which sections have been "touched" but not which are actually complete. Showing "7/12 campos" per section would guide users toward completion.

### Implementation Details

**section-completeness.ts:**
- Export a `computeSectionCompleteness(sectionId: PiarSectionId, data: PIARFormDataV2): { filled: number; total: number }` function
- For each section, define which fields count as "filled":
  - Strings: non-empty after `.trim()`
  - Booleans: not `null` (both `true` and `false` count as answered)
  - Sub-objects: recurse into their fields
  - Fixed-length tuples (ajustes): count rows where at least one field is filled
- Keep the field list per section hardcoded — it's a small, stable list tied to the official form template
- Return `{ filled, total }` — ProgressNav computes the percentage

**ProgressNav.tsx changes:**
- Accept new prop: `sectionCompleteness: Map<string, { filled: number; total: number }>`
- In the desktop nav, below each section label, show a compact progress indicator:
  - `{filled}/{total}` in `text-[10px]` when section is touched
  - Nothing when section is pending (not yet touched)
- In the summary box at bottom, show total filled / total fields across all sections

**PIARForm/index.tsx changes:**
- Import `computeSectionCompleteness` and `SECTION_LIST`
- Compute `sectionCompleteness` map with `useMemo` keyed on `data`
- Pass to `ProgressNav`

**Tests:**
- Test `computeSectionCompleteness` for each section with empty data → `{ filled: 0, total: N }`
- Test with partially filled data → correct count
- Test with fully filled data → `{ filled: N, total: N }`
- Test that boolean `null` counts as unfilled, `true`/`false` count as filled

---

## PR 8: Enable Vitest File Parallelism

**Branch:** `improvement/vitest-parallel`
**Agent:** `pr8-vitest-parallel`
**Reality Check:** Not started; config remains sequential despite fork isolation being enabled.

**Files:**
- Modify: `vitest.config.mts`

**Context:** Tests still run sequentially with `fileParallelism: false`. Enabling parallelism should cut runtime since test files are already isolated via `pool: 'forks'` with `isolate: true`.

### Implementation Details

**vitest.config.mts change:**
- Change `fileParallelism: false` to `fileParallelism: true`
- That's it. The existing `pool: 'forks'` + `isolate: true` config already ensures process isolation.

**Verification:**
- Run `npx vitest run` and confirm all 307 tests pass
- Compare wall-clock time before vs after
- If any test fails due to shared state (e.g., localStorage in jsdom), fix the test rather than reverting

---

## PR 9: Aggressive Unload-Recovery Slot Clearing

**Branch:** `improvement/recovery-slot-clearing`
**Agent:** `pr9-recovery-clear`
**Reality Check:** Partially implemented; unload recovery is cleared after save success, but not inside `loadWithStatus()`.

**Files:**
- Modify: `src/features/piar/lib/persistence/progress-store.ts`
- Modify: `src/features/piar/screens/PiarHomePage.tsx`
- Modify: `tests/features/piar/lib/persistence/progress-store.test.ts`

**Context:** The unload-recovery slot is deliberately unencrypted plaintext (because Web Crypto can't be awaited during `pagehide`). Minimizing the window during which this plaintext data exists reduces exposure.

### Implementation Details

**progress-store.ts changes:**
- In `ProgressStore.loadWithStatus()`: after any successful load path (recovery slot or encrypted slot), call `clearUnloadRecovery()` so plaintext does not persist longer than needed.
- Existing: `clearUnloadRecovery()` is called after successful encrypted save in `usePIARAutosave` and export paths. Keep those calls.

**PiarHomePage.tsx changes:**
- In `handleStartNew`: after loading data successfully, the recovery slot is already consumed. No additional changes needed if `loadWithStatus()` now clears it.
- Remove any redundant `clearUnloadRecovery()` calls that are now handled by `loadWithStatus()`.

**Test additions:**
- Test that `loadWithStatus()` clears the unload-recovery slot after successful load from recovery
- Test that `loadWithStatus()` clears the unload-recovery slot after successful load from encrypted store (when recovery slot exists but encrypted is newer)
- Test that the recovery slot is empty after any successful `loadWithStatus()` call

---

## PR 10: Inline Field Validation

**Branch:** `improvement/inline-validation`
**Agent:** `pr10-inline-validation`
**Reality Check:** Not started; identity/header fields currently provide no inline validation feedback.

**Files:**
- Create: `src/features/piar/lib/forms/field-validation.ts`
- Create: `src/shared/ui/FieldHint.tsx`
- Modify: `src/features/piar/components/sections/identity/HeaderSection.tsx`
- Modify: `src/features/piar/components/sections/identity/StudentSection/IdentityFields.tsx`
- Create: `tests/features/piar/lib/forms/field-validation.test.ts`
- Create: `tests/shared/ui/FieldHint.test.tsx`

**Context:** There's no inline validation — all validation happens at import time via `parsePIARData`. For a form where users enter 100+ fields, inline feedback reduces errors. This is lightweight, non-blocking validation — hints appear below fields but never prevent form submission.

### Implementation Details

**field-validation.ts:**
- Export pure validation functions that return `string | null` (null = valid, string = hint message in Spanish):
  - `validateFecha(value: string): string | null` — checks `YYYY-MM-DD` or `DD/MM/YYYY` format
  - `validateNumericId(value: string): string | null` — checks that identificacion contains only digits
  - `validateNotEmpty(value: string, fieldLabel: string): string | null` — returns hint for key required fields
  - `validateAge(value: string): string | null` — checks reasonable age range (1-25 for students)
- All functions are pure, no side effects, no dependencies

**FieldHint.tsx:**
- Renders a small hint below a form field
- Props: `{ message: string | null }` — renders nothing when null
- Style: `text-xs text-on-surface-variant` for neutral hints, `text-xs text-error` for validation errors
- Use `aria-live="polite"` so screen readers announce hints

**Section changes (HeaderSection, IdentityFields):**
- Call validation functions on blur (not on every keystroke — reduces noise)
- Store hint state via `useState` per validated field
- Render `<FieldHint>` below the relevant `<Input>`
- Only validate fields where the user has typed something (don't show errors for untouched empty fields)

**Tests:**
- Test each validation function with valid/invalid inputs
- Test `FieldHint` renders nothing when message is null
- Test `FieldHint` renders message when provided
- Test that validation is accessible (aria-live region)
