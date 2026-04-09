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

## Maintainer controls

- Maintainers with GitHub access and any future store-publisher or signing access must use multi-factor authentication.
- External contributions merge through pull requests reviewed by the repository owner.
- Trusted maintainer pushes to the default branch remain allowed while the repository is single-maintainer.
- Changes to release, signing, or provenance files (`.signpath/**`, `docs/code-signing-policy.md`, `docs/release.md`, `PROVENANCE.md`) require owner review.

## Commit message style

Mirror the existing history. Format: `<type>(<scope>): <imperative summary>`. Types: `feat`, `fix`, `docs`, `chore`, `refactor`. Explain the **why** in the body, not the **what** (the diff says what).

## Reporting security issues

Do NOT open a public issue. See [`SECURITY.md`](SECURITY.md).
