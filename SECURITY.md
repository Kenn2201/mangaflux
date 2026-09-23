# Security Policy

MangaFlux treats public web/API hostnames as public information. Database URLs, proxy secrets, session tokens, provider tokens, and signing keys are secrets and must remain server-side.

## Current supported line

MangaFlux is pre-1.0. Only the latest deployed version is supported for security fixes.

## Secret handling

- Never commit environment files, registry credentials, private keys, database URLs with passwords, auth proxy secrets, or platform tokens.
- Never put secrets in variables prefixed with `NEXT_PUBLIC_`.
- Keep `DATABASE_URL` and `AUTH_PROXY_SECRET` on Render only.
- Keep `MANGAFLUX_AUTH_PROXY_SECRET` on Vercel only.
- Render and Vercel auth proxy secret values must match.
- If a credential is ever committed, rotate/revoke it immediately; removing it from the current tree is not enough.

## Authentication

v0.5 uses:

- email normalization and input limits
- passwords of 12–128 characters
- Node scrypt password hashing with random 16-byte salts
- cryptographically random 32-byte opaque session tokens
- only SHA-256 session-token hashes stored in Neon
- HttpOnly, SameSite=Lax, Secure production cookies
- fixed 30-day sessions
- separate signup/login/session rate limits
- generic invalid-credential login responses
- an internal Vercel → Render auth proxy secret
- same-origin + custom-header checks for state-changing browser auth routes
- account state endpoints that require both the internal proxy boundary and a valid session token

The browser never receives `AUTH_PROXY_SECRET`, `MANGAFLUX_AUTH_PROXY_SECRET`, `DATABASE_URL`, or a readable JavaScript copy of the session token.

## Device-state import

Signed-out reading data uses a random HttpOnly reader UUID. On signup/login, that browser's device state may be copied into the account once. A `reader_imports` record prevents the same device snapshot from repeatedly overwriting account data.

Device state is not authentication and contains only manga identifiers/metadata and reading progress.

## Known pre-1.0 limitation

v0.5 does not implement email verification or password recovery. Treat accounts as a pre-release feature until a recovery/verification strategy is added and audited.

## API hardening

The API additionally uses explicit CORS origins, source host allowlists, redirect revalidation, input validation, bounded timeouts/response sizes, route-specific rate limits, generic client errors, and a fail-closed browser-source compatibility interface.

## Database

- checked-in Drizzle runtime migrations run before Render API startup
- CI verifies the migration journal without production DB access
- manga page binaries are not stored in Neon
- database/auth failures do not expose connection strings or SQL details

If MangaFlux scales horizontally, move in-memory limits to shared Redis/Upstash or an edge/WAF layer.

## Reporting

Do not post working exploits, credentials, session tokens, or private user data in a public issue. Prefer GitHub private vulnerability reporting when enabled.
