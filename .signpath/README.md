# SignPath setup

This repository uses SignPath's GitHub connector model for Windows desktop release bundles:

1. build the Windows installer on a GitHub-hosted runner
2. upload the unsigned bundle as a GitHub Actions artifact
3. submit that uploaded artifact to SignPath
4. attach only the signed Windows bundle to the GitHub release

The workflow is implemented in `.github/workflows/desktop-build.yml`.

## Required GitHub configuration

Configure these values in the `PIAR` GitHub environment before enabling release signing:

| Type | Name | Purpose |
|---|---|---|
| Secret | `SIGNPATH_API_TOKEN` | API token for a SignPath submitter account |
| Variable | `SIGNPATH_ORGANIZATION_ID` | SignPath organization id |
| Variable | `SIGNPATH_PROJECT_SLUG` | SignPath project slug for this repository |
| Variable | `SIGNPATH_SIGNING_POLICY_SLUG` | SignPath signing policy slug, usually the release policy |

The workflow already uses the default `GITHUB_TOKEN` with read-only `actions` and `contents` permissions for the SignPath connector step, as required by SignPath's GitHub action.

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
          - require_pull_request:
              min_required_approvals: 1
              dismiss_stale_reviews_on_push: true
              require_code_owner_review: true
              require_last_push_approval: true
              require_review_thread_resolution: true
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
- GitHub branch rulesets still need to require Code Owners review on `main`.
- Release signing runs are intentionally blocked on workflow re-runs. Start a fresh workflow run instead.
