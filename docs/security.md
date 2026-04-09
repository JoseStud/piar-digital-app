# Security

This page summarizes the privacy posture. The deeper storage and encryption design lives in `docs/persistence-and-encryption.md`.

## Privacy posture

- Static client-side app: no backend path for drafts or telemetry.
- No analytics, no telemetry, and no third-party scripts.
- Lazy chunks load from the same origin only.
- Draft state stays in browser storage; the only transient plaintext copy is the unload-recovery slot used to survive pagehide.

## Encryption summary

Drafts are encrypted with AES-256-GCM in the browser. The key is generated locally, stored in IndexedDB, and marked non-extractable.

That protects against casual reads of localStorage and similar low-trust local inspection, but it does not protect against code running in this origin, browser compromise, or full filesystem/IndexedDB access. The plaintext unload-recovery slot is a deliberate tradeoff for shutdown resilience.

## CSP

The Content Security Policy is generated at build time by `scripts/generate-csp-headers.mjs`.

The build writes `out/headers.conf`, which is consumed by the bundled `nginx.conf`.

The default policy is restrictive: same-origin chunks only, no arbitrary inline scripts. Build-time hashes are generated for inline script content that Next.js requires in the static export.

## Desktop App (Tauri)

The desktop distribution disables web-based CSP (`"csp": null` in `tauri.conf.json`) since it runs as a native application, not in a webview with same-origin constraints.

### Exposed IPC endpoints
- `save_binary_file`: Prompts the user for a save location via native dialog, then writes bytes to the selected path (used for PDF/DOCX export)

### Permissions
Desktop app uses minimal Tauri capabilities: `core:default` only, with no filesystem access beyond user-initiated saves.

## What the user has to trust

- The shipped JavaScript bundle
- Their device and browser
- Their browser extensions
- The temporary plaintext recovery copy written during unload handling

## What we control

- The code in this repository
- The CSP header template
- The crypto envelope shape
- The unload-recovery envelope shape

## Reporting a vulnerability

Do not open a public GitHub issue for a security problem.

Email `support@piar.plus`.

The full process lives in `.github/SECURITY.md`.

## Compliance scope

This app is a tool for filling out PIAR forms under Decreto 1421 / Anexo 2.

It is not an official Ministerio de Educacion product, and it does not certify the user's institutional process.
