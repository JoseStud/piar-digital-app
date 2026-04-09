# SignPath setup

This repository uses SignPath's GitHub connector model for Windows desktop release bundles:

1. build the Windows installer on a GitHub-hosted runner
2. upload the unsigned bundle as a GitHub Actions artifact
3. submit that uploaded artifact to SignPath
4. attach only the signed Windows bundle to the GitHub release

The workflow is implemented in `.github/workflows/desktop-build.yml` and runs only for pushed annotated `v*` tags.

## Required GitHub configuration

Configure these values in the `PIAR` GitHub environment before enabling release signing:

| Type | Name | Purpose |
|---|---|---|
| Secret | `NEXT_PUBLIC_SITE_URL` | Canonical public origin used in release metadata |
| Secret | `NEXT_PUBLIC_CONTACT_EMAIL` | Public support inbox used in release metadata |
| Secret | `SIGNPATH_API_TOKEN` | API token for a SignPath submitter account |
| Variable | `SIGNPATH_ORGANIZATION_ID` | SignPath organization id |
| Variable | `SIGNPATH_PROJECT_SLUG` | SignPath project slug for this repository |
| Variable | `SIGNPATH_SIGNING_POLICY_SLUG` | SignPath signing policy slug, usually the release policy |

The workflow already uses the default `GITHUB_TOKEN` with read-only `actions` and `contents` permissions for the SignPath connector step, as required by SignPath's GitHub action.

While the repository is single-maintainer, configure `@JoseStud` as the required reviewer for the `PIAR` environment and leave self-review allowed. Disabling self-review would deadlock release signing until a second approver exists.

## Checked-in SignPath policy file

SignPath source-code and build policies are not inferred from the workflow. This repository currently checks in the policy file at:

```text
.signpath/policies/piar-digital-app/release.yml
```

That path assumes the SignPath project slug is `piar-digital-app` and the signing policy slug is `release`. If the configured slugs differ, rename the checked-in file to match exactly.

```yaml
github-policies:
  runners:
    require_github_hosted: true
  build:
    disallow_reruns: true
  branch_rulesets:
    - condition:
        rules:
          - block_force_pushes: true
          - require_linear_history: true
      allow_bypass_actors: false
      enforced_from: EARLIEST
```

If you also want SignPath to enforce code-scanning gates, extend the same file with a `require_code_scanning` rule after you have a required scanning tool configured in GitHub.

## Metadata restrictions

SignPath artifact configuration still needs to enforce Windows file metadata restrictions outside this repository:

- Set all product name attributes to `PIAR Digital`
- Set all product version attributes to the same release version
- Keep the Git tag, `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml` versions aligned

`.github/workflows/desktop-build.yml` rejects tagged releases when those version values drift.

## Repository controls

- [`.github/CODEOWNERS`](../.github/CODEOWNERS) protects `.signpath/**`, release workflows, and the provenance and code-signing policy documents.
- Configure a GitHub ruleset on `main` that blocks force pushes, requires linear history, and disallows bypass actors.
- External contributions still merge through pull requests reviewed by `@JoseStud`; trusted maintainer pushes remain possible while the project is single-maintainer.
- Release signing runs are intentionally blocked on workflow re-runs. Start a fresh workflow run instead.
- SignPath submissions are tag-only. Do not submit branch snapshots or manually dispatched workflow builds for signing.
