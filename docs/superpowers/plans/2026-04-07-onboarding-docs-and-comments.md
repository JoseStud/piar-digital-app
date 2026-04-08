# Onboarding Documentation, Code Comments, and Encryption Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land a single PR on `codex-encrypt-local-draft-storage` that finishes the in-progress encryption work, adds heavy code comments across the source tree, boilerplates `docs/` (English) + `wiki/` (Spanish) + `.github/` files, and polishes `README.md` — structured as 6 sequenced commits.

**Architecture:** Six independent commits on the existing branch. Each commit is one *kind* of work so reviewers can read them in isolation. Commit 1 freezes the existing uncommitted encryption diff with comments layered on top; commits 2–6 add documentation only. No CI workflow, no behavior changes outside what's already in the working tree.

**Tech Stack:** Next.js 14 static export, React 18, TypeScript 5, Tailwind 3, pdf-lib, jszip, Vitest 2 + jsdom + RTL, Node 20–24, GPL-3.0-or-later.

---

## Reference: Comment style guide (used by Phase 1 and Phase 2)

Read this once before starting Phase 1. Every comment in this plan fits one of four shapes:

**1. File header (every source file).** Block comment at the top of the file, before imports:

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

**2. JSDoc on exported functions and types.** One sentence describing what it does. Add `@param` / `@returns` only when they aren't self-evident from TS types. **No JSDoc on internal helpers.**

**3. Inline `// why:` comments** inside complex functions. Litmus test: "would a competent React/TS developer read this line and ask 'why?'" If yes, comment. If no, don't.

**4. Section dividers in long files** (only in files >150 lines with genuinely distinct sub-areas):

```ts
// ─── Section Name ─────────────────────────────────────
```

**Anti-patterns (do NOT write these):**
- Comments restating type signatures
- Comments summarizing the next 5 lines of obvious code
- `@param` / `@returns` blocks that don't add information beyond the type
- Inline comments on leaf React components (file header only)
- History comments (`// was using X, switched to Y`)
- Author/date stamps
- Comments on test files except a one-line file header

---

## Phase 0 — Setup & baseline verification

### Task 0.1: Verify branch and working tree state

**Files:** none (verification only)

- [ ] **Step 1: Confirm branch and uncommitted state**

Run:
```bash
cd /home/anxiuser/architecture/apps/piar-digital-app
git status --short
git log --oneline -5
```

Expected output:
```
M src/features/piar/components/form/PIARForm/usePIARAutosave.ts
M src/features/piar/components/pdf/DownloadButton.tsx
M src/features/piar/lib/persistence/progress-crypto.ts
M src/features/piar/lib/persistence/progress-store.ts
M src/features/piar/screens/PiarHomePage.tsx
M tests/features/piar/components/form/PIARForm/usePIARAutosave.test.ts
M tests/features/piar/lib/persistence/progress-store.test.ts
M tests/test-utils/encrypted-progress-storage.ts
```

The most recent commit should be `docs: add onboarding documentation and comments implementation plan`. The commit before it should be `docs: add onboarding documentation and comments design spec`. The branch should be `codex-encrypt-local-draft-storage`.

If the working tree differs (extra modified files, missing files, wrong branch), STOP and report to the user — do not proceed.

### Task 0.2: Run baseline checks with the encryption diff in place

**Files:** none

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: zero errors (warnings OK; record their count for comparison later).

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: all tests pass. Record the total test count for comparison after each phase.

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: build succeeds, `out/` directory generated. (If this is slow, do it once here and skip it from per-phase verification — only run again at the final gate.)

- [ ] **Step 5: Note baseline state**

Write down: total test count, lint warning count. These are your "no regression" reference for the rest of the plan.

---

## Phase 1 — Commit 1: Encryption polish + comments

**Goal of this phase:** Take the existing 8-file uncommitted diff, layer comments on top of it (no behavior changes), and commit it as one clean commit.

**Files touched:**
- `src/features/piar/lib/persistence/progress-crypto.ts`
- `src/features/piar/lib/persistence/progress-store.ts`
- `src/features/piar/components/form/PIARForm/usePIARAutosave.ts`
- `src/features/piar/components/pdf/DownloadButton.tsx`
- `src/features/piar/screens/PiarHomePage.tsx`
- `tests/features/piar/components/form/PIARForm/usePIARAutosave.test.ts`
- `tests/features/piar/lib/persistence/progress-store.test.ts`
- `tests/test-utils/encrypted-progress-storage.ts`

### Task 1.1: Comment `progress-crypto.ts`

**Files:**
- Modify: `src/features/piar/lib/persistence/progress-crypto.ts`

- [ ] **Step 1: Read the file**

Run: read `src/features/piar/lib/persistence/progress-crypto.ts` end-to-end. Note the location of:
- The constants block (lines 1–7 currently)
- `ProgressCryptoError` class
- `getCryptoApi`
- `addStoredKey` (the race-handling function)
- `loadOrCreateDeviceKey`
- `getDeviceKey`
- `createDeviceKey`
- `encryptSerializedProgress` / `decryptSerializedProgress`

- [ ] **Step 2: Add file header (above line 1)**

Insert at the very top of the file, before the constants block:

```ts
/**
 * Web Crypto + IndexedDB plumbing for encrypted PIAR draft storage.
 *
 * Drafts are encrypted with AES-256-GCM using a non-extractable device key
 * generated once per browser profile and stored in IndexedDB. The key never
 * leaves the browser; it cannot be exported even by code running in this
 * origin (extractable: false). All public functions reject (do not throw
 * synchronously) and surface a typed `ProgressCryptoError` on failure so the
 * caller can map to user-facing Spanish messages.
 *
 * Threat model:
 * - PROTECTS against: casual reads of localStorage by other browser
 *   extensions or other OS users on the same machine.
 * - DOES NOT PROTECT against: malicious code running in this same origin,
 *   an attacker with full filesystem access to the user's IndexedDB,
 *   or a compromised browser.
 *
 * @see ./progress-store.ts — the localStorage wrapper that calls this module
 */
```

- [ ] **Step 3: Add inline comment on `PROGRESS_KEY_ID`**

Above the line `const PROGRESS_KEY_ID = 'piar-progress-device-key-v1';`, insert:

```ts
// why: string-with-version suffix instead of a numeric id so a future key
// rotation can introduce 'piar-progress-device-key-v2' alongside v1 without
// ambiguity in the IndexedDB store.
```

- [ ] **Step 4: Add inline comment on `extractable: false`**

Inside `createDeviceKey`, above the `cryptoApi.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])` call, insert:

```ts
// why: extractable=false is the entire reason an attacker with DOM access
// cannot dump the raw key bytes. Without this flag the in-origin threat
// model collapses — even though the key handle never leaves this module,
// SubtleCrypto.exportKey would otherwise be able to read it back.
```

- [ ] **Step 5: Add inline comment on `addStoredKey` race handling**

Inside `addStoredKey`, above the `if (isConstraintError(request.error))` branch in the `request.onerror` handler, insert:

```ts
// why: a second tab may have raced us to write the same PROGRESS_KEY_ID.
// IndexedDB raises ConstraintError; we swallow it and let the caller
// re-read the winning key. event.preventDefault() stops the abort from
// failing the whole transaction.
```

- [ ] **Step 6: Add inline comment on `loadOrCreateDeviceKey` re-read fallback**

Inside `loadOrCreateDeviceKey`, above the second `await readStoredKey(database)` call (the one labeled `winningStoredKey`), insert:

```ts
// why: if `addStoredKey` returned false the other tab won the write race;
// re-read so this tab uses the same key the winner persisted. If the
// re-read still finds nothing, that's an unrecoverable IDB inconsistency.
```

- [ ] **Step 7: Add inline comment on `deviceKeyPromise` reset**

Inside `getDeviceKey`, above the `.catch((error: unknown) => { deviceKeyPromise = null;` clause, insert:

```ts
// why: don't memoize the failure. If the first key load fails (e.g., IDB
// transiently unavailable), the next caller should get a fresh attempt
// instead of replaying the same rejected promise forever.
```

- [ ] **Step 8: Add JSDoc to exported functions**

Above `export class ProgressCryptoError`, insert:

```ts
/** Typed error surfaced by every public function in this module. */
```

Above `export function isEncryptedProgressEnvelope`, insert:

```ts
/**
 * Strict shape check for an encrypted draft envelope. Used as the gate
 * before attempting to decrypt; rejects anything that does not match the
 * exact storage version + algorithm + key id this module expects.
 */
```

Above `export function looksLikeEncryptedProgressEnvelope`, insert:

```ts
/**
 * Loose shape check that recognizes envelopes from any version of the
 * encrypted format. Used by the load path to distinguish "this is plainly
 * unencrypted data" from "this is a future-version encrypted envelope we
 * cannot read."
 */
```

Above `export async function encryptSerializedProgress`, insert:

```ts
/**
 * Encrypts an already-serialized progress JSON string. Generates a fresh
 * 96-bit IV per call (never reused), then base64-encodes both IV and
 * ciphertext for safe storage in localStorage.
 */
```

Above `export async function decryptSerializedProgress`, insert:

```ts
/**
 * Decrypts an envelope produced by `encryptSerializedProgress`. Returns
 * the original serialized progress JSON string. Throws
 * `ProgressCryptoError('decryption_failed')` if the envelope was tampered
 * with, the IV is wrong, or the wrong key is loaded.
 */
```

Above `export function resetProgressCryptoKeyCacheForTests`, insert:

```ts
/**
 * Test-only escape hatch: clears the in-memory device key cache so the
 * next call to `getDeviceKey` re-reads from IndexedDB. Used by tests that
 * simulate a fresh tab.
 */
```

- [ ] **Step 9: Verify the file still type-checks**

Run: `npm run typecheck`
Expected: zero errors. If errors appear, you have a syntax mistake in a comment block — fix and re-run.

### Task 1.2: Comment `progress-store.ts`

**Files:**
- Modify: `src/features/piar/lib/persistence/progress-store.ts`

- [ ] **Step 1: Read the file**

Note the location of: `STORAGE_KEY` and `UNLOAD_RECOVERY_STORAGE_KEY` constants, the type aliases for error codes, `buildVersionedData`, `isUnloadRecoveryEnvelope`, `buildStorageFailureMessage`, `readUnloadRecoveryWithStatus`, and the `ProgressStore` object literal at the bottom.

- [ ] **Step 2: Add file header**

Insert at the very top of the file:

```ts
/**
 * localStorage wrapper for PIAR draft persistence.
 *
 * Drafts are stored encrypted (AES-256-GCM, see ./progress-crypto). A
 * second unencrypted "unload recovery" slot exists because Web Crypto +
 * IndexedDB cannot be awaited reliably during `pagehide` — the recovery
 * slot is written synchronously when the page is about to die and is
 * cleared as soon as the encrypted save catches up. All public methods
 * return result objects rather than throwing, so callers never need
 * try/catch to surface a Spanish error notice to the user.
 *
 * The load path checks the unload-recovery slot FIRST so a recent
 * unload's plaintext-but-fresh data wins over an older encrypted save.
 *
 * @see ./progress-crypto.ts
 * @see ../../components/form/PIARForm/usePIARAutosave.ts
 */
```

- [ ] **Step 3: Add JSDoc to the exported error code unions**

Above `export type ProgressStoreSaveErrorCode`, insert:

```ts
/**
 * Every failure mode `ProgressStore.save` can return. The string codes
 * are stable — log them, switch on them, and translate them via
 * `buildStorageFailureMessage`. Do not parse the message string.
 */
```

Above `export type ProgressStoreLoadErrorCode`, insert:

```ts
/**
 * Every failure mode `ProgressStore.loadWithStatus` can return.
 * `not_found` is the normal "first visit" case and should usually be
 * treated as success-with-no-data, not as an error to surface.
 */
```

- [ ] **Step 4: Add inline comment on the unload-recovery-first ordering**

Inside `loadWithStatus`, above the `const unloadRecovery = readUnloadRecoveryWithStatus();` line, insert:

```ts
// why: check unload recovery FIRST. If the user closed the tab during a
// save, the recovery slot has the freshest data (written synchronously
// during pagehide) and the encrypted slot may still hold the previous
// snapshot. Recovery wins until `usePIARAutosave` clears it after a
// successful encrypted save catches up.
```

- [ ] **Step 5: Add inline comment on the `unencrypted_data` branch**

Inside `loadWithStatus`, above the `if (!isEncryptedProgressEnvelope(parsedJson))` block, insert:

```ts
// why: anything in the encrypted slot that is not a valid encrypted
// envelope is rejected. Pre-encryption drafts (from before this branch
// shipped) land here and surface as `unencrypted_data` — there is no
// silent migration path; the user gets a clear error and can export a
// backup before clearing.
```

- [ ] **Step 6: Add inline comment on the unload-recovery `savedAt` field**

Above the `interface UnloadRecoveryEnvelope` declaration, insert:

```ts
// The unload recovery slot has no max age. If the user closes their
// browser at midnight and reopens it three weeks later, this code will
// happily restore the three-week-old plaintext copy. That is intentional:
// the data is still the user's own work, and aging it out would risk
// silently dropping recoverable progress on flaky shutdowns. The slot is
// cleared as soon as the encrypted save catches up.
```

- [ ] **Step 7: Add inline comment on `saveUnloadRecovery`**

Inside `saveUnloadRecovery`, above the existing comment block, replace the existing two-line comment with:

```ts
// why: Web Crypto + IndexedDB cannot be awaited inside a `pagehide`
// handler — the page may die before the promise resolves. We write a
// SYNCHRONOUS plaintext copy here as a safety net, then queue the real
// encrypted save in the background. If the encrypted save completes,
// `clearUnloadRecovery` runs and this slot disappears. If it doesn't,
// the next session restores from this slot.
```

- [ ] **Step 8: Add JSDoc to the `ProgressStore` methods**

Above `async save(data: PIARFormDataV2): Promise<ProgressStoreSaveResult>`, insert:

```ts
    /**
     * Encrypts and persists the form data to localStorage. Returns
     * `{ ok: true }` on success or a typed failure code on every failure
     * path. Never throws — even quota errors and crypto unavailability
     * surface as result codes the caller can branch on.
     */
```

Above `saveUnloadRecovery(data: PIARFormDataV2): ProgressStoreSaveResult`, insert:

```ts
    /**
     * Synchronous unload safety net. Writes a plaintext copy of the form
     * data to a separate localStorage slot so a `pagehide` handler can
     * persist progress even when Web Crypto cannot be awaited. Cleared
     * automatically once the next encrypted save succeeds.
     */
```

Above `async load(): Promise<PIARFormDataV2 | null>`, insert:

```ts
    /**
     * Convenience wrapper around `loadWithStatus` that drops the
     * warnings array and any failure detail. Returns `null` on every
     * failure path including `not_found`. Prefer `loadWithStatus` if you
     * need to distinguish "no draft" from "draft is corrupted."
     */
```

Above `async loadWithStatus(): Promise<ProgressStoreLoadResult>`, insert:

```ts
    /**
     * Full-detail load: tries the unload-recovery slot first, falls back
     * to the encrypted slot, decrypts, and runs the data through
     * `parsePIARData` for shape validation. Returns warnings about any
     * fields that had to be repaired during the merge so the UI can
     * surface a "we corrected N values" notice.
     */
```

Above `clear(): void`, insert:

```ts
    /** Wipes both the encrypted and unload-recovery slots. */
```

Above `clearUnloadRecovery(): void`, insert:

```ts
    /**
     * Wipes only the unload-recovery slot. Called by `usePIARAutosave`
     * after a successful encrypted save to drop the now-redundant
     * plaintext copy.
     */
```

Above `hasSavedData(): boolean`, insert:

```ts
    /**
     * Cheap check used by the start screen to decide whether to offer
     * the "Restaurar progreso" prompt. Returns true if EITHER slot has
     * data — does not attempt to decrypt or validate.
     */
```

- [ ] **Step 9: Add inline comment about error code passthrough in `DownloadButton` and `PiarHomePage`**

Inside `buildStorageFailureMessage`, above the `switch (code)` line, insert:

```ts
// Every code in both ProgressStoreSaveErrorCode and
// ProgressStoreLoadErrorCode has a Spanish message here. Callers like
// PiarHomePage.saveWithNotice and DownloadButton.runDownload simply
// surface result.message — they do NOT need to branch on the code,
// because every code is already mapped to user-facing copy.
```

- [ ] **Step 10: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 1.3: Comment `usePIARAutosave.ts`

**Files:**
- Modify: `src/features/piar/components/form/PIARForm/usePIARAutosave.ts`

- [ ] **Step 1: Read the file**

Note: the four refs (`dataRef`, `debounceRef`, `dirtyRef`, `dirtyVersionRef`, `saveQueueRef`), the `flushSave` callback, the `scheduleSave` callback, and the two `useEffect` hooks (data-tracker and unload-handler).

- [ ] **Step 2: Add file header**

Insert at the very top:

```ts
/**
 * Autosave hook for the PIAR form.
 *
 * Strategy: every change to `data` marks the form dirty, schedules a
 * 500ms-debounced encrypted save, and bumps a version counter. Saves are
 * serialized through a promise queue so concurrent encrypts cannot race;
 * each in-flight save checks the version counter on completion and skips
 * its "saved" transition if a fresher edit has happened since it started.
 *
 * On `pagehide` and `visibilitychange→hidden` we write a synchronous
 * plaintext recovery copy via `ProgressStore.saveUnloadRecovery` BEFORE
 * queueing the encrypted save, because the page may die before the
 * encrypted save resolves. The recovery slot is cleared as soon as the
 * encrypted save catches up.
 *
 * @see ../../../lib/persistence/progress-store.ts
 * @see ../../../lib/persistence/progress-crypto.ts
 */
```

- [ ] **Step 3: Add inline comment on `dirtyVersionRef`**

Above the line `const dirtyVersionRef = useRef(0);`, insert:

```ts
  // why: monotonically increases on every edit. Each in-flight save
  // captures the version it intends to persist; if a newer edit has
  // happened by the time the save resolves, the in-flight save's
  // "saved" state transition is suppressed because it would falsely
  // mark the form clean.
```

