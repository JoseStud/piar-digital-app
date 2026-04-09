# Testing

The test stack is Vitest 2 with `jsdom`, React Testing Library, and an accessibility pass built around `vitest-axe` (with an `axe-core` fallback in the shared test helper so the tests still run if the matcher package is temporarily unavailable). Tests are organized to mirror the source tree so it is easy to find the test for a given module.

## Layout

- `tests/` mirrors `src/`
- `tests/test-utils/` holds shared fixtures and mocks
- `tests/app/` holds full-page smoke tests
- `tests/a11y/` holds axe-based accessibility coverage for the main sections and shared form chrome
- `vitest.config.mts` excludes hidden assistant-workspace folders such as `.claude/` and `.superpowers/`

## Running

```bash
npm test
npm run test:watch
npx vitest run tests/features/.../foo.test.ts
npx vitest run -t "round-trip"
```

Use `npm test` for the full suite, a single file for focused debugging, and `-t` when the behavior is easier to target by test name than by file.

Vitest runs with fork isolation and `fileParallelism: true`. If you add or expand smoke tests that depend on lazy chunks, file uploads, or long DOCX/PDF flows, give them explicit per-test timeouts instead of assuming Testing Library's default `1s` wait is enough under full parallel load.

## Smoke vs unit

- `tests/app/*.smoke.test.tsx` cover route-level behavior and end-to-end page flows
- `tests/features/piar/lib/**/*.test.ts` cover pure library code
- `tests/features/piar/components/**/*.test.tsx` cover React components with RTL
- `tests/a11y/*.test.tsx` cover route-level and section-level semantic/accessibility regressions with axe

## Form patterns

Render a section component with mock slice data and a mock `onChange` handler. Drive interactions with `@testing-library/user-event`, then assert on the patch passed to `onChange`, not on incidental DOM text.

## Round-trip tests

`pdf-roundtrip.test.ts` and `docx-roundtrip.test.ts` are the golden-path tests. They build a sample `PIARFormDataV2`, generate a file, re-import it, and assert structural equality. Add a fixture entry whenever a new data-model field is introduced.

## DOCX template fixture

The public repository does not bundle the official DOCX template. Template-dependent DOCX tests therefore use a trusted local fixture instead of a checked-in asset.

- Preferred setup: export `PIAR_TEST_DOCX_TEMPLATE_PATH=/absolute/path/to/new_template.docx`
- In the shared parent workspace, the tests also auto-detect `~/architecture/new_template.docx`
- If no template fixture is configured, template-dependent DOCX suites are skipped instead of failing unrelated work

Use the explicit env var in CI or whenever you work outside the parent workspace.

## Encryption tests

`tests/test-utils/encrypted-progress-storage.ts` mocks IndexedDB and Web Crypto for draft-storage tests. Call `installEncryptedProgressStorageMocks()` in `beforeEach`, and call `resetProgressCryptoKeyCacheForTests()` when you need to simulate a fresh tab.

## Accessibility tests

`tests/a11y/axe-setup.ts` exports `renderAndCheck()`, which renders a React tree and asserts that axe reports no violations. Use it for shared form primitives, section components, and navigation surfaces such as `ProgressNav` and `SaveStatusBanner`.

## When to add a test

- New data-model field: add a round-trip fixture entry
- New importer error code: add a load-path test
- New section component: add an `onChange` contract test
- New shared form chrome or a significant section-layout change: add or extend an accessibility test
- Bug fix: add a regression test that fails before the fix

## Conventions

- Keep Spanish text in template strings; keep comments in English
- Prefer `beforeEach` over module-level setup
- Mock at the smallest boundary that still gives a deterministic test
