# Security Policy

## Supported versions

| Version | Status |
|---|---|
| `main` | Active development |

There are no tagged releases yet.

## Reporting a vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Email: **support@piar.plus**

Please include:

- A description of the vulnerability
- Steps to reproduce
- The affected file(s) or feature
- Your assessment of the impact
- Any proof-of-concept code

## Response expectations

This is a volunteer-maintained project. We will acknowledge reports on a
best-effort basis. We do not commit to a formal SLA.

## Disclosure

We will coordinate public disclosure after a fix is released or after 90
days, whichever is sooner.

## In scope

- Vulnerabilities in the web app's client-side code
- Issues with the AES-256-GCM encryption design or key handling
- CSP misconfigurations in the build pipeline

## Out of scope

- Vulnerabilities in user devices, browsers, or OSes
- Third-party browser extensions
- Social engineering
- The user's own infrastructure
- Issues that require physical access to a user's device

For background on the encryption design, see
[`docs/persistence-and-encryption.md`](../docs/persistence-and-encryption.md).