- [ ] **Step 4: Add inline comment on `saveQueueRef`**

Above the line `const saveQueueRef = useRef<Promise<void>>(Promise.resolve());`, insert:

```ts
  // why: serializes encrypted saves through a chained promise so two
  // saves cannot race the encryption pipeline. Without this, two
  // back-to-back edits could trigger two parallel `subtle.encrypt`
  // calls and the second-to-finish would overwrite the first.
```

- [ ] **Step 5: Add inline comment on the version check inside `runSave`**

Inside `runSave`, above the `if (dirtyVersionRef.current !== versionToSave)` line, insert:

```ts
      // why: a fresh edit may have happened while encrypt was in flight;
      // if so, the new edit's scheduled save owns the dirty flag, not us.
      // Returning here without clearing dirtyRef lets the newer save
      // produce the final "saved" transition.
```

- [ ] **Step 6: Add inline comment on the unload handler ordering**

Inside the second `useEffect` (the one that registers `pagehide`), above `const handlePageHide = () =>`, insert:

```ts
    // why: the unload handler writes the unload-recovery slot
    // SYNCHRONOUSLY (via flushSave({ unloadRecovery: true })) before
    // queueing the encrypted save, because the encrypted save involves
    // Web Crypto + IndexedDB and may not finish before the page dies.
    // visibilitychange→hidden uses the same path because mobile Safari
    // fires it instead of pagehide on tab switches.
```

- [ ] **Step 7: Add inline comment on `flushSave` cleanup-on-unmount**

Inside the cleanup return of the unload-handler `useEffect`, above the `flushSave();` call, insert:

```ts
      // why: on unmount, flush any pending debounced save synchronously.
      // We do NOT pass `unloadRecovery: true` here because unmount is
      // not a page-death scenario — the encrypted save will complete
      // normally inside the queued promise.
```

- [ ] **Step 8: Add JSDoc to the exported hook**

Above `export function usePIARAutosave`, insert:

```ts
/**
 * React hook that auto-saves PIAR form data to encrypted localStorage.
 *
 * Returns a save indicator state, the latest failure message (or null),
 * and a `retrySave` function that flushes immediately. The save state
 * starts in `idle`, transitions to `saving` on the first edit, and
 * resolves to either `saved` or `failed` once the in-flight save
 * completes.
 */
```

- [ ] **Step 9: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 1.4: Comment `DownloadButton.tsx`

**Files:**
- Modify: `src/features/piar/components/pdf/DownloadButton.tsx`

- [ ] **Step 1: Add file header**

Insert at the very top of the file (above `'use client';`):

```tsx
/**
 * Two-button export control for PIAR drafts (DOCX editable + PDF).
 *
 * Saves the current form to encrypted localStorage immediately before
 * generating the export so the freshest state is in storage when the
 * download dialog opens. Surfaces a Spanish error notice if the save
 * fails — the export still proceeds because the in-memory snapshot is
 * authoritative for the file content. Owns two confirm dialogs: a
 * one-time PDF round-trip caveat and a missing-context warning when
 * student name + institución are blank.
 *
 * @see ../../lib/portable/download.ts
 * @see ../../lib/persistence/progress-store.ts
 */
```

- [ ] **Step 2: Add inline comment in `runDownload` near the failed-save branch**

Inside `runDownload`, above the `if (!saveResult.ok)` line, insert:

```tsx
      // why: ProgressStore.save's `result.message` is already a Spanish
      // user-facing string covering every save error code (including
      // crypto_unavailable, key_unavailable, encryption_failed). We do
      // not branch on result.code here — the message is sufficient.
      // Export still proceeds because the in-memory data is the source
      // of truth for the generated file.
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 1.5: Comment `PiarHomePage.tsx`

**Files:**
- Modify: `src/features/piar/screens/PiarHomePage.tsx`

- [ ] **Step 1: Add file header**

Insert at the very top of the file (above `'use client';`):

```tsx
/**
 * Workflow root for the `/diligenciar` route.
 *
 * Owns the three-mode state machine: `start` (landing/upload), `restore-prompt`
 * (saved-draft confirmation), `form` (the long-form editor). Holds the
 * canonical PIARFormDataV2 in state, mirrors it through `formDataRef` so
 * unload-time flushes can read the latest data without re-rendering, and
 * lazy-loads the heavy `FormWorkspace` chunk only when transitioning into
 * `form` mode. Surfaces save failures and import-correction notices as
 * banner notices for the form workspace to display.
 *
 * @see ./AppStartScreen.tsx
 * @see ./FormWorkspace.tsx
 * @see ../lib/persistence/progress-store.ts
 */
```

- [ ] **Step 2: Add inline comment in `saveWithNotice`**

Inside `saveWithNotice`, above the `if (!result.ok)` line, insert:

```tsx
    // why: ProgressStore.save returns Spanish messages for every error
    // code via buildStorageFailureMessage, so we surface result.message
    // unchanged. We do NOT branch on result.code — every failure mode
    // is already user-readable.
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 1.6: Add headers to the encryption test files

**Files:**
- Modify: `tests/features/piar/components/form/PIARForm/usePIARAutosave.test.ts`
- Modify: `tests/features/piar/lib/persistence/progress-store.test.ts`
- Modify: `tests/test-utils/encrypted-progress-storage.ts`

- [ ] **Step 1: Add header to `usePIARAutosave.test.ts`**

Insert at the very top:

```ts
/** Tests for the PIAR autosave hook: debounce, dirty tracking, encrypted save queue, and pagehide unload-recovery flush. */
```

- [ ] **Step 2: Add header to `progress-store.test.ts`**

Insert at the very top:

```ts
/** Tests for ProgressStore: encrypted V2 round-trip, unsupported version handling, unload-recovery slot precedence, and concurrent device-key creation. */
```

- [ ] **Step 3: Add longer header to `encrypted-progress-storage.ts`**

Insert at the very top:

```ts
/**
 * Test-only mocks for IndexedDB and Web Crypto used by the encrypted
 * progress store tests.
 *
 * Implements just enough of `IDBFactory`, `IDBDatabase`,
 * `IDBObjectStore`, and `IDBTransaction` to back the device-key store,
 * plus a deterministic `crypto.subtle` shim that round-trips through
 * Node's `webcrypto` global. Tests call
 * `installEncryptedProgressStorageMocks()` in `beforeEach` to install
 * fresh state and `resetProgressCryptoKeyCacheForTests()` to clear the
 * in-memory device-key cache between cases.
 *
 * The mock supports the `add` operation's ConstraintError path because
 * the production code uses it for two-tab race handling — see
 * `addStoredKey` in `progress-crypto.ts`.
 */
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 1.7: Run full test suite to confirm no regressions

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: zero errors. Warning count should match baseline from Task 0.2.

- [ ] **Step 3: Run all tests**

Run: `npm test`
Expected: all tests pass; total count matches baseline. The encryption tests in particular should still pass (they were testing behavior, not comments).

If any test fails, do not proceed. Diagnose the failure (most likely a syntax error in a comment block dropped a needed token). Fix and re-run.

### Task 1.8: Commit Phase 1

- [ ] **Step 1: Stage the 8 files**

Run:
```bash
git add \
  src/features/piar/lib/persistence/progress-crypto.ts \
  src/features/piar/lib/persistence/progress-store.ts \
  src/features/piar/components/form/PIARForm/usePIARAutosave.ts \
  src/features/piar/components/pdf/DownloadButton.tsx \
  src/features/piar/screens/PiarHomePage.tsx \
  tests/features/piar/components/form/PIARForm/usePIARAutosave.test.ts \
  tests/features/piar/lib/persistence/progress-store.test.ts \
  tests/test-utils/encrypted-progress-storage.ts
```

- [ ] **Step 2: Verify only those files are staged**

Run: `git status --short`
Expected: 8 lines starting with `M ` (or `A ` if a file was new), no other staged changes.

- [ ] **Step 3: Commit**

Run:
```bash
git commit -m "$(cat <<'EOF'
feat(persistence): encrypt local drafts and document the design

Encrypts PIAR draft autosaves with AES-256-GCM using a non-extractable
device key persisted in IndexedDB. Adds a synchronous unencrypted
unload-recovery slot in localStorage so pagehide handlers can persist
progress even when Web Crypto cannot be awaited; the recovery slot is
cleared as soon as the encrypted save catches up.

Includes file headers, JSDoc on every exported function, and inline
`why:` comments on the non-obvious bits (the addStoredKey race
handling, the dirty-version comparison in the autosave queue, the
load-path ordering that prefers the unload-recovery slot, and the
extractable=false rationale).

Threat model is documented at the top of progress-crypto.ts.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

Expected: commit succeeds. If a pre-commit hook runs and fails, fix the failure and create a NEW commit (do not amend).

- [ ] **Step 4: Verify**

Run: `git log --oneline -3 && git status --short`
Expected: the new commit is at HEAD, working tree is clean.

---

## Phase 2 — Commit 2: Architecture comments

**Goal of this phase:** Add file headers, JSDoc on exported APIs, and inline `why:` comments across the source tree. ~120 source files + 41 test files (the 3 test files in Phase 1 are already done).

**Strategy:** Tasks 2.1–2.18 group files by directory. Files that need *judgment* about what the comments should say get individual sub-steps with the exact header text. Files that just need a one-line file header are listed in tables — the implementer iterates the table and adds each header verbatim.

**Cross-cutting rules for this phase:**
- Every source file gets at least a file header
- JSDoc only on exported functions/types where it adds information beyond the type signature
- Inline `// why:` comments only at non-obvious decision points
- Test files get a one-line header only — never inline comments
- No behavior changes whatsoever — if you find yourself wanting to "fix" something, leave it; comment additions only

### Task 2.1: Comment the data model and content files

**Files:**
- Modify: `src/features/piar/model/piar.ts`
- Modify: `src/features/piar/model/section-list.ts`
- Modify: `src/features/piar/content/assessment-catalogs.ts`
- Modify: `src/features/piar/content/guidance.ts`
- Modify: `src/features/piar/content/site-branding.ts`

- [ ] **Step 1: Add header to `model/piar.ts`**

Insert at the very top:

```ts
/**
 * The single source of truth for PIAR form data shape and version.
 *
 * `PIARFormDataV2` is the canonical root type. Every persistence layer,
 * importer, exporter, and form section reads and writes this shape.
 * `PIAR_DATA_VERSION = 2` is the version number that ships in storage
 * envelopes and DOCX/PDF embedded payloads — bump it ONLY for breaking
 * changes (removing or re-typing a field). Additive changes (new
 * optional fields with defaults) do not require a version bump but
 * MUST be defaulted in `createEmptyPIARFormDataV2` and handled by
 * `deepMergeWithDefaultsV2` in `lib/data/data-utils/`.
 *
 * Boolean tri-state fields (`true` / `false` / `null`) are pervasive:
 * `null` means "sin respuesta" and is the default. Do not coerce nulls
 * to false anywhere in the data model.
 *
 * Fixed-length tuple fields (e.g. `ajustes: [_,_,_,_,_]`,
 * `firmas.docentes[9]`) must always be assigned as full tuples, never
 * as variable-length arrays.
 *
 * @see ../lib/data/data-utils/deepMergeWithDefaultsV2.ts
 * @see ../lib/data/data-utils/sectionMergers.ts
 * @see ../content/assessment-catalogs.ts
 */
```

- [ ] **Step 2: Add JSDoc on every exported type and the factory in `model/piar.ts`**

For each exported `interface`, `type`, or `const`, add a one-sentence JSDoc above it. Examples:

Above `export const PIAR_DATA_VERSION`:
```ts
/** Authoritative version number stamped onto every persisted envelope. Bump only on breaking changes. */
```

Above `export interface PIARFormDataV2`:
```ts
/** Root type for the entire PIAR form. All section types nest under this. */
```

Above `export interface HeaderV2`:
```ts
/** Top-of-form metadata: fecha, lugar, persona que diligencia, rol, institución, sede, jornada. */
```

Above `export interface StudentV2`:
```ts
/** Student identity, demographics, tri-state condition flags, and the six narrative description sub-fields. */
```

Above `export interface EntornoSaludData`:
```ts
/** Health environment: afiliación, diagnóstico, support row tuples (3+3+2 fixed-length), assistive technology selections. */
```

Above `export interface EntornoHogarData`:
```ts
/** Home environment: madre/padre/cuidador flat fields plus household composition. */
```

Above `export interface EntornoEducativoData`:
```ts
/** Educational environment: prior schooling history, prior pedagogical reports, programs the student participates in. */
```

Above `export interface ValoracionPedagogicaData`:
```ts
/** Five assessment "aspectos", each with a respuestas record (item id → tri-state), an intensidad selection, and a free-text observación. */
```

Above `export interface CompetenciasDispositivosData`:
```ts
/** Eight checklist groups (motricidad, memoria, lenguaje, …) with ~85 total items mapping item id → tri-state. */
```

Above `export interface AjusteRazonableRow`:
```ts
/** One row of the reasonable-adjustments table: area, barreras, tipoAjuste, apoyoRequerido, descripción, seguimiento. */
```

Above `export interface FirmasV2`:
```ts
/** Signature block: nine docente entries (fixed tuple), three role objects (orientador/coordinador/rector), two free-text signatories. */
```

Above `export interface ActaAcuerdoData`:
```ts
/** Final agreement minutes: header repeat, student summary, compromisos, five activity rows (fixed tuple), four signature strings. */
```

Above `export function createEmptyPIARFormDataV2`:
```ts
/**
 * Factory for a fresh, fully-populated empty form. Every field is
 * defaulted; tri-state booleans default to `null`; fixed-length tuples
 * are pre-allocated. Used by the start screen, by the import-correction
 * fallback, and by `deepMergeWithDefaultsV2` to fill in missing fields
 * during partial imports.
 */
```

(Add similar one-sentence JSDoc to any other exported types in the file. The pattern is: name the section, name the key shape detail.)

- [ ] **Step 3: Add header to `model/section-list.ts`**

Read the file first to understand what it exports. Insert at the top:

```ts
/**
 * Ordered list of form sections used by the navigation/progress UI to
 * render a sidebar and to compute scroll-spy active state. Adding a new
 * section to the form means adding an entry here so the nav picks it up.
 */
```

Add a one-sentence JSDoc above each exported constant or type.

- [ ] **Step 4: Add header to `content/assessment-catalogs.ts`**

Insert at the very top:

```ts
/**
 * Stable item catalogs for the assessment sections (Valoración
 * Pedagógica + Competencias y Dispositivos).
 *
 * IMMUTABILITY CONTRACT: every item id (e.g. `mov_1`, `mem_3`,
 * `len_10`) is permanent. Changing an id breaks every saved draft and
 * every previously exported PIAR DOCX/PDF. New items can be added at
 * the end of a group; existing items must NEVER be renamed, reordered
 * (in storage terms), or deleted. If an item becomes obsolete, mark it
 * `deprecated` in metadata but keep the id present so old data still
 * deserializes.
 *
 * `VALORACION_ASPECTOS` defines 5 aspects with 14 questions total.
 * `COMPETENCIAS_GRUPOS` defines 8 groups with ~87 items, each with an
 * optional `hasObservaciones` flag.
 */
```

Add a one-sentence JSDoc above each exported constant.

- [ ] **Step 5: Add header to `content/guidance.ts`**

Read the file. Insert at the top:

```ts
/**
 * Spanish help-text strings shown next to form sections. Decoupled from
 * the section components so copy can be edited without touching layout.
 */
```

- [ ] **Step 6: Add header to `content/site-branding.ts`**

Read the file. Insert at the top:

```ts
/**
 * Branding constants (site name, contact email, slogan). Read by the
 * marketing landing page and by the workflow page footer. Keep changes
 * here in sync with `next.config.js` env-var defaults.
 */
```

- [ ] **Step 7: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.2: Comment the persistence layer (already done in Phase 1 — skip)

Phase 1 already commented `progress-crypto.ts` and `progress-store.ts`. Confirm by:

- [ ] **Step 1: Spot-check**

Verify both files start with the file header block from Phase 1. If they do not, return to Phase 1.

### Task 2.3: Comment the data-utils directory

**Files:**
- Modify: `src/features/piar/lib/data/data-utils/deepMergeWithDefaultsV2.ts`
- Modify: `src/features/piar/lib/data/data-utils/legacyFallbacks.ts`
- Modify: `src/features/piar/lib/data/data-utils/sectionMergers.ts`
- Modify: `src/features/piar/lib/data/data-utils/mergeHelpers.ts`
- Modify: `src/features/piar/lib/data/data-utils/index.ts`
- Modify: `src/features/piar/lib/data/unwrapEnvelope.ts`

- [ ] **Step 1: Header for `deepMergeWithDefaultsV2.ts`**

Insert at the top:

```ts
/**
 * Merges arbitrary partial PIAR data with the V2 default shape.
 *
 * Used by every importer (PDF, DOCX, localStorage envelope) to ensure
 * the data handed to React state has the full PIARFormDataV2 shape,
 * regardless of which fields were present in the source. Missing
 * fields fall back to `createEmptyPIARFormDataV2` defaults; present
 * fields with the right type are preserved verbatim; present fields
 * with the wrong type are dropped and the slot is defaulted (the
 * caller surfaces this as a "we corrected N values" warning).
 *
 * @see ./sectionMergers.ts — per-section merge logic with legacy fallbacks
 * @see ../../portable/piar-import.ts — the main caller
 */
```

Add JSDoc above the exported function explaining what it returns and noting the warning array.

- [ ] **Step 2: Header for `legacyFallbacks.ts`**

Insert at the top:

```ts
/**
 * Helpers for converting legacy field shapes into V2 shapes.
 *
 * Examples: `splitLegacyStudentName` parses an old free-text "Nombre
 * completo" into `{ nombres, apellidos }`. These helpers exist because
 * the V1→V2 boundary was not a clean break — early V2 shipped some
 * code paths that wrote V1-shaped data, and importers must repair them
 * silently rather than reject the file.
 */
```

Add a one-line JSDoc above each exported helper.

