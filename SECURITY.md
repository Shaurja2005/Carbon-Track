# Security

EcoTrace is designed to have the smallest reasonable attack surface.

---

## Security Model

**No backend, no database, no secrets.**
The application is fully client-side. It ships no API keys or credentials, has no server-side state, and therefore has no server to compromise and no `.env` to leak.

**localStorage is treated as untrusted.**
Every value read back from the browser is parsed and validated against a Zod schema (`src/lib/storage.ts`). Malformed, tampered, or wrong-shaped data fails closed — it returns `null` or an empty value and never throws an unhandled error into the UI. All storage access is guarded so the module is safe during SSR and in private-browsing or storage-disabled contexts.

**Input validation.**
All user input is validated and range-bounded by Zod schemas (`src/lib/schemas.ts`) before it reaches any calculation logic. Numbers are constrained to physically plausible ranges; enumerated fields only accept the declared values.

**No raw HTML injection.**
The application does not use `dangerouslySetInnerHTML` with user-controlled input. All dynamic content is rendered through React's own escaping layer.

---

## HTTP Security Headers

The `Content-Security-Policy` is set per request in `src/middleware.ts` because it carries a fresh per-request nonce. The remaining headers are set statically in `next.config.ts` for every route.

| Header | Value / Notes |
|---|---|
| `Content-Security-Policy` | `default-src 'self'`; `script-src` uses a per-request **nonce** + `'strict-dynamic'` — no `'unsafe-inline'` for scripts. Dev-only additions: `'unsafe-eval'` (React Fast Refresh) and `ws:` (HMR). |
| `X-Frame-Options` | `DENY` — prevents clickjacking. |
| `X-Content-Type-Options` | `nosniff` — prevents MIME-type sniffing. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, microphone, geolocation, and browsing-topics disabled. |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` — HSTS with preload. |
| `X-DNS-Prefetch-Control` | `off` |

Styles allow `'unsafe-inline'` — this is a low-risk sink that Next.js and Tailwind require for inline style injection. `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, and `form-action 'self'` are enforced.

Verify after deployment with [securityheaders.com](https://securityheaders.com) and the [Mozilla Observatory](https://observatory.mozilla.org).

---

## Dependencies

- The lockfile (`package-lock.json`) is committed; CI installs with `npm ci` for reproducible builds.
- The dependency footprint is intentionally minimal — every dependency is attack surface and bundle weight.
- Recommended: enable **Dependabot** (GitHub → Settings → Security) for automated dependency updates, and run `npm audit` in CI. Consider adding **gitleaks** or a similar secret scanner as a pre-commit hook.

---

## Threat Model

| Threat | Mitigation |
|---|---|
| XSS via user input | React escaping; strict CSP with nonces; no `dangerouslySetInnerHTML` with user data |
| localStorage tampering | Zod validation on every read; failures are silently discarded |
| Clickjacking | `X-Frame-Options: DENY`; `frame-ancestors 'none'` in CSP |
| Data exfiltration | No outbound requests; `connect-src 'self'`; no third-party scripts without nonce |
| Secret exposure | No secrets exist; no `.env` in production; `.env*.local` in `.gitignore` |
| Supply chain | Lockfile pinned; `npm ci` in CI; Dependabot recommended |

---

## Reporting a Vulnerability

Open a **private security advisory** on the GitHub repository (Security → Advisories → New draft advisory), or contact the maintainer directly at the email listed in the repository profile. Do not file a public issue for security reports.

Please include: a description of the vulnerability, steps to reproduce, the potential impact, and any suggested remediation if known.
