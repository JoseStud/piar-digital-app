# PIAR Digital - developer documentation

This folder is the developer-facing reference for the app. For audience-facing content, see the GitHub wiki source under `wiki/`; for AI-tool context, `CLAUDE.md` may live at the workspace root rather than inside this app repository.

- [architecture.md](architecture.md) - system overview, runtime mode flow, layer map, export preflights, and build pipeline.
- [data-model.md](data-model.md) - `PIARFormDataV2` shape, versioning contract, and field addition rules.
- [persistence-and-encryption.md](persistence-and-encryption.md) - draft storage, encrypted local persistence, and threat model.
- [pdf-docx-roundtrip.md](pdf-docx-roundtrip.md) - how exports embed source data and round-trip back into the form.
- [contributing.md](contributing.md) - contributor onboarding, scripts, commit style, and local workflow.
- [testing.md](testing.md) - Vitest layout, fixtures, and testing patterns.
- [security.md](security.md) - privacy posture, CSP pipeline, and vulnerability reporting.
- [release.md](release.md) - build, static export, Docker, and Tauri release flow.
- [code-signing-policy.md](code-signing-policy.md) - base-branch release policy, Microsoft Store packaging notes, and privacy statement for release artifacts.

`docs/superpowers/` holds AI-assisted brainstorming specs and implementation plans. It is useful provenance, but it is not part of the canonical developer reference.