- [ ] **Step 3: Header for `sectionMergers.ts`**

Insert at the top:

```ts
/**
 * Per-section merge functions that combine partial imported data with
 * defaults, applying legacy field fallbacks where needed.
 *
 * Each `mergeXxxWithLegacyFallback` function takes the imported partial
 * and the default-shape full section and returns the merged result.
 * The legacy fallback layer is what lets older PIAR files (and the few
 * shipped V1.5 stragglers) round-trip cleanly.
 *
 * @see ./legacyFallbacks.ts
 */
```

Add a one-sentence JSDoc above each exported merge function. Above the exported `mergeHeaderWithLegacyFallback` add an inline `// why:` note explaining that the legacy "Persona que diligencia" → V2 "personaQueDiligencia" rename is handled here, not in the V1 migrator.

- [ ] **Step 4: Header for `mergeHelpers.ts`**

Read the file. Insert a 2–4 line header naming what the helpers do (likely small predicate/picker utilities used by `sectionMergers`).

- [ ] **Step 5: Header for `data-utils/index.ts`**

Insert:

```ts
/** Barrel exports for the data-utils module. */
```

- [ ] **Step 6: Header for `unwrapEnvelope.ts`**

Read the file. Insert a header explaining what envelope shape it unwraps and where the result goes. Likely:

```ts
/**
 * Unwraps a `{ v, data }` versioned envelope down to the inner data.
 * Returns null if the envelope is missing the version or has an
 * unsupported version. Used as the first step of every importer before
 * the data hits `parsePIARData`.
 */
```

- [ ] **Step 7: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.4: Comment the portable (envelope validator) directory

**Files:**
- Modify: `src/features/piar/lib/portable/piar-import.ts`
- Modify: `src/features/piar/lib/portable/download.ts`
- Modify: `src/features/piar/lib/portable/format.ts`

- [ ] **Step 1: Header for `piar-import.ts`**

Insert at the top:

```ts
/**
 * Shared envelope validator used by every PIAR importer (PDF, DOCX,
 * localStorage). Routes valid V2 envelopes through
 * `deepMergeWithDefaultsV2` and returns the merged result with a
 * warnings array; rejects future-version envelopes with the
 * `unsupported_version` code.
 *
 * @see ../data/data-utils/deepMergeWithDefaultsV2.ts
 * @see ../pdf/pdf-importer.ts
 * @see ../docx/docx-importer.ts
 * @see ../persistence/progress-store.ts
 */
```

Add JSDoc above `parsePIARData` and the exported `PIARImportSuccess` / `PIARImportWarning` types.

- [ ] **Step 2: Header for `download.ts`**

Insert at the top:

```ts
/**
 * Lazy-loaded entry point for "save the PIAR as DOCX or PDF" downloads.
 *
 * Code-split on purpose: the heavy `pdf-lib` and `jszip` modules are
 * not loaded until the user clicks Generate. The `downloadPIARPortableFile`
 * function dispatches to the format-specific generator and surfaces a
 * native save dialog when running inside the Tauri shell.
 *
 * @see ../pdf/pdf-generator/index.ts
 * @see ../docx/docx-generator.ts
 * @see ../../../shared/lib/save-file.ts
 */
```

Add JSDoc above the exported `downloadPIARPortableFile` function.

- [ ] **Step 3: Header for `format.ts`**

Insert at the top:

```ts
/** Type-only definitions for portable export formats (the `'pdf' | 'docx'` union and friends). */
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.5: Comment the PDF generator directory

**Files:**
- Modify: `src/features/piar/lib/pdf/pdf-generator/index.ts`
- Modify: `src/features/piar/lib/pdf/pdf-generator/types.ts`
- Modify: `src/features/piar/lib/pdf/pdf-generator/formatters.ts`
- Modify: `src/features/piar/lib/pdf/pdf-generator/identity.ts`
- Modify: `src/features/piar/lib/pdf/pdf-generator/environments.ts`
- Modify: `src/features/piar/lib/pdf/pdf-generator/assessment.ts`
- Modify: `src/features/piar/lib/pdf/pdf-generator/planning.ts`
- Modify: `src/features/piar/lib/pdf/pdf-generator/tableRenderer.ts`
- Modify: `src/features/piar/lib/pdf/pdf-generator/assembleDocument.ts`

- [ ] **Step 1: Header for `index.ts`**

Insert:

```ts
/**
 * Public entry point for the from-scratch PIAR PDF generator.
 *
 * Calls `assembleDocument` to draw every section, embeds the source
 * form data as JSON in the hidden `piar_app_state` field for round-trip
 * support, and returns the resulting PDF bytes. Re-importing the
 * generated file restores the exact form state.
 *
 * @see ./assembleDocument.ts — the page assembly orchestrator
 * @see ../pdf-importer.ts — the round-trip companion
 * @see ../pdf-payload.ts — the hidden-field embedding constants
 */
```

Add JSDoc above the exported `generatePIARPdf` function.

- [ ] **Step 2: Header for `types.ts`**

Insert:

```ts
/** Internal type definitions used by the PDF generator modules (page state, layout context, table cell shapes). */
```

- [ ] **Step 3: Header for `formatters.ts`**

Insert:

```ts
/**
 * Spanish-locale value formatters used by every PDF section.
 *
 * Examples: tri-state booleans → "Sí" / "No" / "Sin respuesta",
 * date strings → DD/MM/YYYY, blank-or-missing → an em-dash. Keep these
 * pure (no I/O, no React) so the same formatters can be reused by the
 * DOCX generator if needed.
 */
```

Add a one-sentence JSDoc above each exported formatter.

- [ ] **Step 4: Header for `identity.ts`**

Insert:

```ts
/**
 * Renders the identity sections (HeaderV2 + StudentV2) onto a PDF page.
 * Reads from PIARFormDataV2.header and .student, writes to the active
 * page, and returns the next vertical cursor position.
 */
```

- [ ] **Step 5: Header for `environments.ts`**

Insert:

```ts
/**
 * Renders the three environment sections (entornoSalud, entornoHogar,
 * entornoEducativo) onto PDF pages. Uses `tableRenderer` for the salud
 * row tuples and free-text rendering for the rest.
 */
```

- [ ] **Step 6: Header for `assessment.ts`**

Insert:

```ts
/**
 * Renders the pedagogical valoración (5 aspectos) and the competencias
 * y dispositivos checklist (8 groups, ~87 items) onto PDF pages. Pulls
 * item labels from `content/assessment-catalogs` so storage ids round-trip
 * cleanly.
 *
 * @see ../../../content/assessment-catalogs.ts
 */
```

- [ ] **Step 7: Header for `planning.ts`**

Insert:

```ts
/**
 * Renders the planning sections (ajustes razonables table, signatures
 * block, acta de acuerdo) onto PDF pages. Handles fixed-length tuple
 * iteration (5 ajustes rows, 9 docente signatures, 5 actividad rows).
 */
```

- [ ] **Step 8: Header and inline comments for `tableRenderer.ts`**

Insert at the top:

```ts
/**
 * Generic table-drawing primitive used by every PDF section.
 *
 * Handles cell text wrapping, row height calculation, page-break
 * detection, and header repetition. The text-wrapping algorithm is
 * deliberate-but-non-obvious: see the inline `why:` comments inside.
 *
 * @see ../pdf-table-helpers.ts — width/wrap helpers shared with importer
 */
```

Read the file. Find the function that calculates row height across page breaks. Above the page-break check, insert:

```ts
// why: a row may be taller than the remaining page height. We measure
// the row's wrapped height first, then decide whether to flush the
// current page and start the row on a fresh page (re-rendering the
// header row at the top). The split-row case (row taller than a full
// page) is intentionally NOT handled — assume content fits.
```

Find the text wrapping function. Above the word-by-word loop, insert:

```ts
// why: pdf-lib has no built-in word wrap. We measure each candidate
// substring's width with widthOfTextAtSize and break on the last
// whitespace before the column overflows. Hyphenation is not attempted;
// extremely long unbroken tokens overflow the cell rather than
// breaking mid-word.
```

- [ ] **Step 9: Header and inline comments for `assembleDocument.ts`**

Insert at the top:

```ts
/**
 * Page-by-page assembly of the full PIAR PDF.
 *
 * Sequences calls to identity → environments → assessment → planning,
 * tracks the cursor between sections, and embeds the hidden
 * `piar_app_state` payload at the end via `pdf-payload`. The order of
 * sections matches the printed government form.
 *
 * @see ../pdf-payload.ts
 */
```

Find the place where `piar_app_state` is embedded. Above that line, insert:

```ts
// why: embedding happens AFTER all visible drawing so the embedded
// payload's byte position is stable and predictable for the importer.
// The payload uses a hidden form field rather than a metadata
// attribute because hidden fields survive every PDF reader's "Save As"
// flow that we have tested.
```

- [ ] **Step 10: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.6: Comment the PDF importer and helpers

**Files:**
- Modify: `src/features/piar/lib/pdf/pdf-importer.ts`
- Modify: `src/features/piar/lib/pdf/pdf-payload.ts`
- Modify: `src/features/piar/lib/pdf/pdf-table-helpers.ts`

- [ ] **Step 1: Header for `pdf-importer.ts`**

Insert at the top:

```ts
/**
 * Extracts PIAR form data from the hidden `piar_app_state` field of a
 * PDF generated by this app.
 *
 * Version-aware: rejects non-V2 envelopes with `unsupported_version`,
 * routes V2 through `parsePIARData` → `deepMergeWithDefaultsV2`, and
 * always returns a fully-populated `PIARFormDataV2` on success. Reading
 * a hand-edited PDF that was opened in another reader and re-saved is
 * supported as long as the hidden field survives the round-trip.
 *
 * @see ./pdf-payload.ts
 * @see ../portable/piar-import.ts
 */
```

Add JSDoc above the exported `importPIARPdf` function naming the success and failure result types.

- [ ] **Step 2: Header for `pdf-payload.ts`**

Insert at the top:

```ts
/**
 * Constants and helpers for embedding/extracting the hidden
 * `piar_app_state` field used by both `pdf-generator` and
 * `pdf-importer`. Single source of truth for the field name, the
 * envelope shape, and the encoding (utf-8 JSON).
 */
```

Add JSDoc above each exported constant or helper.

- [ ] **Step 3: Header for `pdf-table-helpers.ts`**

Insert at the top:

```ts
/**
 * Layout constants and text-wrapping helpers shared by the PDF
 * generator's table renderer. `PDF_LAYOUT` collects every magic number
 * (margins, column widths, line heights) so layout tweaks happen in
 * one place.
 */
```

Add JSDoc above each exported helper.

- [ ] **Step 4: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.7: Comment the DOCX generator and importer

**Files:**
- Modify: `src/features/piar/lib/docx/docx-generator.ts`
- Modify: `src/features/piar/lib/docx/docx-importer.ts`

- [ ] **Step 1: Header and inline comments for `docx-generator.ts`**

Read the file first to find the custom-XML embedding step.

Insert at the top:

```ts
/**
 * Generates a PIAR DOCX file by instrumenting the bundled
 * `new_template.docx` and embedding the form data as custom XML.
 *
 * Strategy: load the template ZIP, walk it with `jszip`, drop the
 * source PIAR data into a `<piar:document v="2">` custom XML part, and
 * use the `docx-instrumenters` modules to inject visible content into
 * the structured Word controls so the document looks filled-out when
 * opened in Word. Re-importing through `docx-importer` reads the
 * custom XML first, falling back to control values if the XML is
 * missing.
 *
 * @see ./docx-instrumenters/index.ts
 * @see ./docx-shared/template-loader.ts
 * @see ./docx-importer.ts
 */
```

Find the function that writes the custom XML part. Above the `<piar:document` literal (or wherever the namespace string is constructed), insert:

```ts
// why: the custom XML root has a `v` attribute (not a `{ v, data }`
// JSON envelope) because Word's custom XML parts are XML, not JSON.
// The version attribute is the DOCX equivalent of the PDF envelope's
// `v` field — bumping it for breaking changes is the same contract.
```

Add JSDoc above the exported `generatePIARDocx` function.

- [ ] **Step 2: Header for `docx-importer.ts`**

Insert at the top:

```ts
/**
 * Extracts PIAR form data from a generated DOCX.
 *
 * Two paths: (1) read the custom XML part if present (preferred — exact
 * round-trip), (2) fall back to reconstructing data from the visible
 * Word content controls if the custom XML is missing or unparseable
 * (lossy — only what's in structured fields round-trips). Always
 * returns a fully-populated `PIARFormDataV2` on success via
 * `deepMergeWithDefaultsV2`.
 *
 * @see ./docx-field-manifest/index.ts — drives the fallback reconstruction
 * @see ../portable/piar-import.ts
 */
```

Add JSDoc above the exported `importPIARDocx` function and inline `// why:` comments at the two-path branch explaining why custom-XML wins.

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.8: Comment the DOCX field manifest directory

**Files:**
- Modify: `src/features/piar/lib/docx/docx-field-manifest/index.ts`
- Modify: `src/features/piar/lib/docx/docx-field-manifest/types.ts`
- Modify: `src/features/piar/lib/docx/docx-field-manifest/helpers.ts`
- Modify: `src/features/piar/lib/docx/docx-field-manifest/definitions.ts`
- Modify: `src/features/piar/lib/docx/docx-field-manifest/reconstruction.ts`
- Modify: `src/features/piar/lib/docx/docx-field-manifest/serialization.ts`
- Modify: `src/features/piar/lib/docx/docx-field-manifest/validation.ts`

- [ ] **Step 1: Header for `index.ts`**

Insert:

```ts
/**
 * Barrel for the DOCX field manifest module — a dynamic mapping system
 * built from the assessment catalogs that drives both the DOCX
 * instrumenters (which write into Word controls) and the DOCX importer
 * fallback path (which reconstructs PIAR data from those controls when
 * the custom XML part is missing).
 *
 * Sub-modules: `types` (interfaces), `helpers` (small utilities),
 * `definitions` (the manifest builder), `reconstruction` (the importer
 * fallback), `serialization` (manifest serialization for tests),
 * `validation` (consistency checks).
 *
 * @see ../docx-instrumenters/index.ts
 * @see ../docx-importer.ts
 */
```

- [ ] **Step 2: Headers for the other six files**

For each of the remaining files, read the file briefly and add a 2-4 line header naming what the file is responsible for. Use this template — fill in the role from the file content:

```ts
/**
 * <One-sentence summary>
 *
 * <One sentence on how this fits into the field manifest module and
 *  who calls it.>
 */
```

Suggested headers (read the file to confirm before applying):

- `types.ts`: "Type definitions for field manifest entries: paths into PIARFormDataV2, value coercers, control id patterns."
- `helpers.ts`: "Small utilities for walking PIARFormDataV2 by path string and coercing values for DOCX storage."
- `definitions.ts`: "Builds the field manifest from the assessment catalogs and the PIARFormDataV2 schema. The manifest is computed lazily and cached."
- `reconstruction.ts`: "Reverse pass: walks a Word document's filled-in controls, looks each one up in the manifest, and rebuilds a partial PIARFormDataV2."
- `serialization.ts`: "Serializes/deserializes the manifest to JSON for tests and golden-file comparisons."
- `validation.ts`: "Sanity-checks the manifest at module load time: every entry must have a valid path and a valid coercer; duplicate paths fail loudly."

Add a one-sentence JSDoc above each exported function or type in each file.

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.9: Comment the DOCX instrumenters directory

**Files:**
- Modify: `src/features/piar/lib/docx/docx-instrumenters/index.ts`
- Modify: `src/features/piar/lib/docx/docx-instrumenters/identity.ts`
- Modify: `src/features/piar/lib/docx/docx-instrumenters/environments.ts`
- Modify: `src/features/piar/lib/docx/docx-instrumenters/assessment.ts`
- Modify: `src/features/piar/lib/docx/docx-instrumenters/planning.ts`
- Modify: `src/features/piar/lib/docx/docx-instrumenters/metadata.ts`
- Modify: `src/features/piar/lib/docx/docx-instrumenters/shared.ts`
- Modify: `src/features/piar/lib/docx/docx-instrumenters/template-validator.ts`

- [ ] **Step 1: Header for `index.ts`**

Insert:

```ts
/**
 * Section-scoped DOCX template instrumentation modules.
 *
 * Each instrumenter takes the parsed template document XML and a slice
 * of `PIARFormDataV2`, walks the document looking for the structured
 * Word controls that match the section, and fills them in with the
 * data. Coordinated by the orchestrator in this index file. Splitting
 * by section keeps each instrumenter focused on one part of the form
 * shape.
 *
 * @see ../docx-shared/template-document.ts
 * @see ../docx-field-manifest/definitions.ts
 */
```

- [ ] **Step 2: Headers for `identity.ts`, `environments.ts`, `assessment.ts`, `planning.ts`**

For each, add a header naming the section it instruments and the data slice it reads. Example for `identity.ts`:

```ts
/**
 * Fills in the identity section of the DOCX template (HeaderV2 +
 * StudentV2) by walking the structured controls under the corresponding
 * template region and writing the form values into them.
 */
```

Apply the same pattern to `environments.ts` (entornoSalud + entornoHogar + entornoEducativo), `assessment.ts` (valoración + competencias), and `planning.ts` (ajustes + firmas + acta).

- [ ] **Step 3: Header for `metadata.ts`**

Insert:

```ts
/**
 * Writes the custom XML part containing the full PIAR data envelope
 * (`<piar:document v="2">…</piar:document>`) into the DOCX zip. This is
 * the high-fidelity round-trip path; the visible content controls are
 * the lossy fallback.
 */
```

- [ ] **Step 4: Header for `shared.ts`**

Read the file. Insert a header naming the helpers exported (likely small utilities for walking the parsed Word XML and matching control ids).

- [ ] **Step 5: Header for `template-validator.ts`**

Insert:

```ts
/**
 * Validates that the bundled DOCX template has all the structured
 * controls each instrumenter expects. Run at template-load time so a
 * mismatched template fails loudly with a clear error rather than
 * silently producing a half-instrumented file.
 */
```

- [ ] **Step 6: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.10: Comment the DOCX shared utilities

