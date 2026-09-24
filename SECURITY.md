# Security Policy

MangaFlux treats public hostnames and sender addresses as public information. Database URLs, API keys, auth proxy secrets, and session/reset/verification tokens are secrets.

## Secrets

Never commit or expose through `NEXT_PUBLIC_*`:

- `DATABASE_URL`
- `AUTH_PROXY_SECRET`
- `MANGAFLUX_AUTH_PROXY_SECRET`
- `RESEND_API_KEY`
- session tokens
- verification/reset tokens

If any credential is committed, rotate it; deleting the latest file is not enough.

## Authentication and email

MangaFlux uses:

- salted Node scrypt password hashing
- random opaque HttpOnly sessions
- only SHA-256 session-token hashes in Neon
- internal Vercel → Render auth proxy secret
- secure random email-verification/reset tokens
- only token hashes stored in Neon
- 24-hour verification expiry
- 30-minute password-reset expiry
- one-time token deletion
- password-reset session revocation
- email-specific rate limiting
- generic password-recovery responses
- Resend key stored only on Render

New logins require a verified email. Password reset proves mailbox possession and marks the account email verified.

## Receiving email

Resend inbound receiving is not currently connected to MangaFlux application logic. Do not assume a receiving-enabled domain creates an inbox. Any future inbound webhook must verify Resend webhook authenticity before processing content or attachments.

## Platform baseline

Source requests use HTTPS, explicit allowlists, bounded timeouts/sizes, redirect validation, route-specific rate limits, generic error responses, CI secret scanning, migration checks, builds, and dependency audits.

## Reporting

Do not post credentials, session tokens, reset links, or working exploits in public issues.


## Administrator access

Administrator authorization is evaluated by the trusted API service after the internal proxy-secret and bearer-session checks. Admin access requires a verified MangaFlux account whose email is present in the server-side `ADMIN_EMAILS` allowlist.

The admin console must never return password hashes, raw session tokens, verification/reset tokens, API keys, database credentials, or arbitrary SQL controls.

## Cache boundaries

Only public MangaDex-derived GET data may receive public/shared cache headers. Authentication, account state, reading state, community mutations, and administrator responses remain private/no-store.

Release CI checks that known private route families do not import the public proxy-cache helper.

## Frontend baseline

The production frontend disables the framework signature header and emits baseline anti-framing, MIME-sniffing, referrer, permissions, and DNS-prefetch headers. These headers complement—not replace—the API security boundary.
