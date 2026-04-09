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
npm run desktop:build:store
npm run desktop:icon     # regenerate icons from public/icon-512.png
```

The desktop shell embeds the static export and exposes a native save dialog for PIAR exports.

`npm run desktop:build:store` builds the Windows MSI variant intended for Microsoft Store packaging. It keeps the application build separate from the installer bundling step and applies the offline WebView2 installer mode through `src-tauri/tauri.microsoftstore.conf.json`.

## Release tags

Publish source releases from annotated `v*` tags:

```bash
git checkout main
git pull --ff-only
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main
git push origin v1.0.0
```

A pushed `v*` tag now drives the release pipeline in this repository:

| Workflow | Trigger | Purpose |
|---|---|---|
| `.github/workflows/ci.yml` | pushes to `main`/`master`, pull requests, and `v*` tags | lint, typecheck, test, build, and push the Docker image to GHCR |
| `.github/workflows/release.yml` | pushed `v*` tags | create or update the GitHub release entry |
| `.github/workflows/desktop-build.yml` | pushed `v*` tags | build the Microsoft Store-oriented Windows MSI bundle, then attach the bundle to the GitHub release |

The current public release target from `main` is `v1.0.0`.

## GitHub environment inputs

Release metadata uses the GitHub environment named `PIAR`.

| Type | Name | Used as |
|---|---|---|
| Secret | `NEXT_PUBLIC_SITE_URL` | canonical public origin used during production build/export and release notes |
| Secret | `NEXT_PUBLIC_CONTACT_EMAIL` | public support inbox used during production build/export and release notes |

The desktop release workflow on `main` does not depend on SignPath credentials.

## Microsoft Store Windows output

- `src-tauri/tauri.microsoftstore.conf.json` narrows the Windows release asset to an MSI bundle and switches WebView2 to offline installer mode.
- `.github/workflows/desktop-build.yml` publishes that MSI bundle as the Windows desktop release asset for pushed `v*` tags.
- Additional code signing and actual Microsoft Store submission remain external operator steps.

## SignPath branch

The stricter SignPath GitHub-connector workflow and repository-policy variant are preserved on the `signpath-compliance` branch.

## Code signing policy

Code signing policy: see [`code-signing-policy.md`](code-signing-policy.md).

Releases from `main` attach Microsoft Store-oriented Windows MSI assets. If a deployment enables DOCX export, the deployment operator is responsible for the rights to the configured same-origin template file. See [`../PROVENANCE.md`](../PROVENANCE.md).

## Versioning the data model

- Bump `PIAR_DATA_VERSION` in `src/features/piar/model/piar.ts` for breaking changes
- Add a migration if the model changes incompatibly
- Update both `pdf-roundtrip.test.ts` and `docx-roundtrip.test.ts` fixtures