**Files:**
- Modify: `src/features/piar/lib/docx/docx-shared/index.ts`
- Modify: `src/features/piar/lib/docx/docx-shared/constants.ts`
- Modify: `src/features/piar/lib/docx/docx-shared/control-builders.ts`
- Modify: `src/features/piar/lib/docx/docx-shared/template-bytes.ts`
- Modify: `src/features/piar/lib/docx/docx-shared/template-document.ts`
- Modify: `src/features/piar/lib/docx/docx-shared/template-loader.ts`
- Modify: `src/features/piar/lib/docx/docx-shared/template-source.ts`
- Modify: `src/features/piar/lib/docx/docx-shared/template-xml.ts`
- Modify: `src/features/piar/lib/docx/docx-shared/xml-builders.ts`
- Modify: `src/features/piar/lib/docx/docx-shared/xml-primitives.ts`
- Modify: `src/features/piar/lib/docx/docx-shared/xml-readers.ts`

- [ ] **Step 1: Headers for the directory**

For each file, read it and add a 2–4 line header. Use these templates as the starting point — refine to match the actual file contents:

| File | Header summary |
|---|---|
| `index.ts` | `/** Barrel exports for the docx-shared utilities. */` |
| `constants.ts` | `/** XML namespace strings, well-known control ids, and other DOCX constants used by the generator and importer. */` |
| `control-builders.ts` | `/** Constructors for Word structured-document-tag (SDT) XML elements: text controls, dropdowns, checkboxes. */` |
| `template-bytes.ts` | `/** Loads the bundled `new_template.docx` as a Uint8Array (build-time include) and exposes it as a default source for the generator. */` |
| `template-document.ts` | `/** In-memory representation of a parsed DOCX template: the JSZip handle plus the parsed `document.xml` tree. */` |
| `template-loader.ts` | `/** Async loader that resolves a template source (bytes, URL, or default) into a `PIARDocxTemplateSource`. Used by the form workspace and the download path. */` |
| `template-source.ts` | `/** Type definitions for the template source variants (bundled bytes, runtime URL, file upload). */` |
| `template-xml.ts` | `/** Helpers for serializing the in-memory document tree back to XML and writing it into the DOCX zip. */` |
| `xml-builders.ts` | `/** Programmatic XML element constructors for control content (runs, paragraphs, text nodes). */` |
| `xml-primitives.ts` | `/** Low-level XML helpers: escape, attribute serialization, namespace prefixing. */` |
| `xml-readers.ts` | `/** Parsers for reading values back out of Word controls during DOCX import. */` |

Open each file, confirm the summary fits, adjust if needed, and insert the header at the top.

Add a one-sentence JSDoc above each exported function/type per the style guide. (Most of these files are small barrel-style modules; a few JSDoc lines each.)

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.11: Comment the form library and assets

**Files:**
- Modify: `src/features/piar/lib/forms/boolSelect.ts`
- Modify: `src/features/piar/lib/assets/downloadBundledAsset.ts`

- [ ] **Step 1: Header for `boolSelect.ts`**

Insert:

```ts
/**
 * Helpers for the tri-state boolean SELECT pattern used throughout the
 * form: `null` ↔ "Sin respuesta", `true` ↔ "Sí", `false` ↔ "No".
 *
 * `boolNullToString` and `stringToBoolNull` are the conversion pair.
 * `BOOL_SELECT_CLASS` is the shared Tailwind class string so every
 * occurrence renders identically without each section component
 * re-declaring it.
 */
```

Add a one-sentence JSDoc above each export.

- [ ] **Step 2: Header for `downloadBundledAsset.ts`**

Insert:

```ts
/**
 * Downloads a static asset bundled with the app (e.g., the blank PIAR
 * template) using the same save-file path as the form exports — native
 * dialog under Tauri, browser-default download elsewhere.
 *
 * @see ../../../shared/lib/save-file.ts
 */
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.12: Comment the PIARForm directory

**Files:**
- Modify: `src/features/piar/components/form/PIARForm/index.tsx`
- Modify: `src/features/piar/components/form/PIARForm/usePIARFormController.ts`
- Modify: `src/features/piar/components/form/PIARForm/sectionRegistry.tsx`
- Modify: `src/features/piar/components/form/PIARForm/useActiveSectionObserver.ts`
- Modify: `src/features/piar/components/form/PIARForm/SaveStatusBanner.tsx`
- (`usePIARAutosave.ts` already done in Phase 1.)

- [ ] **Step 1: Header for `index.tsx`**

Insert at the top:

```tsx
/**
 * The long-form PIAR editor.
 *
 * Owns the canonical PIARFormDataV2 state via `usePIARFormController`
 * and threads it through every section component as a slice + onChange
 * pair. Wraps the autosave hook so every edit is persisted to encrypted
 * localStorage. Composes the section registry, the progress nav, the
 * scroll-spy observer, and the save-status banner.
 *
 * @see ./usePIARFormController.ts
 * @see ./usePIARAutosave.ts
 * @see ./sectionRegistry.tsx
 */
```

- [ ] **Step 2: Header and inline comments for `usePIARFormController.ts`**

Read the file to find the `update` function and any non-obvious React patterns.

Insert at the top:

```ts
/**
 * State controller for the PIAR form.
 *
 * Holds the full PIARFormDataV2 in React state and exposes section-level
 * patch functions. Every patch goes through `update((prev) => ({
 * ...prev, section: { ...prev.section, ...patch } }))` so the state is
 * always a fresh object — important because PIARForm uses referential
 * equality on the data prop to drive the autosave hook's dirty
 * tracking.
 *
 * Patches are merged shallowly per-section. Fixed-length tuple fields
 * (`ajustes`, `firmas.docentes`, etc.) are passed in as full tuples,
 * not as variable-length arrays.
 */
```

Add a one-sentence JSDoc above each exported function/hook.

Inside the controller, find the section patch dispatcher. Above it, insert:

```ts
// why: every dispatcher uses the spread-update pattern instead of
// mutate-then-set so React re-renders consistently AND the autosave
// hook can detect dirty state via referential equality on the data
// prop.
```

- [ ] **Step 3: Header for `sectionRegistry.tsx`**

Insert:

```tsx
/**
 * Registry mapping section ids to their React components and metadata.
 *
 * Adding a new section means: (1) defining the section type in the data
 * model, (2) creating its component, (3) registering it here, and (4)
 * adding it to `model/section-list.ts` so the nav picks it up.
 *
 * @see ../../../model/section-list.ts
 */
```

- [ ] **Step 4: Header and inline comment for `useActiveSectionObserver.ts`**

Insert at the top:

```ts
/**
 * IntersectionObserver hook that tracks which form section is currently
 * in view. Powers the scroll-spy active state in the progress nav.
 */
```

Find the IntersectionObserver setup. Above it, insert:

```ts
  // why: rootMargin offsets the trigger so a section becomes "active"
  // when its heading approaches the top of the viewport, not when it
  // first peeks in from the bottom. The threshold values match the
  // viewport height bands used by the design.
```

- [ ] **Step 5: Header for `SaveStatusBanner.tsx`**

Insert:

```tsx
/** Visual indicator for the autosave state (saving, saved, failed). Reads from `usePIARAutosave`'s return value. */
```

- [ ] **Step 6: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.13: Comment the form-shell components (non-PIARForm)

**Files:**
- Modify: `src/features/piar/components/form/ProgressNav.tsx`
- Modify: `src/features/piar/components/form/SectionGuide.tsx`
- Modify: `src/features/piar/components/form/SectionHeader.tsx`

- [ ] **Step 1: Headers**

Apply these headers:

`ProgressNav.tsx`:
```tsx
/** Sidebar navigation for the form: lists every section, highlights the active one (driven by `useActiveSectionObserver`), and shows fill-in progress. */
```

`SectionGuide.tsx`:
```tsx
/** Slide-in panel that shows Spanish guidance text for the active section. Reads copy from `content/guidance.ts`. */
```

`SectionHeader.tsx`:
```tsx
/** Standard section header layout used at the top of every form section: title, subtitle, optional info button. */
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.14: Comment the PDF UI components and feedback components

**Files:**
- Modify: `src/features/piar/components/pdf/UploadZone.tsx`
- Modify: `src/features/piar/components/feedback/ErrorBoundary.tsx`
- (`DownloadButton.tsx` already done in Phase 1.)

- [ ] **Step 1: Headers**

`UploadZone.tsx`:
```tsx
/**
 * Drag-and-drop area for restoring a PIAR from a previously exported
 * PDF or DOCX. Routes the dropped file through the appropriate importer
 * (`importPIARPdf` for `.pdf`, `importPIARDocx` for `.docx`) and surfaces
 * a Spanish error notice on validation failure.
 */
```

`ErrorBoundary.tsx`:
```tsx
/**
 * React error boundary used at the workflow root. Catches render-phase
 * errors in any descendant and shows a Spanish "algo salió mal" panel
 * with a "exportar respaldo" affordance so the user can rescue their
 * progress before reloading.
 */
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.15: Comment the leaf section components

**Files:** the 31 files under `src/features/piar/components/sections/`. Per the style guide, leaf section components get a file header only — no inline comments.

- [ ] **Step 1: Apply headers per the table below**

Open each file in the table and insert the listed file header at the very top. The pattern: name the section, name the data slice it reads/writes, name any non-obvious behavior. Read the file first to confirm the description matches.

| File | Header |
|---|---|
| `sections/identity/HeaderSection.tsx` | `/** Renders the HeaderV2 fields (fecha, lugar, persona que diligencia, rol, institución, sede, jornada). */` |
| `sections/identity/StudentSection/index.tsx` | `/** Composes the four StudentSection sub-components and threads `student` data through them. */` |
| `sections/identity/StudentSection/IdentityFields.tsx` | `/** Identity sub-fields: nombres, apellidos, documento, fecha de nacimiento, género. */` |
| `sections/identity/StudentSection/LocationFields.tsx` | `/** Location sub-fields: dirección, municipio, departamento, etc. */` |
| `sections/identity/StudentSection/ContextFields.tsx` | `/** Context sub-fields: tri-state condition flags (hasDiscapacidad, hasTalentos, etc.). */` |
| `sections/identity/StudentSection/NarrativeFields.tsx` | `/** The six free-text narrative description fields. */` |
| `sections/environments/EntornoSaludSection/index.tsx` | `/** Composes the EntornoSalud sub-components and threads the `entornoSalud` data slice through them. */` |
| `sections/environments/EntornoSaludSection/CoverageFields.tsx` | `/** Health coverage fields: afiliación EPS, régimen, tipo. */` |
| `sections/environments/EntornoSaludSection/DiagnosisFields.tsx` | `/** Diagnostic fields: diagnóstico médico, fecha, profesional. */` |
| `sections/environments/EntornoSaludSection/HealthRowGroup.tsx` | `/** Renders one of the three health row tuple groups (3+3+2 fixed-length rows) using `SiNoRow`. */` |
| `sections/environments/EntornoSaludSection/SiNoRow.tsx` | `/** One row of the health-condition table: label + tri-state Sí/No/Sin respuesta select. */` |
| `sections/environments/EntornoSaludSection/TechnicalSupportsFields.tsx` | `/** Assistive technology and technical support selections. */` |
| `sections/environments/EntornoHogarSection/index.tsx` | `/** Composes the EntornoHogar sub-components. */` |
| `sections/environments/EntornoHogarSection/ParentFields.tsx` | `/** Parent fields: madre, padre — names, ages, schooling, occupations. */` |
| `sections/environments/EntornoHogarSection/CaregiverFields.tsx` | `/** Caregiver fields used when madre/padre are absent. */` |
| `sections/environments/EntornoHogarSection/HouseholdCompositionFields.tsx` | `/** Household composition checklist (with whom the student lives). */` |
| `sections/environments/EntornoHogarSection/nivelEducativoOptions.ts` | `/** Constant list of nivel educativo options used by the parent/caregiver selects. */` |
| `sections/environments/EntornoEducativoSection.tsx` | `/** Educational environment section: prior schooling history, prior pedagogical reports, programs the student participates in. */` |
| `sections/assessment/ValoracionPedagogicaSection.tsx` | `/** Renders the 5 valoración pedagógica aspects, each with a respuestas record (item id → tri-state), an intensidad selection, and a free-text observación. Pulls item labels from `assessment-catalogs`. */` |
| `sections/assessment/CompetenciasDispositivosSection.tsx` | `/** Renders the 8 competencias y dispositivos checklist groups (~85 items). Memoized — re-rendering all checkboxes on every keystroke would be expensive. */` |
| `sections/assessment/NarrativeSections.tsx` | `/** Free-text "Descripción de habilidades" and "Estrategias y acciones" sections. Both are simple textareas with auto-grow. */` |
| `sections/planning/AjustesRazonablesSection.tsx` | `/** Renders the 5-row reasonable-adjustments table. Uses the fixed-length tuple update pattern: spread to new tuple, replace target index, pass full tuple to onChange. */` |
| `sections/planning/SignaturesSection.tsx` | `/** Renders the FirmasV2 signature block: 9 docente entries (fixed tuple), 3 role objects, 2 free-text signatories. */` |
| `sections/planning/ActaAcuerdoSection/index.tsx` | `/** Composes the ActaAcuerdo sub-components and threads the `acta` data slice. */` |
| `sections/planning/ActaAcuerdoSection/ActaSummaryFields.tsx` | `/** Header repeat + student summary at the top of the acta de acuerdo. */` |
| `sections/planning/ActaAcuerdoSection/CompromisosField.tsx` | `/** Free-text compromisos field (the agreement summary). */` |
| `sections/planning/ActaAcuerdoSection/ActividadList.tsx` | `/** Renders the 5 actividad rows (fixed tuple) using `ActividadCard`. */` |
| `sections/planning/ActaAcuerdoSection/ActividadCard.tsx` | `/** One actividad row: descripción, responsable, fecha, observaciones. */` |
| `sections/planning/ActaAcuerdoSection/ParticipantsFields.tsx` | `/** Participant fields for the acta header. */` |
| `sections/planning/ActaAcuerdoSection/SignatureFields.tsx` | `/** The four signature strings at the bottom of the acta. */` |
| `sections/planning/ActaAcuerdoSection/formatters.ts` | `/** Spanish date/string formatters used by the acta sub-components. */` |

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.16: Comment the screen components

**Files:**
- Modify: `src/features/piar/screens/AppStartScreen.tsx`
- Modify: `src/features/piar/screens/FormWorkspace.tsx`
- (`PiarHomePage.tsx` already done in Phase 1.)

- [ ] **Step 1: Header for `AppStartScreen.tsx`**

Insert:

```tsx
/**
 * Landing screen for the workflow route.
 *
 * Two modes (driven by the parent's `mode` prop):
 * - `start`: shows the "Empezar nuevo" button + the upload-zone for
 *   restoring from PDF/DOCX
 * - `restore-prompt`: shows a confirmation panel offering to restore
 *   the saved draft or start fresh
 *
 * Stateless — every mode transition is owned by the parent
 * `PiarHomePage`. This component just renders the right affordances
 * and calls the prop callbacks.
 *
 * @see ./PiarHomePage.tsx
 */
```

- [ ] **Step 2: Header for `FormWorkspace.tsx`**

Insert:

```tsx
/**
 * Layout shell for the long-form PIAR editor.
 *
 * Composes the PIARForm, the progress nav, the section guide panel, the
 * download button, and the storage/data-correction notices. Lazy-loaded
 * by `PiarHomePage` — the heavy parts of the form (the assessment
 * checklists, the PDF/DOCX generators, etc.) are not in the initial
 * bundle.
 *
 * @see ./PiarHomePage.tsx
 * @see ../components/form/PIARForm/index.tsx
 */
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.17: Comment the shared/ directory and the embedded entry point

**Files:**
- Modify: `src/shared/lib/cx.ts`
- Modify: `src/shared/lib/desktop-runtime.ts`
- Modify: `src/shared/lib/save-file.ts`
- Modify: `src/shared/lib/storage-safe.ts`
- Modify: `src/shared/ui/Button.tsx`
- Modify: `src/shared/ui/ConfirmDialog.tsx`
- Modify: `src/shared/ui/Input.tsx`
- Modify: `src/shared/ui/JsonLdScript.tsx`
- Modify: `src/shared/ui/SectionShell.tsx`
- Modify: `src/shared/ui/SurfaceCard.tsx`
- Modify: `src/shared/ui/Textarea.tsx`
- Modify: `src/shared/ui/icons/DialogIcons.tsx`
- Modify: `src/embedded/PiarDigitalApp.tsx`
- Modify: `src/types/assets.d.ts`
- Modify: `src/types/tauri-runtime.d.ts`

- [ ] **Step 1: Headers per the table**

Open each file, read it briefly, insert the listed header. Adjust if the actual file content suggests a better description.

| File | Header |
|---|---|
| `shared/lib/cx.ts` | `/** Tiny conditional-class-name helper used throughout the UI components. */` |
| `shared/lib/desktop-runtime.ts` | `/** Detects whether the app is running inside the Tauri desktop shell and exposes a typed bridge to the native APIs. */` |
| `shared/lib/save-file.ts` | `/** Cross-environment file-save dispatcher: native dialog under Tauri, browser-default download elsewhere. */` |
| `shared/lib/storage-safe.ts` | `/** Defensive localStorage wrappers (`safeLocalStorageGet`, `safeLocalStorageSet`) that swallow exceptions in private-browsing modes. */` |
| `shared/ui/Button.tsx` | `/** Themed button with size, variant, fullWidth, and loading props. Used everywhere in place of bare `<button>`. */` |
| `shared/ui/ConfirmDialog.tsx` | `/** Modal confirm dialog with optional bullets, optional checkbox, optional auxiliary action button. Used by the form clear flow, the PDF export warning, and others. */` |
| `shared/ui/Input.tsx` | `/** Themed text input with label, helper text, and error state. */` |
| `shared/ui/JsonLdScript.tsx` | `/** Renders a `<script type="application/ld+json">` element for SEO structured data on the marketing landing page. */` |
| `shared/ui/SectionShell.tsx` | `/** Card-style wrapper used to group related fields under a section heading. */` |
| `shared/ui/SurfaceCard.tsx` | `/** Generic surface-colored card with the standard padding/border-radius/shadow tokens. */` |
| `shared/ui/Textarea.tsx` | `/** Themed textarea with auto-grow, label, helper text, and error state. */` |
| `shared/ui/icons/DialogIcons.tsx` | `/** Icon set for the confirm dialog tones (info, danger, success). */` |
| `embedded/PiarDigitalApp.tsx` | `/** Embeddable entry point — exports the workflow page as a React component for host pages that want to mount the PIAR editor outside Next.js. */` |
| `types/assets.d.ts` | `/** Module declarations for non-code asset imports (images, docx templates) used by the bundler. */` |
| `types/tauri-runtime.d.ts` | `/** Type declarations for the Tauri runtime bridge surfaced to the web side via `desktop-runtime.ts`. */` |

