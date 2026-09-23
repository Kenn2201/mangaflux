# Security Policy

MangaFlux treats public web and API hostnames as public information. The API hostname is not a secret. Credentials, database URLs, auth secrets, provider tokens, and signing keys are secrets and must remain server-side.

## Current supported line

MangaFlux is pre-1.0. Only the latest deployed version is supported for security fixes.

## Secret handling

- Never commit environment files, npm registry credentials, private keys, database URLs with passwords, or platform tokens.
- Never put secrets in variables prefixed with NEXT_PUBLIC_. Next.js intentionally exposes those values to the browser.
- Keep DATABASE_URL and the future AUTH_SECRET in Render or Vercel environment settings only.
- If a credential is ever committed, rotate or revoke it immediately. Deleting it from the latest file is not enough because Git history may still contain it.
- The environment example file must contain placeholders only.

## API hardening

The V1 API uses explicit CORS origins, request validation, per-IP in-memory rate limits, bounded response sizes and timeouts, HTTPS-only source requests, redirect revalidation, no credentials in source URLs, a disabled-by-default browser runtime, short-lived metadata caches, and generic public errors with request IDs.

The in-memory limiter is appropriate for the single-instance V1 Render deployment. If MangaFlux scales to multiple API instances, move limits to a shared store such as Redis or Upstash, or enforce limits at an edge/WAF layer.

## Reporting

Do not post working exploits, credentials, or private user data in a public issue. If GitHub private vulnerability reporting is enabled, use the repository Security tab. Otherwise contact the repository owner privately through GitHub before publishing details.
