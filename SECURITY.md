# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.1.x   | ✅ Active development |

## Reporting a Vulnerability

Please **DO NOT** open a public GitHub issue for security vulnerabilities.

Email **security@cipher-letters.dev**, or use [GitHub's private vulnerability reporting](https://github.com/EZfan/cipher-letters/security/advisories/new), with:

1. A clear description of the vulnerability and its impact.
2. Reproduction steps — preferably a `curl` script that demonstrates the
   issue, or a failing test.
3. Your assessment of severity (information disclosure / denial of service
   / remote code execution / other).

We will respond within **72 hours** with a confirmation and a target
patch window. We follow a coordinated disclosure process:

1. Confirmation within 72 hours.
2. Patch developed privately.
3. CVE assigned if applicable.
4. Disclosure coordinated with the reporter.
5. Public advisory and patch release.

## Scope

The Cipher Letters server runs locally. Out-of-scope vulnerabilities
include:

- Attacks that require local filesystem access by the same user.
- Social engineering of maintainers.
- Denial of service against the developer's own machine.

In-scope:

- Remote code execution through the LLM backend (e.g. crafted prompt
  that escapes to shell).
- Path traversal in static file serving.
- Cross-site scripting in the web UI.
- Leakage of hidden case truth to the client before the case is solved.
- Cross-session data leakage in the in-memory session store.
