# Error handling rules

## Service → Route → View escalation convention

- **Service**: raises explicit business errors (classes extending `Error`, defined in `src/shared/errors.ts`, with a fixed `name`).
- **Route**: intercepts via `try/catch` (or Express 5's native async propagation) in the handler. **Never lets a raw exception reach the client as an unhandled 500 with a stack trace.** Returns a structured JSON result.
- **Client script**: reads the result, calls the toast helper. Handles no error logic.
- **View (server-rendered)**: on a form POST, redirects with a flash-carried error, or renders the page with the error already resolved to a message. Handles no error logic beyond that.

## API result contract

Single type in `src/shared/types.ts`:

```ts
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { type: ToastType; message: string; description?: string } };

export type ToastType = "success" | "info" | "warning" | "danger";
```

Every JSON-returning route handler responds with an `ApiResult<T>` body. HTTP status still carries the class of error (`400` validation, `404` not found, `500` unexpected) — `ApiResult` is the payload shape, not a replacement for status codes.

## Full example

```ts
// src/shared/errors.ts
export class RecordNotFoundError extends Error {
  constructor(message: string) { super(message); this.name = "RecordNotFoundError"; }
}
export class ExternalApiError extends Error {
  constructor(message: string) { super(message); this.name = "ExternalApiError"; }
}
```

```ts
// src/routes/record.routes.ts
router.post("/records", async (req, res): Promise<void> => {
  const data = validateRecordPayload(req.body); // @rules/security.md
  try {
    const record = await recordService.save(data);
    res.json({ ok: true, data: record } satisfies ApiResult<Record>);
  } catch (err) {
    if (err instanceof RecordNotFoundError) {
      res.status(404).json({ ok: false, error: { type: "danger", message: err.message } } satisfies ApiResult<never>);
      return;
    }
    if (err instanceof ExternalApiError) {
      res.status(502).json({ ok: false, error: { type: "danger", message: "Erreur API externe", description: err.message } } satisfies ApiResult<never>);
      return;
    }
    throw err; // unexpected error → error-handling middleware
  }
});
```

```js
// public/js/record-view.js
const res = await fetch("/api/records", { method: "POST", body: JSON.stringify(data) });
const result = await res.json();
if (!result.ok) { toast(result.error); return; }
toast({ type: "success", message: t("record.saved") });
```

## Express error-handling middleware

Mandatory, registered last in `src/index.ts` (four-argument signature so Express recognizes it as an error handler):

```ts
// src/shared/error-middleware.ts
import type { ErrorRequestHandler } from "express";
import { logger } from "./logger";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error({ err }, "Unhandled route error");
  res.status(500).json({
    ok: false,
    error: { type: "danger", message: "Erreur interne" },
  } satisfies ApiResult<never>);
};
```

## Process-level handlers

Mandatory in `src/index.ts`, alongside the error middleware — the app does not crash silently and does not keep running in a corrupted state:

```ts
// src/index.ts
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled promise rejection");
  process.exit(1);
});
```

## Rules

- Zero blocking `alert()` / `confirm()` for business errors — **toasts only** (types, durations, anatomy: `layout.md §5`).
- Zero inline banner.
- Destructive confirmations (deletion…): styled modal (`layout.md §8`), never `confirm()`.
- Error handling on all critical operations: file I/O, database, outbound API calls (`@rules/api-calls.md`), JSON parsing.
- Unexpected server errors: the error-handling middleware plus the `uncaughtException`/`unhandledRejection` handlers (`logger.error`/`logger.fatal` via pino — `@rules/logging.md`) — the process never exits silently on an unlogged crash.
- Unexpected client-side script errors: `window.addEventListener("error", …)` / `"unhandledrejection"` at the base layout level → persistent `danger` toast.
- Visible error messages: go through i18n if enabled.

## Anti-patterns — what NOT to do

- **Do not** call `alert()` or `confirm()` for a business error or a confirmation — toast or styled modal only.
- **Do not** let a route handler `throw` a raw exception without an error-handling middleware to catch it — every app registers one, last, in `src/index.ts`.
- **Do not** build the user-facing message in the service — the service raises a typed error; the route decides the toast wording (via i18n).
- **Do not** swallow an error silently (`catch (_) {}`) — map it to an `ApiResult` error or let it reach the error middleware.
- **Do not** handle business error logic in a view — the view/client script only reads `result.ok` and toasts.
- **Do not** forget the process-level `uncaughtException`/`unhandledRejection` handlers and the client-side error listener — both are mandatory.

## Integrity verification

Detailed in `@rules/verification.md`. Key points: business errors raised in the service (`shared/errors.ts`), caught in the route, returned as `ApiResult<T>` with a matching HTTP status; no raw exception reaching the client as an unhandled 500; no `alert()` / `confirm()` for a business error or a confirmation; error-handling middleware registered last in `src/index.ts`; `uncaughtException`/`unhandledRejection` handlers present; client-side global error listener present; no silently swallowed `catch`.
