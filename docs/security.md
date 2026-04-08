# Security

This page summarizes the privacy posture. The deeper storage and encryption design lives in `docs/persistence-and-encryption.md`.

## Privacy posture

- No backend
- No analytics
- No telemetry
- No third-party scripts
- Lazy chunks load from the same origin only

## Encryption summary

Drafts are encrypted with AES-256-GCM in the browser. The key is generated locally, stored in IndexedDB, and never leaves the device.

## CSP

The Content Security Policy is generated at build time by `scripts/generate-csp-headers.mjs`.

The build writes `out/headers.conf`, which is consumed by the bundled `nginx.conf`.

The default policy is restrictive: same-origin chunks only, no arbitrary inline scripts. Build-time hashes are generated for inline script content that Next.js requires in the static export.

## What the user has to trust

- The shipped JavaScript bundle
- Their device and browser
- Their browser extensions

## What we control

- The code in this repository
- The CSP header template
- The crypto envelope shape

## Reporting a vulnerability

Do not open a public GitHub issue for a security problem.

Email `support@piar.plus`.

The full process lives in `.github/SECURITY.md`.

## Compliance scope

This app is a tool for filling out PIAR forms under Decreto 1421 / Anexo 2.

It is not an official Ministerio de Educacion product, and it does not certify the user's institutional process.