Add a one-sentence JSDoc above each exported component for the UI files.

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.18: Comment the Next.js app routes

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/not-found.tsx`
- Modify: `src/app/manifest.ts`
- Modify: `src/app/diligenciar/layout.tsx`
- Modify: `src/app/diligenciar/page.tsx`

- [ ] **Step 1: Header for `app/layout.tsx`**

Insert:

```tsx
/**
 * Root layout for the entire static export. Wraps every route with the
 * Tailwind body classes, the JSON-LD script for SEO, and the global
 * font configuration. Marks the document language as Spanish.
 */
```

- [ ] **Step 2: Header for `app/page.tsx`**

Insert:

```tsx
/**
 * Marketing landing page (`/`). Indexable. Pure presentation — no
 * workflow state, no autosave. Links to `/diligenciar` for users who
 * want to start filling out the form.
 *
 * @see ./diligenciar/page.tsx — the workflow route
 */
```

- [ ] **Step 3: Header for `app/not-found.tsx`**

Insert:

```tsx
/** 404 page. Static content with a link back to the landing page. */
```

- [ ] **Step 4: Header for `app/manifest.ts`**

Insert:

```ts
/** Web app manifest (PWA install metadata). Read by the build to generate `out/manifest.webmanifest`. */
```

- [ ] **Step 5: Header for `app/diligenciar/layout.tsx`**

Insert:

```tsx
/**
 * Layout for the workflow route (`/diligenciar`).
 *
 * Marked as non-indexable (`robots: 'noindex,nofollow'`) because every
 * pageview is a private editing session. Provides the docx template
 * source to the page via context if a bundled template is configured.
 */
```

- [ ] **Step 6: Header for `app/diligenciar/page.tsx`**

Insert:

```tsx
/**
 * Workflow route (`/diligenciar`). Renders `PiarHomePage`, which owns
 * the form mode state machine and the lazy-loaded form workspace.
 *
 * @see ../../features/piar/screens/PiarHomePage.tsx
 */
```

- [ ] **Step 7: Verify**

Run: `npm run typecheck`
Expected: zero errors.

### Task 2.19: Comment the build scripts

**Files:**
- Modify: `scripts/generate-csp-headers.mjs`
- Modify: `scripts/run-desktop-web-build.mjs`

- [ ] **Step 1: Header for `generate-csp-headers.mjs`**

Insert at the very top (before any imports):

```js
/**
 * Build-time helper that generates `out/headers.conf` from a CSP
 * template. Run as part of `npm run build` after `next build`. The
 * resulting `headers.conf` is consumed by the bundled nginx config to
 * serve the static export with the correct Content-Security-Policy
 * header.
 *
 * @see ../nginx.conf
 */
```

- [ ] **Step 2: Header for `run-desktop-web-build.mjs`**

Insert at the top:

```js
/**
 * Wrapper around `next build` used by the Tauri desktop pipeline. Sets
 * the env vars Tauri needs and forwards stdout/stderr.
 */
```

- [ ] **Step 3: Verify**

Run: `npm run lint`
Expected: zero errors. `.mjs` files are linted by next-eslint.

### Task 2.20: Add one-line headers to the test files

**Files:** the 41 test files (the 3 Phase-1 ones already done). Per the style guide, test files get a one-line header naming what is under test. No inline comments.

- [ ] **Step 1: Apply headers per the table below**

For each file, insert the listed one-line header at the very top.

| File | Header |
|---|---|
| `tests/features/piar-import.test.ts` | `/** Tests for the shared envelope validator across PDF, DOCX, and localStorage import paths. */` |
| `tests/features/piar/lib/pdf/pdf-generator.test.ts` | `/** Tests for the PIAR PDF generator: section assembly, hidden field embedding, page-break behavior. */` |
| `tests/features/piar/lib/pdf/pdf-importer.test.ts` | `/** Tests for the PDF importer: hidden field extraction, version handling, malformed payload rejection. */` |
| `tests/features/piar/lib/pdf/pdf-roundtrip.test.ts` | `/** Golden-path V2 PDF round-trip: generate → import → assert structural equality with the source data. */` |
| `tests/features/piar/lib/pdf/pdf-table-helpers.test.ts` | `/** Tests for the PDF table layout constants and width helpers. */` |
| `tests/features/piar/lib/pdf/tableRenderer.test.ts` | `/** Tests for the PDF table renderer: row height calculation, page break handling, header repetition. */` |
| `tests/features/piar/lib/docx/boolean-parsing.test.ts` | `/** Tests for parsing legacy and current DOCX boolean tokens (Sí/Si/SI/sí/no/No/NO and friends). */` |
| `tests/features/piar/lib/docx/docx-field-manifest.test.ts` | `/** Tests for the DOCX field manifest: definition consistency, path resolution, value coercion. */` |
| `tests/features/piar/lib/docx/docx-import-fallback.test.ts` | `/** Tests for the DOCX importer fallback path that reconstructs data from visible content controls when custom XML is missing. */` |
| `tests/features/piar/lib/docx/docx-import-validation.test.ts` | `/** Tests for DOCX import validation: rejected malformed inputs, warnings on partial data. */` |
| `tests/features/piar/lib/docx/docx-roundtrip.test.ts` | `/** Golden-path V2 DOCX round-trip: generate → import → assert structural equality with the source data. */` |
| `tests/features/piar/lib/docx/docx-template-shapes.test.ts` | `/** Tests asserting the bundled template's structural shape matches what the instrumenters expect. */` |
| `tests/features/piar/lib/docx/docx-template-validation.test.ts` | `/** Tests for the template validator that runs at template-load time. */` |
| `tests/features/piar/lib/docx/docx-generator.test.ts` | `/** Tests for the DOCX generator: instrumentation orchestration, custom XML embedding, ZIP integrity. */` |
| `tests/features/piar/lib/docx/docx-test-helpers.ts` | `/** Shared helpers for DOCX tests: ZIP loading, control walking, golden file utilities. */` |
| `tests/features/piar/lib/data/data-utils.test.ts` | `/** Tests for the data-utils merge functions and legacy fallbacks. */` |
| `tests/features/piar/lib/portable/download.test.ts` | `/** Tests for the portable download dispatcher: format selection, native vs. browser save. */` |
| `tests/features/piar/content/guidance.test.ts` | `/** Tests asserting the guidance copy strings exist for every section. */` |
| `tests/features/piar/components/form/PIARForm.test.tsx` | `/** Tests for the PIARForm component: state mutations, autosave wiring, section change propagation. */` |
| `tests/features/piar/components/form/PIARForm/usePIARFormController.test.ts` | `/** Tests for the form controller hook: section patches, structural sharing, fixed-tuple updates. */` |
| `tests/features/piar/components/form/PIARForm/hooks.test.ts` | `/** Tests for assorted PIARForm hooks (active section observer, save status banner state). */` |
| `tests/features/piar/components/form/ProgressNav.test.tsx` | `/** Tests for the ProgressNav sidebar: active state, progress badges, section links. */` |
| `tests/features/piar/components/form/SectionGuide.test.tsx` | `/** Tests for the section guidance slide-in panel. */` |
| `tests/features/piar/components/form/SectionHeader.test.tsx` | `/** Tests for the section header layout component. */` |
| `tests/features/piar/components/feedback/ErrorBoundary.test.tsx` | `/** Tests for the workflow root error boundary: fallback rendering, backup-export affordance. */` |
| `tests/features/piar/components/pdf/UploadZone.test.tsx` | `/** Tests for the drag-and-drop import zone: file routing, error surfacing. */` |
| `tests/features/piar/components/pdf/DownloadButton.test.tsx` | `/** Tests for the export button: PDF warning dialog, missing-context warning, save-before-export flow. */` |
| `tests/features/piar/components/sections/identity/HeaderSection.test.tsx` | `/** Tests for the HeaderSection field bindings. */` |
| `tests/features/piar/components/sections/identity/StudentSection.test.tsx` | `/** Tests for the StudentSection composition and tri-state field bindings. */` |
| `tests/features/piar/components/sections/environments/EntornoSaludSection.test.tsx` | `/** Tests for the EntornoSalud composition and the row-tuple update pattern. */` |
| `tests/features/piar/components/sections/environments/EntornoHogarSection.test.tsx` | `/** Tests for the EntornoHogar parent/caregiver/composition fields. */` |
| `tests/features/piar/components/sections/environments/EntornoEducativoSection.test.tsx` | `/** Tests for the EntornoEducativo section field bindings. */` |
| `tests/features/piar/components/sections/assessment/ValoracionPedagogicaSection.test.tsx` | `/** Tests for the valoración pedagógica section: respuestas record updates, intensidad selection, observación binding. */` |
| `tests/features/piar/components/sections/assessment/CompetenciasDispositivosSection.test.tsx` | `/** Tests for the competencias y dispositivos checklist: item toggles, group memoization. */` |
| `tests/features/piar/components/sections/planning/ActaAcuerdoSection.test.tsx` | `/** Tests for the ActaAcuerdo composition and fixed-tuple update pattern. */` |
| `tests/features/piar/components/sections/planning/AjustesRazonablesSection.test.tsx` | `/** Tests for the 5-row ajustes razonables fixed-tuple update pattern. */` |
| `tests/features/piar/components/sections/planning/SignaturesSection.test.tsx` | `/** Tests for the firmas section: 9-docente fixed tuple, role objects, free-text signatories. */` |
| `tests/shared/lib/storage-safe.test.ts` | `/** Tests for the defensive localStorage wrappers under simulated private browsing. */` |
| `tests/shared/ui/ConfirmDialog.test.tsx` | `/** Tests for the ConfirmDialog component: tones, bullets, checkbox, auxiliary action. */` |
| `tests/app/landing-flow.smoke.test.tsx` | `/** Smoke test for the marketing landing → workflow route navigation. */` |
| `tests/app/restore-upload-fill-export.smoke.test.tsx` | `/** End-to-end smoke test: restore prompt → upload → fill → export. */` |

- [ ] **Step 2: Verify**

Run: `npm run typecheck && npm test`
Expected: zero errors, all tests pass.

### Task 2.21: Run full verification for Phase 2

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: zero errors. Warning count matches baseline.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 3: Tests**

Run: `npm test`
Expected: total count matches baseline, all pass.

### Task 2.22: Commit Phase 2

- [ ] **Step 1: Stage everything under src/, scripts/, tests/ that's modified**

Run:
```bash
git add -u src/ scripts/ tests/
git status --short
```

Expected: a long list of `M` lines, no `A` lines (no new files), no `D` lines (no deletions).

- [ ] **Step 2: Verify nothing else snuck in**

Look for any file in the staging area that you didn't intentionally comment. If so, unstage it: `git restore --staged <path>`.

- [ ] **Step 3: Commit**

Run:
```bash
git commit -m "$(cat <<'EOF'
docs(comments): add file headers, JSDoc, and inline `why:` comments

Comment-only sweep across the source tree. Adds:

- File headers on every src/ and tests/ file
- JSDoc on exported functions, types, and React components where the
  TypeScript signature alone leaves the role unclear
- Inline `// why:` comments at the non-obvious decision points: the
  controller spread-update pattern, the PDF table renderer's text
  wrapping, the DOCX custom-XML versioning, the autosave dirty-version
  tracking (the encryption-specific comments landed in the previous
  commit)

No behavior changes. Tests, lint, and typecheck unchanged.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Verify**

Run: `git log --oneline -3 && git status --short`
Expected: the new commit is at HEAD, working tree is clean.

---

## Phase 3 — Commit 3: `docs/` developer pages

**Goal of this phase:** Create 8 new developer-facing markdown files in `docs/`, plus shrink `CLAUDE.md` to a one-paragraph pointer.

**Strategy:** Each task creates one file. Each task body specifies the section structure, the key facts that must appear, the length budget, and any code snippets that must be included verbatim. The implementer writes the prose.

### Task 3.1: Create `docs/README.md`

**Files:**
- Create: `docs/README.md`

- [ ] **Step 1: Write the file**

Length: ~30 lines. English. Structure:

1. Title: `# PIAR Digital — developer documentation`
2. One-paragraph intro: this folder is the developer-facing reference; for end-user/audience-facing content see the GitHub wiki; for AI-tool context see `../CLAUDE.md`.
3. A bulleted index linking to every other doc page in this folder, with a one-line "what's in it" hook for each:
   - `architecture.md` — system overview, layer map, build/runtime model
   - `data-model.md` — `PIARFormDataV2` shape and the versioning contract
   - `persistence-and-encryption.md` — draft storage, the encryption design, the threat model
   - `pdf-docx-roundtrip.md` — how the PDF and DOCX exports embed source data for round-trip
   - `contributing.md` — full developer onboarding (setup, scripts, tests, commit conventions)
   - `testing.md` — Vitest layout, fixtures, and patterns
   - `security.md` — privacy posture, CSP pipeline, vulnerability reporting
   - `release.md` — build, static export, Docker, Tauri desktop
4. A note that `docs/superpowers/` holds AI-assisted brainstorming specs and plans and is not part of the canonical developer docs.

### Task 3.2: Create `docs/architecture.md`

**Files:**
- Create: `docs/architecture.md`

- [ ] **Step 1: Write the file**

Length: ~150 lines. English. Structure:

1. Title and one-paragraph elevator pitch ("static export, no backend, all PIAR data stays in the browser").
2. Section "Build and runtime model":
   - Next.js 14 with `output: 'export'`
   - Static files served by Nginx
   - No SSR, no API routes, no server runtime
   - The `out/headers.conf` CSP generation step
   - Optional Tauri desktop shell that wraps the same static export
3. Section "Layer map":
   - `app/` (Next.js routes) → `screens/` (mode roots) → `components/` (form sections + shared UI) → `lib/` (PDF, DOCX, persistence, portable, data-utils, forms) → `model/` (data shapes) → `content/` (Spanish copy + assessment catalogs)
   - One sentence per layer naming what lives there
4. Section "Mode state machine":
   - Reproduce the ASCII diagram from `CLAUDE.md`:

```
PiarHomePage
  └─ Mode state machine: start → restore-prompt → form
      ├─ AppStartScreen → UploadZone → importPIARPdf / importPIARDocx
      │                                → parsePIARData → deepMergeWithDefaultsV2
      └─ FormWorkspace → PIARForm (owns PIARFormDataV2 state via usePIARFormController)
           ├─ Section components
           ├─ Auto-save → usePIARAutosave → ProgressStore → localStorage
           └─ DownloadButton → generatePIARPdf / generatePIARDocx
                                  └─ Embeds full form JSON in hidden `piar_app_state`
```

5. Section "Path aliases":
   - `@/*` → `src/*`
   - `@piar-digital-app/*` → `src/*` (the embeddable alias)
6. Section "Tailwind theme tokens":
   - Custom design tokens defined in `tailwind.config.ts`
   - surface/primary/secondary/error palettes via CSS variables
   - custom spacing, shadows, border radii
