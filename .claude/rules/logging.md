# Logging rules — Node/Express

## Principle

- `pino` (^10.0.0) — **mandatory runtime dependency** in every generated app (structured logging with a file transport, low overhead).
- File transport capped in size (rotation beyond `LOG_MAX_BYTES`, e.g. via `pino/file` + a rotation wrapper, or `pino-roll` if validated in Phase 1).
- Server-side logging is the only source of truth — there is no separate client-side log sink; client-side errors surface as toasts (`@rules/errors.md`), not as log entries.
- Zero `console.log` / `console.error` in delivered code — only `logger.*`.

---

## Centralized configuration

Mandatory file `src/shared/logger.ts` (single setup point, imported in `src/index.ts` right after `import "dotenv/config"`):

```ts
// src/shared/logger.ts
import pino from "pino";
import * as config from "./config";

function debugEnabled(): boolean {
  // e.g. app `My-App` → env var `MY_APP_DEBUG`. Non-alphanumerics normalized so the name is shell-usable.
  const key = `${config.APP_NAME.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_DEBUG`;
  return process.env[key] === "1";
}

export const logger = pino(
  {
    level: debugEnabled() ? "debug" : config.LOG_LEVEL,
  },
  pino.transport({
    target: "pino/file",
    options: { destination: "logs/app.log", mkdir: true },
  })
);
```

- Log file: `logs/app.log` (project-relative — no OS user-data directory to hide behind, unlike a desktop app) — never committed (`@rules/config.md § .gitignore`).
- `LOG_LEVEL` and `LOG_MAX_BYTES` live in `src/shared/config.ts` (`@rules/config.md`).
- Dev convenience: pipe through `pino-pretty` only in `npm run dev` (never in the built `dist/` output) if validated in Phase 1.

---

## Usage in modules

```ts
// src/services/record.service.ts
import { logger } from "../shared/logger";

export async function saveRecord(input: RecordInput): Promise<number> {
  logger.debug({ id: input.id }, "Saving record");
  // ...
}
```

### Level conventions

| Level | Usage                                                            |
| ----- | ---------------------------------------------------------------- |
| debug | Detailed traces, intermediate values                             |
| info  | Important business steps (startup, key user action)              |
| warn  | Unexpected but non-blocking conditions (user validation failed)  |
| error | Intercepted business error, failed outbound API call             |
| fatal | Uncaught exception / unhandled rejection — process about to exit |

### Errors always logged

In `catch` blocks that do not re-throw (an `ApiResult` error is returned, a toast is shown), call `logger.error({ err }, message)` so the stacktrace lands in the file. The error-handling middleware and the process-level `uncaughtException`/`unhandledRejection` handlers (`@rules/errors.md`) log through pino too, at `fatal`.

---

## Activation from `src/index.ts`

```ts
import "dotenv/config";                // first statement (@rules/env-config.md)
import { logger } from "./shared/logger"; // then the logger, before routes and server start
logger.info("Starting application");
```

---

## Anti-patterns — what NOT to do

- **Do not** use `console.log` / `console.error` in delivered code — only `logger.*`.
- **Do not** log a password, token, or personally identifiable data — see `@rules/security.md` and `@rules/api-calls.md` (outbound call logs exclude sensitive query params and bodies).
- **Do not** configure transports outside `src/shared/logger.ts` (single setup point, imported right after `import "dotenv/config"` in `src/index.ts`).
- **Do not** silence a `catch` that doesn't re-throw without a `logger.error(...)`.
- **Do not** pipe `pino-pretty` into the production file transport — it is a dev-only console convenience.

## Integrity verification

Detailed in `@rules/verification.md`. Key points: `src/shared/logger.ts` present and conforming; imported right after `import "dotenv/config"` in `src/index.ts`; `pino` in `dependencies`; no `console.log` in delivered `src/`; every non-re-throwing `catch` calls `logger.error(...)`.
