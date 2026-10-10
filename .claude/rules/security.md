# Web security rules — NON-NEGOTIABLE

Applied to 100% of generated applications. Any deviation requires the contract declaration protocol (stop → declare → validate).

## 1. Server binding — localhost only

```ts
// src/index.ts
app.listen(config.PORT, "127.0.0.1", () => {
  logger.info(`Listening on http://127.0.0.1:${config.PORT}`);
});
```

- Bind explicitly to `127.0.0.1` (or `localhost`) — **never** `0.0.0.0`. The app is never exposed beyond the local machine.
- No reverse proxy, no tunnel, no public deployment target documented or scripted by the generator.

## 2. Route input validation (in the route handlers)

- Every incoming `req.params`, `req.query`, and `req.body` value is typed `unknown` then validated before use: type, mandatory fields, bounds, format.
- Validation by dedicated functions (TS type guards) — schema library (zod…) only if validated in Phase 1.
- File paths received from a client request: resolved then checked (`path.resolve` + verify they stay under the allowed directory). Zero traversal.
- SQL queries (if a database is used): **always** prepared/parameterized — zero string concatenation.

## 3. CORS — restricted to localhost

- CORS is disabled by default (same-origin server-rendered app: no cross-origin caller to allow).
- If a validated Phase 1 use case requires cross-origin access (e.g. a companion local tool on another port), the allowed origin list is an explicit, finite set of `http://localhost:*` / `http://127.0.0.1:*` entries in `src/shared/config.ts` — never a wildcard `*`, never a dynamically reflected `Origin` header.

## 4. Outbound calls to external APIs

- Every outbound call goes through `src/services/`, using parameterized request construction (query params and body built from typed objects, e.g. `URLSearchParams` or the client library's request builder) — **never** string concatenation into a URL or a request body. See `@rules/api-calls.md`.
- No unvalidated external resource is loaded into a server-rendered view (no remote script/style/iframe pulled from a value that came from user input or an external API response).
- Response bodies from external APIs are treated as untrusted data: validated/typed before use, never interpolated raw into HTML (escape or use the templating engine's auto-escaping) — XSS guard on data that happens to come from outside instead of from the local user.

## 5. Secrets and credentials

- No hardcoded secret in the code. All secrets and API credentials live in `.env`, read via `src/shared/config.ts` — see `@rules/env-config.md`.
- Secrets are **never** sent to the client (no secret in a server-rendered template, no secret in a JSON response, no secret in a client-side script or bundle).
- Secrets are **never** logged — see `@rules/logging.md` (outbound call logs record method/URL/status/duration, never headers or bodies that may carry a token).
- `.env` is never committed (`@rules/config.md § .gitignore`); `.env.example` documents every expected key with no real value.

## 6. Data

- SQLite database (if used), `preferences.json`, and logs: written under the project's own `data/`/`logs/` folders — never committed (`.gitignore`: `*.db`, `preferences.json`, `logs/`).
- No application data committed.

## 7. Misc

- Dependencies kept on supported stable versions; `npm audit` mentioned in the last batch instructions.
- Verbose framework error pages (stack traces) are never sent to the client in a production-style response — the error-handling middleware (`@rules/errors.md`) always returns the sanitized `ApiResult` shape; the full error is only in the log file.

## Anti-patterns — what NOT to do

- **Do not** bind the server to `0.0.0.0` or any address beyond `127.0.0.1`/`localhost`.
- **Do not** use a route input (params, query, body) without validating it first (type guard, bounds, path resolution).
- **Do not** concatenate a value into a SQL string — always parameterized queries.
- **Do not** concatenate a value into an outbound request URL or body string — build it from typed objects (`@rules/api-calls.md`).
- **Do not** enable CORS with a wildcard origin or a reflected `Origin` header.
- **Do not** send a secret to the client, embed it in a bundle, or write it to a log line.
- **Do not** render untrusted external API data into HTML without escaping.

## Integrity verification

Detailed in `@rules/verification.md`. Key points: server bound to `127.0.0.1`/`localhost` only; every route input validated server-side before use; SQL 100% parameterized (if a database is used); outbound requests built from typed objects, never string concatenation; CORS absent or restricted to an explicit localhost allowlist; no secret in code, client-facing output, or logs; `.env` documented via `.env.example`, never committed; error responses sanitized (no stack trace leaked to the client).