7. Section "Build pipeline":
   - `npm run build` → `next build` → static export → `csp:headers` → `out/`
   - Docker build args: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`
   - Tauri desktop: `npm run desktop:build`
8. Section "Where to read next":
   - `data-model.md` for the form shape
   - `persistence-and-encryption.md` for storage
   - `pdf-docx-roundtrip.md` for exports
   - `contributing.md` for hands-on setup

### Task 3.3: Create `docs/data-model.md`

**Files:**
- Create: `docs/data-model.md`

- [ ] **Step 1: Write the file**

Length: ~120 lines. English. Structure:

1. Title and one-paragraph intro: the canonical type is `PIARFormDataV2` in `src/features/piar/model/piar.ts`; everything reads and writes this shape.
2. Section "Versioning contract":
   - `PIAR_DATA_VERSION = 2`
   - Envelope shape `{ v, data }` used by localStorage and the PDF/DOCX embedded payloads
   - Additive changes: add the field, default it in `createEmptyPIARFormDataV2`, handle it in `deepMergeWithDefaultsV2`. No version bump.
   - Breaking changes: bump `v: 3`, write a migration. Past `v: 2` envelopes get rejected with `unsupported_version`.
   - V1 support has been removed.
3. Section "Root shape" — bullet list of every top-level field of `PIARFormDataV2` with one-line descriptions matching the JSDoc from Phase 2:
   - `_version`
   - `header` — top-of-form metadata
   - `student` — identity, demographics, condition flags, narrative descriptions
   - `entornoSalud` — health environment, support row tuples, technical supports
   - `entornoHogar` — home environment
   - `entornoEducativo` — schooling history and programs
   - `valoracionPedagogica` — 5 aspects with respuestas/intensidad/observación
   - `competenciasDispositivos` — 8 checklist groups
   - `descripcionHabilidades` — free-text
   - `estrategiasAcciones` — free-text
   - `fechaProximaRevision`
   - `ajustes` — fixed tuple of 5 reasonable-adjustment rows
   - `firmas` — signature block
   - `acta` — final agreement minutes
4. Section "Boolean tri-state":
   - `null` = sin respuesta (default), `true` = Sí, `false` = No
   - Used for ~80 fields across the form
   - Helpers in `src/features/piar/lib/forms/boolSelect.ts`
   - **Never coerce `null` to `false`.**
5. Section "Fixed-length tuples":
   - `ajustes: [_,_,_,_,_]`, `firmas.docentes` (9), `acta.actividades` (5), entornoSalud row groups
   - Why: the printed form has a fixed number of slots
   - Update pattern: spread to a new array, replace target index, pass the full new tuple to onChange
6. Section "Adding a new field — worked example":
   - Files to touch:
     1. `src/features/piar/model/piar.ts` — add the field to the relevant interface, add default to `createEmptyPIARFormDataV2`
     2. `src/features/piar/lib/data/data-utils/sectionMergers.ts` — handle the field in the relevant section merger
     3. The relevant section component under `src/features/piar/components/sections/`
     4. The PDF section file under `src/features/piar/lib/pdf/pdf-generator/` and the DOCX instrumenter under `src/features/piar/lib/docx/docx-instrumenters/`
   - Add a roundtrip test entry to `pdf-roundtrip.test.ts` and `docx-roundtrip.test.ts`
7. Section "Legacy fields":
   - `legacyFallbacks.ts` and `sectionMergers.ts` carry V1-shape repair logic
   - Examples: legacy `nombreCompleto` → V2 `nombres`+`apellidos`

### Task 3.4: Create `docs/persistence-and-encryption.md`

**Files:**
- Create: `docs/persistence-and-encryption.md`

- [ ] **Step 1: Write the file**

Length: ~100 lines. English. Structure:

1. Title and intro: where draft progress lives, how it's protected.
2. Section "Two-tier storage":
   - Encrypted main slot (`piar-form-progress`) — written by `ProgressStore.save`, read by `loadWithStatus`
   - Unencrypted unload-recovery slot (`piar-form-progress-unload-recovery`) — written synchronously during `pagehide`, cleared after the next encrypted save catches up
   - **Why both:** Web Crypto + IndexedDB cannot be awaited reliably during `pagehide`; if the page dies before the encrypted save resolves, the unload-recovery slot has the freshest data. The load path checks unload-recovery first.
3. Section "Encryption design":
   - Algorithm: AES-256-GCM
   - Key: 256-bit, generated once per browser profile, stored in IndexedDB (`piar-digital-progress-keys` database)
   - `extractable: false` — the raw key cannot be exported even by code in this origin
   - IV: 12-byte random per save (never reused)
   - Envelope: `{ storageVersion, kind, alg, keyId, iv, ciphertext }` with both `iv` and `ciphertext` base64-encoded
4. Section "`keyId` versioning":
   - The current id is `piar-progress-device-key-v1`
   - Future rotations bump the suffix and rotate readers cooperatively
5. Section "Race-condition handling":
   - Two tabs may race to create the device key on first run
   - `addStoredKey` returns false on `ConstraintError` and re-reads the winning key
   - The in-memory cache is reset on failure so transient IDB errors don't get memoized
6. Section "Threat model":
   - **PROTECTS against:** other browser extensions reading `localStorage`, other OS users on the same machine reading the device's `localStorage` files
   - **DOES NOT PROTECT against:** malicious code running in the same origin, an attacker with full filesystem access to the user's IndexedDB, browser-level compromise, social engineering
7. Section "Pre-encryption draft handling":
   - Plain envelopes from before this branch shipped land in the encrypted slot
   - The load path returns `unencrypted_data` for these (caller surfaces a Spanish error)
   - No silent migration — the user can export a backup before clearing
8. Section "Error code reference":

| Code | Where it surfaces | Spanish message |
|---|---|---|
| `quota_exceeded` | save | "No se pudo guardar el progreso porque el almacenamiento local esta lleno." |
| `serialization_failed` | save | "No se pudo preparar el progreso para guardarlo." |
| `private_browsing` | save/load | "El almacenamiento local esta bloqueado por este navegador o por el modo privado." |
| `crypto_unavailable` | save/load | "No se pudo cifrar el progreso porque Web Crypto no esta disponible en este navegador." |
| `key_unavailable` | save/load | "No se pudo acceder a la llave local de cifrado en este navegador." |
| `encryption_failed` | save | "No se pudo cifrar el progreso para guardarlo." |
| `decryption_failed` | load | "No se pudo descifrar el progreso guardado en este navegador." |
| `unencrypted_data` | load | "El progreso guardado no esta cifrado y no se cargara." |
| `parse_failed` | load | "No se pudo leer el progreso guardado porque esta corrupto." |
| `validation_failed` | load | "El progreso guardado no coincide con el formato esperado." |
| `unsupported_version` | load | "El progreso guardado usa una version incompatible de la aplicacion." |
| `storage_unavailable` | save/load | "El almacenamiento local no esta disponible en este navegador." |
| `not_found` | load | "No se encontro progreso guardado." |

### Task 3.5: Create `docs/pdf-docx-roundtrip.md`

**Files:**
- Create: `docs/pdf-docx-roundtrip.md`

- [ ] **Step 1: Write the file**

Length: ~120 lines. English. Structure:

1. Title and intro: every generated PDF and DOCX carries its source PIAR data so re-importing restores the exact form state.
2. Section "Shared envelope validator":
   - `parsePIARData` in `src/features/piar/lib/portable/piar-import.ts`
   - Used by both importers
   - Routes V2 envelopes through `deepMergeWithDefaultsV2`
3. Section "PDF round-trip":
   - Hidden `piar_app_state` field embedded in the PDF acroform
   - Constants in `src/features/piar/lib/pdf/pdf-payload.ts`
   - Generator: `src/features/piar/lib/pdf/pdf-generator/index.ts` calls `assembleDocument` then embeds the payload at the end
   - Importer: `src/features/piar/lib/pdf/pdf-importer.ts` reads the hidden field and validates the version
   - **Round-trip guarantee:** any PDF generated by this app re-imports cleanly
   - **What is NOT round-tripped:** edits made to the visible PDF in another reader (the importer reads the embedded JSON, not the visible content)
4. Section "DOCX round-trip":
   - Custom XML part with `<piar:document v="2">…</piar:document>` root, embedded in the DOCX zip
   - Generator: `src/features/piar/lib/docx/docx-generator.ts` runs the instrumenters then writes the custom XML
   - Importer: `src/features/piar/lib/docx/docx-importer.ts` reads the custom XML first, falls back to the visible content controls if missing
   - The fallback is lossy — only fields that map to structured Word controls round-trip
   - The user-facing UI shows a warning about this for the PDF flow; the DOCX flow assumes the user keeps the custom XML intact
5. Section "Field manifest (DOCX)":
   - `src/features/piar/lib/docx/docx-field-manifest/` builds the mapping between PIAR field paths and DOCX control ids
   - Manifest is built lazily from the assessment catalogs and the `PIARFormDataV2` schema
   - The reconstruction path uses the manifest in reverse to rebuild data from controls
6. Section "Tests":
   - `tests/features/piar/lib/pdf/pdf-roundtrip.test.ts` — generate → import → assert structural equality
   - `tests/features/piar/lib/docx/docx-roundtrip.test.ts` — same for DOCX
   - `tests/features/piar-import.test.ts` — shared envelope validator across all sources
7. Section "Changing the data model":
   - Update `model/piar.ts`
   - Update `data-utils/deepMergeWithDefaultsV2.ts`
   - Update `pdf-generator/<section>.ts` and the corresponding `docx-instrumenters/<section>.ts`
   - Add the field to the round-trip test fixtures
   - Run `npm test` — the round-trip tests will fail loudly if anything diverges

### Task 3.6: Create `docs/contributing.md`

**Files:**
- Create: `docs/contributing.md`

- [ ] **Step 1: Write the file**

Length: ~120 lines. English. Structure:

1. Title and intro: full developer onboarding. The short version surfaced by GitHub lives at `.github/CONTRIBUTING.md`.
2. Section "Prerequisites":
   - Node 20–24 (per `package.json` engines)
   - npm (lockfile is `package-lock.json`)
3. Section "First-time setup":

```bash
git clone https://github.com/JoseStud/piar-digital-app.git
cd piar-digital-app
npm install
npm run dev
```

   - Open `http://localhost:3000`
4. Section "Scripts":

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server at localhost:3000 |
| `npm run build` | Static export to `out/` plus CSP header generation |
| `npm run lint` | ESLint with `next/core-web-vitals` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest run (single pass) |
| `npm run test:watch` | Vitest watch mode |
| `npm run desktop:dev` | Tauri desktop dev shell |
| `npm run desktop:build` | Tauri desktop release build |

5. Section "Running a single test file":

```bash
npx vitest run tests/features/piar/lib/pdf/pdf-roundtrip.test.ts
```

   - or by name: `npx vitest run -t "round-trip"`
6. Section "Branch naming":
   - `<type>-<short-description>` (mirrors recent history: `codex-encrypt-local-draft-storage`)
   - Types: `feat`, `fix`, `docs`, `chore`, `refactor`
7. Section "Commit message style":
   - Mirror recent commit history
   - Format observed: `<type>(<scope>): <imperative summary>` for new commits, with the exception that very early bootstrapping commits used title case sentences
   - Body: explain *why*, not what (the diff already says what)
   - End with `Co-Authored-By:` if AI-assisted
8. Section "Must pass before opening a PR":

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

9. Section "Where to ask":
   - General questions / bugs: GitHub issues
   - Security: see `.github/SECURITY.md` (do NOT open a public issue)
10. Section "AI tooling":
    - `CLAUDE.md` is a context primer for Claude Code
    - `docs/superpowers/` holds spec/plan documents from AI-assisted brainstorming flows
11. Section "House rules":
    - Field names from the official PIAR template are in Spanish — do not translate
    - Assessment catalog item ids are immutable (see `src/features/piar/content/assessment-catalogs.ts`)
    - Boolean tri-state fields use `null` for "sin respuesta" — never coerce to false

### Task 3.7: Create `docs/testing.md`

**Files:**
- Create: `docs/testing.md`

- [ ] **Step 1: Write the file**

Length: ~100 lines. English. Structure:

1. Title and intro: Vitest 2 + jsdom + React Testing Library.
2. Section "Layout":
   - `tests/` mirrors `src/`
   - `tests/test-utils/` for shared helpers
   - `tests/app/` for full-page smoke tests
   - `vitest.config.mts` excludes `.claude/` and `.superpowers/` to avoid test discovery in worktrees
3. Section "Running":

```bash
npm test                                              # full suite
npm run test:watch                                    # watch mode
npx vitest run tests/features/.../foo.test.ts         # single file
npx vitest run -t "round-trip"                        # by test name
```

4. Section "Smoke vs unit":
   - `tests/app/*.smoke.test.tsx` — full page renders, Next.js routes
   - `tests/features/piar/lib/**/*.test.ts` — pure unit tests for the lib layer
   - `tests/features/piar/components/**/*.test.tsx` — component tests with RTL
5. Section "Form testing patterns":
   - Render a section component with `render(<Section data={mockSlice} onChange={mockOnChange} />)`
   - Drive interactions with `@testing-library/user-event`
   - Assert on the patches passed to `onChange` (not on rendered text)
6. Section "Round-trip tests":
   - `pdf-roundtrip.test.ts` and `docx-roundtrip.test.ts` are the golden-path tests
   - They build a sample `PIARFormDataV2`, generate the file, re-import, and assert structural equality
   - Add a fixture entry whenever you add a new field to the data model
7. Section "Encryption tests":
   - `tests/test-utils/encrypted-progress-storage.ts` mocks IndexedDB and Web Crypto
   - Call `installEncryptedProgressStorageMocks()` in `beforeEach`
   - Call `resetProgressCryptoKeyCacheForTests()` to simulate a fresh tab
8. Section "When to add a test":
   - New field in the data model → round-trip fixture entry
   - New importer error code → load-path test
   - New section component → at least an onChange-contract test
   - Bug fix → regression test that fails before the fix
9. Section "Conventions":
   - Spanish text in tests goes inside template strings; comments stay English
   - Prefer `beforeEach` over module-level setup so tests are isolated
   - Mock at the smallest boundary that gives a deterministic test

### Task 3.8: Create `docs/security.md`

**Files:**
- Create: `docs/security.md`

- [ ] **Step 1: Write the file**

Length: ~80 lines. English. Structure:

1. Title and intro: privacy posture and where to look for the deep version.
2. Section "Privacy posture":
   - No backend
   - No analytics, no telemetry
   - No third-party scripts
   - Lazy chunks load from the same origin only
3. Section "Encryption summary":
   - Drafts are encrypted with AES-256-GCM (link to `persistence-and-encryption.md`)
   - The key is generated in the browser, never leaves
4. Section "CSP":
   - The CSP header is generated at build time by `scripts/generate-csp-headers.mjs`
   - Output: `out/headers.conf` consumed by the bundled `nginx.conf`
   - Default policy is restrictive — same-origin chunks only, no inline scripts
5. Section "What the user has to trust":
   - The shipped JavaScript bundle (audit it before deploying)
   - Their device and browser
   - Their browser extensions
6. Section "What we control":
   - The code you can read in this repo
   - The CSP header template
   - The crypto envelope shape
7. Section "Reporting a vulnerability":
   - Email `support@piar.plus`
   - **Do NOT open a public GitHub issue**
   - Full process: see `.github/SECURITY.md`
8. Section "Compliance scope":
   - This app is a tool for filling out PIAR forms per Decreto 1421 / Anexo 2
   - It is **not** an official Ministerio de Educación product
   - It does **not** certify the user's institutional process

### Task 3.9: Create `docs/release.md`

**Files:**
- Create: `docs/release.md`

- [ ] **Step 1: Write the file**

Length: ~80 lines. English. Structure:

1. Title and intro: how to build, package, and ship the app.
2. Section "Static export":

```bash
npm run build
```

   - Produces `out/` with all static assets
   - Runs `csp:headers` automatically, producing `out/headers.conf`
3. Section "Docker build":

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://piar.example.gov.co \
  --build-arg NEXT_PUBLIC_CONTACT_EMAIL=soporte@piar.example.gov.co \
  -t piar-form .

docker run -p 8080:8080 piar-form
```

   - The container serves the static export with the bundled `nginx.conf`
4. Section "Build args":

| Arg | What it sets |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used in JSON-LD and the manifest |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact email rendered on the landing page |

5. Section "Nginx config":
   - `nginx.conf` is bundled in the Docker image
   - Includes `out/headers.conf` for the generated CSP
   - Listens on 8080
6. Section "Tauri desktop":

```bash
npm run desktop:dev      # development shell
npm run desktop:build    # release build
npm run desktop:icon     # regenerate icons from public/icon-512.png
```

   - The desktop shell embeds the static export and exposes a native save dialog for PIAR exports and bundled template downloads
7. Section "Versioning the data model":
   - Bump `PIAR_DATA_VERSION` in `src/features/piar/model/piar.ts` for breaking changes
   - Add a migration (currently nonexistent — V1 was removed)
   - Update both `pdf-roundtrip.test.ts` and `docx-roundtrip.test.ts` fixtures

### Task 3.10: Shrink `CLAUDE.md` and link to the new docs

**Files:**
- Modify: `CLAUDE.md` (note: this file is at `/home/anxiuser/architecture/CLAUDE.md`, NOT inside the `apps/piar-digital-app` directory — confirm path before editing)

- [ ] **Step 1: Confirm `CLAUDE.md` path**

Run:
```bash
ls -la /home/anxiuser/architecture/CLAUDE.md
ls -la /home/anxiuser/architecture/apps/piar-digital-app/CLAUDE.md 2>/dev/null || echo "no per-app CLAUDE.md"
```

If a per-app `CLAUDE.md` exists, edit that one. Otherwise edit `/home/anxiuser/architecture/CLAUDE.md` only if it is git-tracked inside this repo. **If `CLAUDE.md` is in a parent directory outside this app's git repo, STOP and ask the user — modifying it would touch a file outside the PR scope.**

- [ ] **Step 2: Edit (only if `CLAUDE.md` is in this repo)**

The "Architecture", "Data Flow", "Key Layers", "Component Patterns", and "PIARFormDataV2 Shape" sections move OUT of `CLAUDE.md` and into the new `docs/architecture.md` + `docs/data-model.md`. Replace them with a single short pointer paragraph:

```markdown
## Architecture

See `docs/architecture.md` for the system overview, layer map, mode state
machine, and build pipeline. See `docs/data-model.md` for the full
`PIARFormDataV2` shape and the versioning contract.
```

Keep the "Commands", "Testing", "Domain Context", and "Versioning Contract" sections as-is — they're already in a useful form for AI context priming.

If `CLAUDE.md` is OUTSIDE this app's git scope, skip this step and instead add a note to `docs/README.md` mentioning that `CLAUDE.md` may live at the workspace root.

- [ ] **Step 3: Verify**

Run: `npm run lint`
Expected: zero errors. (Markdown files don't lint, but lint validates that no JS/TS was accidentally changed.)

### Task 3.11: Commit Phase 3

- [ ] **Step 1: Stage**

Run:
```bash
git add docs/ CLAUDE.md 2>/dev/null || git add docs/
git status --short
```

Expected: 8 new files under `docs/`, plus `CLAUDE.md` modified IF it was in scope.

- [ ] **Step 2: Commit**

Run:
```bash
git commit -m "$(cat <<'EOF'
docs: add developer-facing documentation under docs/

Eight new English markdown files aimed at contributors:

- docs/README.md indexes the rest
- architecture.md is the canonical system overview
- data-model.md spells out PIARFormDataV2 and the versioning contract
- persistence-and-encryption.md documents the two-tier storage model
  and the threat model
- pdf-docx-roundtrip.md explains how exports embed source data
- contributing.md is the full developer onboarding (the GitHub-surfaced
  short version is in .github/CONTRIBUTING.md, added in a later commit)
- testing.md documents the Vitest patterns
- security.md and release.md cover the privacy posture and the build
  pipeline

