# Code signing policy

This base-branch policy applies to release artifacts built from `main` in `JoseStud/piar-digital-app`.

The SignPath-specific compliance workflow and repository controls live on the `signpath-compliance` branch. `main` remains the base branch for public releases and generic open-source auditing work.

## Team roles

- Committer: [`@JoseStud`](https://github.com/JoseStud) is the current repository owner and default code owner. See [`.github/CODEOWNERS`](../.github/CODEOWNERS).
- Reviewer: [`@JoseStud`](https://github.com/JoseStud) reviews contributions from people without direct write access.
- Release publisher: [`@JoseStud`](https://github.com/JoseStud) publishes tagged releases from `main`.

## What may be published

- Publish this repository's own release artifacts only.
- Build release artifacts from source code, build scripts, and release configuration stored in this repository.
- Do not present upstream or third-party binaries as if they were built by this repository.
- If a deployment enables DOCX export, the DOCX template must be supplied by the deployment as a same-origin asset and must not be committed here unless its redistribution terms are documented and compatible with this repository's open-source licensing. See [`PROVENANCE.md`](../PROVENANCE.md).

## Review and release controls

- Contributions from people without direct write access are proposed through pull requests and reviewed before merge.
- Trusted maintainers may push directly to the default branch while the repository remains single-maintainer.
- Keep the GitHub default-branch ruleset focused on broad source-integrity controls such as blocking force pushes and requiring linear history.
- Changes to release, signing, and provenance files require code owner review.
- Maintainers with GitHub access and any external store or signing credentials must use multi-factor authentication.
- Public releases are published from annotated `v*` tags and matching GitHub release entries.
- GitHub release creation is automated in `.github/workflows/release.yml`; Windows desktop assets are attached by `.github/workflows/desktop-build.yml`.
- Windows assets attached from `main` are Microsoft Store-oriented MSI bundles built with the offline WebView2 installer mode configured in [`src-tauri/tauri.microsoftstore.conf.json`](../src-tauri/tauri.microsoftstore.conf.json).
- External code signing and Microsoft Store submission remain operator responsibilities. Do not publish artifacts built outside the repository's reviewed source tree.

## Privacy policy

See [`docs/security.md`](./security.md).

- PIAR form contents stay local to the browser or desktop runtime.
- The app does not send PIAR form data to third-party services.
- The app may fetch same-origin static assets and, when configured by the host deployment, a same-origin DOCX template URL.
- If a deployment adds any other network-connected service, the operator must publish the relevant privacy notice before enabling signed distribution of that deployment.
