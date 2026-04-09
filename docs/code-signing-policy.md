# Code signing policy

Free code signing provided by [SignPath.io](https://about.signpath.io), certificate by [SignPath Foundation](https://signpath.org/terms).

This policy applies to release artifacts built from this repository, `JoseStud/piar-digital-app`.

## Team roles

- Committers and reviewers: [`@JoseStud`](https://github.com/JoseStud) is the current repository owner, default code owner, and reviewer for pull requests merged into this repository. See [`.github/CODEOWNERS`](../.github/CODEOWNERS).
- Approvers: [`@JoseStud`](https://github.com/JoseStud) is the current release and signing approver. Every signing request requires explicit manual approval by an approver before submission.

## What may be signed

- Sign this repository's own release artifacts only.
- Build signed artifacts from source code, build scripts, and release configuration stored in this repository.
- Do not submit upstream or third-party binaries for signing with this project's policy.
- If a deployment enables DOCX export, the DOCX template must be supplied by the deployment as a same-origin asset and must not be committed here unless its redistribution terms are documented and compatible with this repository's open-source licensing. See [`PROVENANCE.md`](../PROVENANCE.md).

## Review and release controls

- Contributions from people without direct write access are proposed through pull requests and reviewed before merge.
- Changes to release, signing, and provenance files require code owner review.
- Maintainers with GitHub or SignPath access must use multi-factor authentication.
- Public releases are published from annotated `v*` tags and matching GitHub release entries.
- GitHub release creation is automated in `.github/workflows/release.yml`; signed desktop assets are attached by `.github/workflows/desktop-build.yml`.
- Every signing request requires manual approval. Do not bypass branch protections, rerun blocked signing jobs to work around policy, or submit artifacts built outside the repository's reviewed source tree.
- Publish at least one public `v*` release before applying for SignPath Foundation signing.

## Privacy policy

See [`docs/security.md`](./security.md).

- PIAR form contents stay local to the browser or desktop runtime.
- The app does not send PIAR form data to third-party services.
- The app may fetch same-origin static assets and, when configured by the host deployment, a same-origin DOCX template URL.
- If a deployment adds any other network-connected service, the operator must publish the relevant privacy notice before enabling signed distribution of that deployment.