CLAUDE.md is shrunk to a one-paragraph pointer at architecture.md and
data-model.md (if it's in repo scope).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Verify**

Run: `git log --oneline -4 && git status --short`
Expected: working tree clean.

---

## Phase 4 — Commit 4: `.github/` community files

**Goal of this phase:** Boilerplate the `.github/` directory with the standard OSS community files. CI workflow is intentionally NOT included.

### Task 4.1: Create `.github/CONTRIBUTING.md`

**Files:**
- Create: `.github/CONTRIBUTING.md`

- [ ] **Step 1: Write the file**

Length: ~40 lines. English. Content:

```markdown
# Contributing to PIAR Digital

Thanks for considering a contribution.

This is the short version surfaced by GitHub when you open a pull
request. The full developer onboarding lives at
[`docs/contributing.md`](../docs/contributing.md).

## Before you start

- Read [`docs/architecture.md`](../docs/architecture.md) to understand the layer map.
- Read [`docs/data-model.md`](../docs/data-model.md) if your change touches the form shape.
- Read [`docs/persistence-and-encryption.md`](../docs/persistence-and-encryption.md) if your change touches storage.
- Read [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## Must pass before opening a PR

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Commit message style

Mirror the existing history. Format: `<type>(<scope>): <imperative summary>`. Types: `feat`, `fix`, `docs`, `chore`, `refactor`. Explain the **why** in the body, not the **what** (the diff says what).

## Reporting security issues

Do NOT open a public issue. See [`SECURITY.md`](SECURITY.md).
```

### Task 4.2: Create `.github/SECURITY.md`

**Files:**
- Create: `.github/SECURITY.md`

- [ ] **Step 1: Write the file**

Length: ~50 lines. English. Content:

```markdown
# Security Policy

## Supported versions

| Version | Status |
|---|---|
| `main` | Active development |

There are no tagged releases yet.

## Reporting a vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Email: **support@piar.plus**

Please include:

- A description of the vulnerability
- Steps to reproduce
- The affected file(s) or feature
- Your assessment of the impact
- Any proof-of-concept code

## Response expectations

This is a volunteer-maintained project. We will acknowledge reports on a
best-effort basis. We do not commit to a formal SLA.

## Disclosure

We will coordinate public disclosure after a fix is released or after 90
days, whichever is sooner.

## In scope

- Vulnerabilities in the web app's client-side code
- Issues with the AES-256-GCM encryption design or key handling
- CSP misconfigurations in the build pipeline

## Out of scope

- Vulnerabilities in user devices, browsers, or OSes
- Third-party browser extensions
- Social engineering
- The user's own infrastructure
- Issues that require physical access to a user's device

For background on the encryption design, see
[`docs/persistence-and-encryption.md`](../docs/persistence-and-encryption.md).
```

### Task 4.3: Create `.github/CODE_OF_CONDUCT.md`

**Files:**
- Create: `.github/CODE_OF_CONDUCT.md`

- [ ] **Step 1: Write the file**

Length: ~130 lines. English. Use the standard Contributor Covenant 2.1 verbatim. Set the contact line to `support@piar.plus`. The full text is publicly available — copy the canonical version exactly.

The file MUST contain:
- Title: "Contributor Covenant Code of Conduct"
- The "Our Pledge" section
- The "Our Standards" section with positive and negative behaviors
- The "Enforcement Responsibilities" section
- The "Scope" section
- The "Enforcement" section with `support@piar.plus` as the contact
- The "Enforcement Guidelines" section with the four-tier ladder (Correction, Warning, Temporary Ban, Permanent Ban)
- The "Attribution" section pointing to https://www.contributor-covenant.org/version/2/1/code_of_conduct.html

### Task 4.4: Create `.github/CODEOWNERS`

**Files:**
- Create: `.github/CODEOWNERS`

- [ ] **Step 1: Write the file**

Content (exactly):

```
# Default owner for everything in this repo
* @JoseStud
```

### Task 4.5: Create `.github/PULL_REQUEST_TEMPLATE.md`

**Files:**
- Create: `.github/PULL_REQUEST_TEMPLATE.md`

- [ ] **Step 1: Write the file**

Content:

```markdown
## Summary

<!-- 1–3 bullets describing what this PR does -->

## Why

<!-- The problem this solves. Explain the why; the diff shows the what. -->

## Test plan

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`

## Checklist

- [ ] If this changes the data model, `docs/data-model.md` is updated.
- [ ] If this changes encryption or storage, `docs/persistence-and-encryption.md` is updated and a maintainer has reviewed the crypto.
- [ ] If this changes PDF or DOCX output, both round-trip tests still pass.
- [ ] If this changes user-facing copy, the strings stay Spanish.
- [ ] No real student data appears in tests, fixtures, or screenshots.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full process.
```

### Task 4.6: Create `.github/ISSUE_TEMPLATE/config.yml`

**Files:**
- Create: `.github/ISSUE_TEMPLATE/config.yml`

- [ ] **Step 1: Write the file**

Content (exactly):

```yaml
blank_issues_enabled: false
contact_links:
  - name: Usage questions and FAQ
    url: https://github.com/JoseStud/piar-digital-app/wiki/Preguntas-frecuentes
    about: Common usage questions are answered in the wiki FAQ.
  - name: Security vulnerability
    url: https://github.com/JoseStud/piar-digital-app/blob/main/.github/SECURITY.md
    about: Do NOT open a public issue. Email support@piar.plus instead.
```

### Task 4.7: Create `.github/ISSUE_TEMPLATE/bug_report.yml`

**Files:**
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`

- [ ] **Step 1: Write the file**

Content:

```yaml
name: Bug report
description: Report a reproducible bug in the PIAR Digital app
title: "[bug] "
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for filing a bug. Please do **not** include real student data
        in this issue. Use placeholder names and fake document numbers.
  - type: textarea
    id: description
    attributes:
      label: Description
      description: A clear, concise description of what the bug is.
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
      placeholder: |
        1. Open the app
        2. Click "Empezar nuevo"
        3. ...
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: Actual behavior
    validations:
      required: true
  - type: input
    id: browser
    attributes:
      label: Browser and version
      placeholder: e.g. Firefox 124, Chrome 130, Safari 17
    validations:
      required: true
  - type: input
    id: os
    attributes:
      label: Operating system
      placeholder: e.g. Windows 11, macOS 14, Ubuntu 22.04
    validations:
      required: true
  - type: textarea
    id: console
    attributes:
      label: Console errors or logs
      description: Open the browser DevTools console and paste any errors here.
      render: shell
  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots
      description: Drag images here. Redact any real student data.
```

### Task 4.8: Create `.github/ISSUE_TEMPLATE/feature_request.yml`

**Files:**
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`

- [ ] **Step 1: Write the file**

Content:

```yaml
name: Feature request
description: Suggest a new feature or improvement
title: "[feature] "
labels: ["enhancement", "triage"]
body:
  - type: textarea
    id: problem
    attributes:
      label: What problem are you trying to solve?
      description: Describe the situation that prompted this idea.
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: Proposed solution
      description: How would the app behave differently?
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives considered
      description: Other approaches you thought about and why you ruled them out.
  - type: textarea
    id: beneficiaries
    attributes:
      label: Who benefits?
      description: Docentes, equipo de apoyo, IT institucional, evaluadores, others?
    validations:
      required: true
  - type: input
    id: decreto-ref
    attributes:
      label: Related Decreto/Anexo reference (optional)
      placeholder: e.g. Decreto 1421 de 2017, Anexo 2, sección X
```

### Task 4.9: Create `.github/ISSUE_TEMPLATE/question.yml`

**Files:**
- Create: `.github/ISSUE_TEMPLATE/question.yml`

- [ ] **Step 1: Write the file**

Content:

```yaml
name: Question
description: Ask a usage or development question
title: "[question] "
labels: ["question", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Before opening a question issue, please check the
        [wiki FAQ](https://github.com/JoseStud/piar-digital-app/wiki/Preguntas-frecuentes).
        Many common questions are answered there.
  - type: textarea
    id: question
    attributes:
      label: Your question
    validations:
      required: true
  - type: textarea
    id: tried
    attributes:
      label: What have you already tried?
      description: Link to wiki FAQ entries you've checked, code you've looked at, etc.
    validations:
      required: true
  - type: textarea
    id: expected-answer
    attributes:
      label: What kind of answer would help?
      description: A code pointer? A worked example? A docs section?
```

### Task 4.10: Verify and commit Phase 4

- [ ] **Step 1: Verify YAML templates parse**

Run: `npm run lint`
Expected: zero errors. (Lint won't lint YAML, but it confirms no source files were accidentally touched.)

Manually eyeball each `.yml` file for indentation. The form schema is sensitive to YAML indentation — every `body:` item must be indented uniformly.

- [ ] **Step 2: Stage**

Run:
```bash
git add .github/
git status --short
```

Expected: 9 new files under `.github/`.

- [ ] **Step 3: Commit**

Run:
```bash
git commit -m "$(cat <<'EOF'
chore: add .github community files (no CI workflow)

Boilerplates the standard OSS community files:

- CONTRIBUTING.md (short, GitHub-surfaced; full version is in docs/)
- SECURITY.md with support@piar.plus as the disclosure contact
- CODE_OF_CONDUCT.md (Contributor Covenant 2.1)
- CODEOWNERS (single owner: @JoseStud)
- PULL_REQUEST_TEMPLATE.md
- ISSUE_TEMPLATE/{config,bug_report,feature_request,question}.yml

Blank issues are disabled and the issue config redirects general
questions to the wiki FAQ. CI workflow is intentionally not included
in this PR.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Verify**

Run: `git log --oneline -5 && git status --short`
Expected: working tree clean.

---

## Phase 5 — Commit 5: `wiki/` markdown

**Goal of this phase:** Create the Spanish-language wiki content as a `wiki/` folder in the repo, plus a `wiki/README.md` (English) explaining how to push it to the GitHub wiki repo.

### Task 5.1: Create `wiki/README.md`

**Files:**
- Create: `wiki/README.md`

- [ ] **Step 1: Write the file**

Length: ~30 lines. English. Content:

```markdown
# wiki/ — source for the GitHub wiki

This folder is the canonical source for the project's GitHub wiki at
`https://github.com/JoseStud/piar-digital-app/wiki`. Wiki edits made
through GitHub's web UI will be overwritten on the next sync from this
folder, so changes go through PRs against this folder.

## Layout

GitHub wiki convention: every top-level `.md` file becomes a wiki page.
The filename (with hyphens) becomes the page name. `Home.md` is the
landing page. `_Sidebar.md` is shown on every page.

All page content is in **Spanish** because the audience is Colombian
educators, IT staff, and evaluators. This README is in English because
it is for developers maintaining the wiki source.

## Pushing to the live wiki

```bash
# 1. Clone the wiki repo (one-time setup)
git clone https://github.com/JoseStud/piar-digital-app.wiki.git ../piar-wiki

# 2. Sync the markdown files
rsync -av --delete --exclude README.md wiki/ ../piar-wiki/

# 3. Commit and push from the wiki repo
cd ../piar-wiki
git add .
git commit -m "Sync wiki content from main repo"
git push
```

A small `scripts/sync-wiki.sh` script could automate this — TODO if
the wiki update cadence becomes high.

## Image references

Pages reference images like `![alt](images/foo.png)` for screenshots
that have not yet been added. The image filenames are listed in a TODO
block at the bottom of each page that needs them.
```

### Task 5.2: Create `wiki/_Sidebar.md`

**Files:**
- Create: `wiki/_Sidebar.md`

- [ ] **Step 1: Write the file**

Length: ~20 lines. Spanish. Content:

```markdown
**PIAR Digital**

* [Inicio](Home)
* [¿Qué es el PIAR?](Que-es-PIAR)
* [Privacidad y seguridad](Privacidad-y-seguridad)
* [Cómo usar la aplicación](Como-usar-la-aplicacion)
* [Preguntas frecuentes](Preguntas-frecuentes)
* [Despliegue para instituciones](Despliegue-para-instituciones)
* [Reportar un problema](Reportar-un-problema)

---

[Repositorio en GitHub](https://github.com/JoseStud/piar-digital-app)
```

### Task 5.3: Create `wiki/Home.md`

**Files:**
- Create: `wiki/Home.md`

- [ ] **Step 1: Write the file**

Length: ~60 lines. Spanish. Structure:

1. Title: `# PIAR Digital`
2. Subtitle: "Plan Individual de Ajustes Razonables, en su navegador."
3. One-paragraph intro: a free, open-source web app for filling out the official PIAR form (Decreto 1421, Anexo 2). Everything happens in the browser. No accounts, no servers, no telemetry.
4. Section "¿Para quién es esto?":
   - Tres bullets: docentes, equipos de apoyo psicopedagógico, IT institucional
5. Section "Lo que esta aplicación hace":
   - Permite diligenciar el PIAR completo en el navegador
   - Guarda automáticamente el progreso (cifrado en su dispositivo)
   - Genera el PIAR como PDF y como DOCX editable
   - Permite reimportar PDF/DOCX para continuar editando
   - Funciona sin conexión a internet una vez cargada
6. Section "Lo que esta aplicación NO hace":
   - No envía sus datos a ningún servidor
   - No requiere crear una cuenta
   - No sustituye el formato oficial del Ministerio de Educación
   - No certifica el cumplimiento legal del proceso de su institución
   - No reemplaza la firma física donde esta sea requerida
7. Section "Empiece aquí":
   - Lista de enlaces a las páginas principales del wiki, breve descripción de cada una
8. Footer "Ver también": enlaces a `Que-es-PIAR`, `Privacidad-y-seguridad`, `Como-usar-la-aplicacion`

### Task 5.4: Create `wiki/Que-es-PIAR.md`

**Files:**
- Create: `wiki/Que-es-PIAR.md`

- [ ] **Step 1: Write the file**

Length: ~80 lines. Spanish. Structure:

1. Title: `# ¿Qué es el PIAR?`
2. Section "El instrumento":
   - El PIAR (Plan Individual de Ajustes Razonables) es la herramienta oficial colombiana para la atención educativa de estudiantes con discapacidad
   - Lo establece el Decreto 1421 de 2017 del Ministerio de Educación Nacional
   - El formato concreto está en el Anexo 2 del Decreto
3. Section "¿Quién lo diligencia?":
   - El equipo pedagógico de la institución educativa
   - Con apoyo del personal de orientación, los acudientes, y el estudiante cuando sea posible
4. Section "¿Cuándo se diligencia?":
   - Al ingresar un estudiante con discapacidad o al detectarla durante el año escolar
   - Se revisa periódicamente (sección "Fecha próxima revisión" en el formulario)
5. Section "¿Qué contiene el formulario?":
   - Lista breve de las secciones que esta aplicación cubre: identificación, entornos (salud, hogar, educativo), valoración pedagógica, competencias y dispositivos, descripción de habilidades, estrategias y acciones, ajustes razonables, firmas, acta de acuerdo
6. Section "Aclaración importante":
   - Esta aplicación es **una herramienta** para llenar el formulario, no un producto oficial del Ministerio
   - Los documentos generados deben revisarse y firmarse según el proceso institucional
   - Esta aplicación no certifica cumplimiento del Decreto 1421
7. Section "¿Reemplaza al formato oficial?":
   - No. Genera el mismo formato oficial (con los mismos campos del Anexo 2) en una versión digital editable
8. Footer "Ver también": enlaces a `Home`, `Como-usar-la-aplicacion`, `Privacidad-y-seguridad`

### Task 5.5: Create `wiki/Privacidad-y-seguridad.md`

**Files:**
- Create: `wiki/Privacidad-y-seguridad.md`

- [ ] **Step 1: Write the file**

Length: ~100 lines. Spanish. Structure:

1. Title: `# Privacidad y seguridad`
2. One-paragraph intro: este documento explica qué hace la aplicación con sus datos y qué no hace.
3. Section "Sus datos no salen del navegador":
   - Toda la información del PIAR se queda en su computador
   - No hay un servidor que reciba los datos
   - No hay analítica, ni seguimiento, ni cookies de terceros
4. Section "Cifrado local":
   - Los borradores guardados automáticamente se cifran con AES-256-GCM (un estándar reconocido)
   - La llave de cifrado se genera en su navegador la primera vez que abre la aplicación
   - Esa llave nunca sale de su dispositivo
   - Si borra los datos del navegador, la llave también desaparece (y los borradores ya no se pueden recuperar)
5. Section "¿Quién puede ver los datos?":
   - Cualquier persona con acceso físico a su computador y a su sesión de usuario
   - Cualquier programa que se ejecute con sus permisos en el computador (incluyendo malware)
   - Otras pestañas o extensiones del MISMO navegador, dentro del MISMO dominio de la aplicación
6. Section "¿Quién NO puede ver los datos?":
   - El equipo que desarrolla esta aplicación
   - Anthropic ni ninguna otra empresa de IA
   - Cualquier servidor de internet
   - Su proveedor de internet (más allá del momento en que carga la aplicación)
   - Otros usuarios del mismo computador que tengan cuentas de usuario distintas
7. Section "Recomendaciones para uso institucional":
   - En equipos compartidos, use el modo "incógnito" / "navegación privada" (la aplicación funciona allí también)
   - Cierre sesión del computador cuando termine
   - Use la opción **"Limpiar formulario"** si el equipo va a quedar accesible a otras personas
   - Exporte un respaldo (PDF o DOCX) antes de limpiar — los datos cifrados borrados NO se pueden recuperar
8. Section "Cómo borrar todo":
   - Botón "Limpiar formulario" en la pantalla principal
   - O borrar los datos de sitio del navegador (Settings → Privacy → Clear data)
9. Section "Reportar un problema de seguridad":
   - Enlace a `Reportar-un-problema`
10. Footer "Ver también": enlaces a `Home`, `Que-es-PIAR`, `Reportar-un-problema`

### Task 5.6: Create `wiki/Como-usar-la-aplicacion.md`

**Files:**
- Create: `wiki/Como-usar-la-aplicacion.md`

- [ ] **Step 1: Write the file**

Length: ~120 lines. Spanish. Structure:

1. Title: `# Cómo usar la aplicación`
2. One-paragraph intro: paso a paso para diligenciar un PIAR completo desde cero o para continuar uno empezado.
3. Section "1. Abrir la aplicación":
   - Navegue a la URL pública (cuando exista una instancia hospedada) o ejecute localmente desde el repositorio
   - `![Pantalla de inicio](images/inicio.png)`
4. Section "2. Empezar nuevo o restaurar":
   - Si es la primera vez: clic en "Empezar nuevo"
   - Si tiene un borrador guardado: la aplicación pregunta si quiere restaurarlo
   - Si tiene un PIAR exportado anteriormente: arrastre el archivo PDF o DOCX a la zona de carga
   - `![Diálogo de restauración](images/restaurar.png)`
5. Section "3. Diligenciar el formulario":
   - El formulario está dividido en secciones (identificación, entornos, valoración, etc.)
   - Use la barra lateral para navegar entre secciones
   - Cada cambio se guarda automáticamente cada medio segundo (verá un indicador "guardado")
   - `![Barra lateral de progreso](images/progreso.png)`
6. Section "4. Campos especiales":
   - Botones "Sí / No / Sin respuesta": son tri-estado, "Sin respuesta" es válido y es el valor por omisión
   - Tablas de filas fijas (ajustes razonables, firmas docentes, actividades del acta): use los botones de cada fila para diligenciar
   - Listas de chequeo (competencias y dispositivos): marque cada ítem por separado
7. Section "5. Generar el archivo":
   - Cuando termine, vaya a la sección de descarga
   - Clic en "Generar DOCX editable" o "Generar PDF"
   - El archivo se descarga al equipo
   - `![Botones de descarga](images/descarga.png)`
8. Section "6. Continuar después":
   - Cierre la pestaña — el progreso queda guardado
   - Vuelva a abrir la aplicación más tarde y elija "Restaurar"
   - O abra el PDF/DOCX exportado en otro computador para continuar allí
9. Section "Consejos":
   - **Exporte respaldos** antes de cualquier acción destructiva (limpiar formulario, cerrar el navegador en un equipo compartido, terminar el día de trabajo)
   - **No use el PDF como fuente editable**: el PDF guarda una copia recuperable, pero la aplicación no lee cambios hechos sobre el PDF visible
   - **El DOCX editable** sí permite continuar trabajando en Word y reimportar
10. Section "¿Qué hacer si el navegador se cierra inesperadamente?":
    - La aplicación guarda una copia de respaldo "de emergencia" durante el cierre
    - Al volver a abrir, esa copia se usa automáticamente si está más reciente que el guardado normal
11. Section "DOCX vs. PDF":
    - **DOCX editable**: lo puede abrir y editar en Word; la aplicación lo puede reimportar después
    - **PDF**: documento final / respaldo portable; la aplicación lo puede reimportar pero no lee cambios visibles hechos en otro lector
12. Section "Imágenes pendientes (TODO)":
    - `images/inicio.png` — pantalla de inicio
    - `images/restaurar.png` — diálogo de restauración
    - `images/progreso.png` — barra lateral con secciones
    - `images/descarga.png` — botones de generar PDF/DOCX
13. Footer "Ver también": enlaces a `Home`, `Preguntas-frecuentes`, `Privacidad-y-seguridad`

### Task 5.7: Create `wiki/Preguntas-frecuentes.md`

**Files:**
- Create: `wiki/Preguntas-frecuentes.md`

- [ ] **Step 1: Write the file**

Length: ~80 lines. Spanish. Structure:

1. Title: `# Preguntas frecuentes`
2. Format: question as `### `, answer as a paragraph or short list.

Questions to include verbatim:

- `### ¿Necesito conexión a internet?`
  Solo para cargar la aplicación la primera vez. Una vez cargada en el navegador, puede diligenciar y exportar sin conexión.

- `### ¿Mis datos se envían a un servidor?`
  No. Toda la información se queda en su navegador. Vea [Privacidad y seguridad](Privacidad-y-seguridad) para más detalles.

- `### ¿Puedo usarlo sin instalar nada?`
  Sí. Abra el enlace en cualquier navegador moderno (Firefox, Chrome, Edge, Safari) y puede empezar a diligenciar de inmediato.

- `### ¿Funciona en celular o tableta?`
  Funciona, pero está optimizado para pantalla de escritorio. En celular el formulario es muy largo y la experiencia es incómoda. Recomendamos usar un computador o una tableta grande.

- `### ¿Puedo continuar un PIAR que empecé en otro computador?`
  Sí. En el primer computador, exporte el PIAR como DOCX o PDF. En el segundo computador, abra la aplicación y arrastre ese archivo a la zona de carga; el formulario se restaura con todos los datos.

- `### Si limpio el formulario, ¿puedo recuperar los datos?`
  No. La opción "Limpiar formulario" borra el progreso cifrado del navegador y no se puede deshacer. Por eso la aplicación le ofrece exportar un respaldo justo antes de limpiar — úselo siempre.

- `### ¿Cuál es la diferencia entre el PDF y el DOCX?`
  El **DOCX editable** es para seguir trabajando en Word y luego reimportar; el **PDF** es un documento final que también guarda los datos para reimportar pero no acepta ediciones visibles desde otros lectores. En la mayoría de los casos use DOCX para borradores y PDF para el documento que va a archivar o imprimir.

- `### ¿Esta aplicación es oficial del Ministerio de Educación?`
  No. Es una herramienta de código abierto para facilitar el diligenciamiento. Genera el mismo formato oficial del Anexo 2 del Decreto 1421, pero no es un producto del Ministerio y no certifica el cumplimiento legal del proceso institucional.

- `### ¿Es gratis?`
  Sí. El código es abierto bajo la licencia GPL-3.0 y la aplicación es de uso libre.

- `### ¿Cómo reporto un error o pido ayuda?`
  Vea [Reportar un problema](Reportar-un-problema).

3. Footer "Ver también": enlaces a `Home`, `Como-usar-la-aplicacion`, `Reportar-un-problema`

### Task 5.8: Create `wiki/Despliegue-para-instituciones.md`

**Files:**
- Create: `wiki/Despliegue-para-instituciones.md`

- [ ] **Step 1: Write the file**

Length: ~100 lines. Spanish. Structure:

1. Title: `# Despliegue para instituciones`
2. One-paragraph intro: para personal IT de Secretarías de Educación o instituciones educativas que quiera hospedar esta aplicación o distribuirla a sus docentes.
3. Section "Tres opciones de despliegue":
   - **Usar una instancia pública existente** (cuando exista — consulte el README del repositorio para conocer las instancias hospedadas)
   - **Hospedaje propio (estático)**: la aplicación es estática, cualquier servidor web la puede servir. Hay una imagen Docker lista en el repositorio.
   - **Distribución como aplicación de escritorio**: existe un build con Tauri que produce instaladores nativos para Windows / macOS / Linux. Puede distribuirlo internamente como cualquier otro instalador.
4. Section "Requisitos del servidor":
   - Disco: ~5 MB para la aplicación estática
   - Memoria: mínima (no hay procesamiento server-side)
   - Red: solo HTTPS hacia los usuarios; ninguna conexión saliente requerida en tiempo de ejecución
5. Section "Configuración para `.gov.co`":
   - HTTPS obligatorio (use Let's Encrypt o el certificado oficial de la entidad)
   - El header CSP (Content-Security-Policy) se genera durante el build y queda en `out/headers.conf`; configúrelo en su servidor web (la imagen Docker lo hace automáticamente con nginx)
   - Dominio: cualquiera de su entidad
6. Section "Detalles técnicos":
   - Para los pasos de build concretos (`npm run build`, `docker build`, etc.) consulte el [archivo `docs/release.md`](https://github.com/JoseStud/piar-digital-app/blob/main/docs/release.md) en el repositorio
7. Section "Seguridad":
   - La aplicación es client-side: el servidor solo entrega archivos estáticos
   - Ningún dato del PIAR pasa por el servidor en ningún momento
   - Vea [Privacidad y seguridad](Privacidad-y-seguridad)
8. Section "Soporte":
   - Para problemas técnicos: GitHub issues en el repositorio
   - Para vulnerabilidades de seguridad: vea [Reportar un problema](Reportar-un-problema)
9. Footer "Ver también": enlaces a `Home`, `Privacidad-y-seguridad`, `Reportar-un-problema`

### Task 5.9: Create `wiki/Reportar-un-problema.md`

**Files:**
- Create: `wiki/Reportar-un-problema.md`

- [ ] **Step 1: Write the file**

Length: ~50 lines. Spanish. Structure:

1. Title: `# Reportar un problema`
2. Section "Para errores (bugs)":
   - Abra un issue en el repositorio: https://github.com/JoseStud/piar-digital-app/issues/new/choose
   - Use la plantilla "Bug report"
   - **Importante**: nunca incluya datos reales de estudiantes en su reporte. Use nombres ficticios.
3. Section "Para vulnerabilidades de seguridad":
   - **NO abra un issue público.** Los issues son visibles para cualquier persona y eso pone en riesgo a otros usuarios.
   - Envíe un correo a: `support@piar.plus`
   - La política completa está en [SECURITY.md](https://github.com/JoseStud/piar-digital-app/blob/main/.github/SECURITY.md)
4. Section "Para preguntas generales":
   - Primero revise [Preguntas frecuentes](Preguntas-frecuentes)
   - Si su pregunta no está allí, abra un issue con la plantilla "Question"
5. Section "Para sugerencias o ideas":
   - Abra un issue con la plantilla "Feature request"
6. Section "Sobre los tiempos de respuesta":
   - Este es un proyecto mantenido por voluntarios. Las respuestas pueden tardar.
   - Pull requests con correcciones son bienvenidos.
7. Footer "Ver también": enlaces a `Home`, `Privacidad-y-seguridad`

### Task 5.10: Verify and commit Phase 5

- [ ] **Step 1: Verify**

Run: `npm run lint`
Expected: zero errors. (Markdown isn't linted; this is a "no source files broke" check.)

Manually skim each wiki page to confirm the cross-links use the right wiki page names (the filename without `.md`).

- [ ] **Step 2: Stage**

Run:
```bash
git add wiki/
git status --short
```

Expected: 9 new files under `wiki/`.

- [ ] **Step 3: Commit**

Run:
```bash
git commit -m "$(cat <<'EOF'
docs(wiki): add Spanish wiki source pages

Adds the source markdown for the GitHub wiki under wiki/, with a
README explaining how to push the content to the wiki repo. All page
content is in Spanish; the README is in English.

Pages: Home, Que-es-PIAR, Privacidad-y-seguridad,
Como-usar-la-aplicacion, Preguntas-frecuentes,
Despliegue-para-instituciones, Reportar-un-problema, plus _Sidebar.

Screenshots are referenced as TODO placeholders — image files are not
included in this commit.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Verify**

Run: `git log --oneline -6 && git status --short`
Expected: working tree clean.

---

## Phase 6 — Commit 6: README polish

**Goal of this phase:** Expand the existing `README.md` from 51 lines to a properly-shaped landing page for the GitHub repo.

### Task 6.1: Rewrite `README.md`

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Read the existing README**

Run: read `/home/anxiuser/architecture/apps/piar-digital-app/README.md` end-to-end to know what's already there.

- [ ] **Step 2: Replace the file with the new structure**

The new README content (English):

```markdown
# PIAR Digital

> Fill out Colombia's PIAR (Plan Individual de Ajustes Razonables) form in your browser, without sending data anywhere.

**[GPL-3.0]** **[Node 20+]** **[Client-side only]**

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

- A backend service or SaaS — there is no server
- An official Ministerio de Educación product
- A multi-user database — every browser is independent
- A certification of your institution's PIAR process

## Tech Stack

- Next.js 14 with `output: 'export'` (static export)
- React 18 + TypeScript 5
- Tailwind CSS 3
- pdf-lib (PDF generation)
- jszip (DOCX generation)
- Vitest 2 + jsdom + React Testing Library
- Optional Tauri 2 desktop shell
- Node 20–24

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

| If you want to… | Look at |
|---|---|
| Use the app | The [project wiki](https://github.com/JoseStud/piar-digital-app/wiki) (Spanish) |
| Understand the architecture | [`docs/architecture.md`](docs/architecture.md) |
| Contribute code | [`docs/contributing.md`](docs/contributing.md) and [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) |
| Deploy this | [`docs/release.md`](docs/release.md) |
| Report a vulnerability | [`.github/SECURITY.md`](.github/SECURITY.md) |
| Use AI assistants in this repo | [`CLAUDE.md`](CLAUDE.md) |

## Privacy & security

- **No backend.** PIAR data never leaves the browser. There is no server-side form processing, no analytics, no telemetry, no third-party scripts at runtime.
- **Encrypted drafts.** Autosaved progress is encrypted with AES-256-GCM using a non-extractable device key generated in your browser. The key never leaves your device.
- **Client-side exports.** PDF and DOCX generation happens entirely in your browser. The generated files embed the source form data so re-importing restores the exact state.

For the full threat model, see [`docs/persistence-and-encryption.md`](docs/persistence-and-encryption.md) and [`docs/security.md`](docs/security.md).

## Project status

Active development. The data model is at version 2 (`PIAR_DATA_VERSION = 2`); breaking changes bump the version. Encryption is enabled for new drafts. There are no tagged releases yet — track `main`.

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
```

- [ ] **Step 3: Verify**

Run: `npm run lint`
Expected: zero errors.

### Task 6.2: Commit Phase 6

- [ ] **Step 1: Stage**

Run:
```bash
git add README.md
git status --short
```

Expected: one line, `M README.md`.

- [ ] **Step 2: Commit**

Run:
```bash
git commit -m "$(cat <<'EOF'
docs(readme): expand README with privacy summary and docs pointers

Extends the project README with: tagline, plain-text status badges,
"what this is / what this is not" tables, a documentation pointer
table linking to the new docs/, wiki, and .github/ surfaces, and a
prominent privacy & security summary that calls out the AES-256-GCM
encryption.

Screenshots are referenced as TODO placeholders.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Verify**

Run: `git log --oneline -7 && git status --short`
Expected: working tree clean.

---

## Phase 7 — Final verification gate

### Task 7.1: Full pre-PR check

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: zero errors. Warning count matches baseline from Task 0.2.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 3: Tests**

Run: `npm test`
Expected: total count matches baseline. All pass.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds. `out/` directory regenerated. `out/headers.conf` present.

If any of these fail, do not proceed. Diagnose root cause, fix on a follow-up commit on this same branch (do NOT amend), re-run.

### Task 7.2: Stop and report to the user

- [ ] **Step 1: Show the final commit log**

Run: `git log --oneline -9`

Expected output (commit hashes will differ):
```
<hash> docs(readme): expand README with privacy summary and docs pointers
<hash> docs(wiki): add Spanish wiki source pages
<hash> chore: add .github community files (no CI workflow)
<hash> docs: add developer-facing documentation under docs/
<hash> docs(comments): add file headers, JSDoc, and inline `why:` comments
<hash> feat(persistence): encrypt local drafts and document the design
<hash> docs: add onboarding documentation and comments implementation plan
<hash> docs: add onboarding documentation and comments design spec
<hash> Encrypt local drafts and template exports
```

- [ ] **Step 2: Show the diff statistics**

Run:
```bash
git diff --stat 3cf9e07..HEAD
```

(`3cf9e07` is the commit before this work started, per Phase 0 baseline.)

- [ ] **Step 3: Suggest a PR title and body to the user**

Print to the user (do not actually run `gh pr create`):

> Branch is ready. Suggested PR title:
>
> `Onboarding documentation, code comments, and encrypted local drafts`
>
> Suggested PR body:
>
> ## Summary
> - Lands the in-progress AES-256-GCM encryption for local drafts as a clean commit with comments
> - Adds heavy code comments (file headers, JSDoc, inline `why:`) across the source tree
> - Adds developer docs under `docs/`, Spanish wiki source under `wiki/`, and the standard `.github/` community files
> - Polishes the README with a docs pointer table and a privacy summary
>
> ## Test plan
> - [x] `npm run lint`
> - [x] `npm run typecheck`
> - [x] `npm test`
> - [x] `npm run build`
>
> ## Notes for the reviewer
> - Six commits, each one a different *kind* of change — read them in order
> - No CI workflow added (out of scope by design)
> - Wiki content lives in `wiki/` and ships in this PR; pushing to the GitHub wiki repo is a separate manual step (see `wiki/README.md`)
> - The encryption work itself is comments-only relative to the existing branch state — no behavior changes layered on top

The user opens the PR themselves. Do NOT run `gh pr create` from the plan.

---

## Self-review notes

This plan covers every section of the spec at `docs/superpowers/specs/2026-04-07-onboarding-docs-and-comments-design.md`:

- **Decisions table:** baked into Phase 0–7 (commit ordering, comment density, language splits, .github file list, README structure)
- **Out-of-scope items:** no CI workflow task, no wiki push step, no migration tasks, no screenshot files, no `gh pr create`
- **Commit 1 (Encryption polish):** Phase 1, Tasks 1.1–1.8 — every comment text is exact
- **Commit 2 (Architecture comments):** Phase 2, Tasks 2.1–2.22 — high-density files have exact text, leaf files use one-line headers in tables
- **Commit 3 (`docs/`):** Phase 3, Tasks 3.1–3.11 — each new file specified by section structure + length budget + key facts
- **Commit 4 (`.github/`):** Phase 4, Tasks 4.1–4.10 — file content provided in full for each
- **Commit 5 (`wiki/`):** Phase 5, Tasks 5.1–5.10 — Spanish content specified by section structure + key bullets
- **Commit 6 (README):** Phase 6, Tasks 6.1–6.2 — full new README content provided
- **Verification:** per-phase verification in each commit task plus a final gate at Phase 7
- **Rollback:** baked into the commit boundaries (each commit is independently revertable)
- **Open items from spec:** none — all decisions resolved

Two intentional "look at the file first" placeholders exist (Task 2.10 docx-shared file headers and Task 3.10 CLAUDE.md location). Both are necessary because the implementer needs the actual file contents to confirm the proposed text fits, and Task 3.10 because the file may live outside the app's git repo and that needs verification before editing.

The plan does NOT pre-write every doc page's full prose because that would produce a 6000-line plan and reduce implementation to copy-pasting. Instead, doc and wiki pages have section structures, length budgets, key facts that must appear, and any verbatim code/table snippets — the same level of detail a careful human spec gives a writer.
