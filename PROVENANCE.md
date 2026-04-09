# Provenance

This repository is intended to remain fully open source under GPL-3.0-or-later. No file-specific proprietary exceptions are declared in this repository at the time of writing.

## Included in this repository

- Source code under `src/`, `tests/`, `scripts/`, and `src-tauri/` is maintained in this repository and distributed under GPL-3.0-or-later unless a future file says otherwise.
- Checked-in project artwork under `public/` such as `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon.ico`, and `og-image.png` ships as part of this repository under the same repository license unless a future file-specific notice says otherwise.
- Dependency provenance for npm and Cargo packages is tracked through `package-lock.json` and `src-tauri/Cargo.lock`.

## Intentionally not shipped in this repository

- Official PIAR DOCX or PDF template files are not committed to this repository.
- Institution-specific or government-logo assets are not committed to this repository.
- Standalone deployments that want DOCX export must provide their own same-origin DOCX template through `NEXT_PUBLIC_PIAR_DOCX_TEMPLATE_URL`.
- Developers in the shared `~/architecture` workspace may keep local template fixtures such as `~/architecture/new_template.docx`, but those files stay outside this repository and must not be committed here.

## Operator responsibilities

- The person or organization configuring `NEXT_PUBLIC_PIAR_DOCX_TEMPLATE_URL` is responsible for ensuring that the referenced template can be redistributed with that deployment and used for PIAR export.
- Template-dependent tests may load a local DOCX fixture through `PIAR_TEST_DOCX_TEMPLATE_PATH` or, in the shared workspace, auto-detect `~/architecture/new_template.docx`; that local file is a developer fixture, not part of this repository or its release artifacts.
- Do not commit or ship non-open-source assets here unless their redistribution terms are documented and compatible with the repository license.
