# Release

This page covers how to build, package, and ship the app.

## Static export

```bash
npm run build
```

The build produces `out/` with the exported static app and runs the CSP header generation step automatically, producing `out/headers.conf`.

## Docker build

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://piar.example.gov.co \
  --build-arg NEXT_PUBLIC_CONTACT_EMAIL=soporte@piar.example.gov.co \
  -t piar-form .

docker run -p 8080:8080 piar-form
```

The container serves the static export with the bundled `nginx.conf`.

## Build args

| Arg | What it sets |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Base URL used as `metadataBase` for generated page metadata |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Passed through the Docker/Tauri build wrappers for deployment-specific contact info; currently unused by the web UI |
| `NEXT_PUBLIC_PIAR_DOCX_TEMPLATE_URL` | Same-origin URL for the DOCX template used by standalone DOCX exports |
| `NEXT_PUBLIC_PIAR_DOCX_TEMPLATE_SOURCE_NAME` | Human-readable source label shown in the workflow UI when a DOCX template URL is configured |

If `NEXT_PUBLIC_PIAR_DOCX_TEMPLATE_URL` is unset, the app keeps PDF export enabled and disables editable DOCX export.

## Nginx config

- `nginx.conf` is bundled in the Docker image
- It includes `out/headers.conf` for the generated CSP
- It listens on port `8080`

## Tauri desktop

```bash
npm run desktop:dev      # development shell
npm run desktop:build    # release build
npm run desktop:icon     # regenerate icons from public/icon-512.png
```

The desktop shell embeds the static export and exposes a native save dialog for PIAR exports.

## Release tags

Publish source releases from annotated `v*` tags:

```bash
git checkout main
git pull --ff-only
git tag -a v0.1.6 -m "Release v0.1.6"
git push origin main
git push origin v0.1.6
```

A pushed `v*` tag now drives the release pipeline in this repository:

| Workflow | Trigger | Purpose |
|---|---|---|
| `.github/workflows/ci.yml` | pushes to `main`/`master`, pull requests, and `v*` tags | lint, typecheck, test, build, and push the Docker image to GHCR |
| `.github/workflows/release.yml` | pushed `v*` tags | create or update the GitHub release entry |
| `.github/workflows/desktop-build.yml` | pushed `v*` tags | build the unsigned Windows desktop bundle, submit the workflow artifact to SignPath, then attach the signed Windows assets |

A SignPath application should point at a published GitHub release, not an untagged branch snapshot. The current first public release target is `v0.1.6`.

## GitHub environment inputs

The production workflows use the GitHub environment named `PIAR`.

| Type | Name | Used as |
|---|---|---|
| Secret | `NEXT_PUBLIC_SITE_URL` | canonical public origin used during production build/export and release notes |
| Secret | `NEXT_PUBLIC_CONTACT_EMAIL` | public support inbox used during production build/export and release notes |
| Secret | `SIGNPATH_API_TOKEN` | submitter token for the SignPath GitHub connector action |
| Variable | `SIGNPATH_ORGANIZATION_ID` | SignPath organization identifier |
| Variable | `SIGNPATH_PROJECT_SLUG` | SignPath project slug mapped to this repository |
| Variable | `SIGNPATH_SIGNING_POLICY_SLUG` | SignPath signing policy slug for release signing |

Configure `@JoseStud` as the required reviewer for this environment while the repository remains single-maintainer. Leave self-review enabled until a second approver exists, otherwise release signing deadlocks.

GitHub uses that environment approval gate before the SignPath signing job runs.

## GitHub branch ruleset

Configure the default branch ruleset to match the checked-in SignPath policy:

- block force pushes
- require linear history
- disallow bypass actors

Do not require general pull request approvals on `main` while `@JoseStud` is the only committer, reviewer, and approver. Contributions from people without direct write access still merge through reviewed pull requests.

## Code signing policy

Code signing policy: see [`code-signing-policy.md`](code-signing-policy.md).

Free code signing provided by [SignPath.io](https://about.signpath.io), certificate by [SignPath Foundation](https://signpath.org/terms).

Every signing request must be manually approved by the current approver listed in [`code-signing-policy.md`](code-signing-policy.md) through the `PIAR` GitHub environment. Windows signing runs only for pushed annotated `v*` tags. If a deployment enables DOCX export, the deployment operator is responsible for the rights to the configured same-origin template file. See [`../PROVENANCE.md`](../PROVENANCE.md).

## Versioning the data model

- Bump `PIAR_DATA_VERSION` in `src/features/piar/model/piar.ts` for breaking changes
- Add a migration if the model changes incompatibly
- Update both `pdf-roundtrip.test.ts` and `docx-roundtrip.test.ts` fixtures
