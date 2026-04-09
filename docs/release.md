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

The desktop shell embeds the static export and exposes a native save dialog for PIAR exports and bundled template downloads.

## Versioning the data model

- Bump `PIAR_DATA_VERSION` in `src/features/piar/model/piar.ts` for breaking changes
- Add a migration if the model changes incompatibly
- Update both `pdf-roundtrip.test.ts` and `docx-roundtrip.test.ts` fixtures
