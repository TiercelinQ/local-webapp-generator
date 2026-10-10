# Environment variable rules

> `.env` carries every secret, credential, and machine-specific setting. This file defines how it is loaded, validated, and accessed — never scattered `process.env.X` across the codebase (`CLAUDE.md` § ABSOLUTE RULES).

## Files

| File           | Committed | Content                                                              |
| ---------------- | ----------- | ----------------------------------------------------------------------- |
| `.env`          | No        | Local, machine-specific values — real secrets and credentials         |
| `.env.example`  | Yes       | Every expected key, documented, with **no real value**                |

`.env` is listed in `.gitignore` (`@rules/config.md`). `.env.example` ships in the same batch as `.gitignore` and is kept in sync whenever a key is added, renamed, or removed.

## Loading — `dotenv`

Loaded once, at the very top of `src/index.ts`, before any other import that might read `process.env`:

```ts
// src/index.ts
import "dotenv/config"; // loads .env into process.env — first statement
import { logger } from "./shared/logger";
// ...
```

## Startup validation — fail fast

Mandatory file `src/shared/config.ts` validates every required variable at import time (not lazily on first use) — a missing required variable stops the app immediately with a clear message, instead of failing obscurely later on `undefined`:

```ts
// src/shared/config.ts
import "dotenv/config";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Application
export const APP_NAME = "AppName";
export const APP_VERSION = "1.0.0";

// Server
export const PORT = Number(process.env.PORT ?? 3000);
export const NODE_ENV = process.env.NODE_ENV ?? "development";

// External API — required at startup, no silent fallback
export const WEATHER_API_BASE_URL = requireEnv("WEATHER_API_BASE_URL");
export const WEATHER_API_KEY = requireEnv("WEATHER_API_KEY");
```

- `requireEnv` throws synchronously on `import` — an app missing a required key never reaches `app.listen()`.
- Optional variables (with a sane default, e.g. `PORT`) use `??` instead of `requireEnv`.

## Centralized access — `src/shared/config.ts`

- **Every** `process.env.X` read happens here, once, and nowhere else in the codebase.
- All other modules import the typed constant (`config.PORT`, `config.WEATHER_API_KEY`) — never `process.env` directly.
- Rationale: a single audit point for what the app reads from the environment, and a single place to add a new required key.

## Naming convention

- `SCREAMING_SNAKE_CASE` for every variable, matching the constant name exported from `config.ts` (`PORT` → `config.PORT`, `WEATHER_API_KEY` → `config.WEATHER_API_KEY`).
- A variable scoped to one external system is prefixed with that system's name: `WEATHER_API_KEY`, `WEATHER_API_BASE_URL`.

## `.env.example` format

```dotenv
# Server
PORT=3000
NODE_ENV=development

# Weather API (https://example-weather-provider.test)
WEATHER_API_BASE_URL=
WEATHER_API_KEY=
```

- Every key present in `config.ts` has a matching line here.
- No real value, no placeholder that looks like a real secret (`sk-...`) — an empty value or an obviously fake example (`https://api.example.com`) only.
- Grouped by concern with a comment header, mirroring `config.ts`'s own grouping.

## Typical variables

| Variable      | Required | Example                          |
| --------------- | ---------- | ----------------------------------- |
| `PORT`         | No (default 3000) | `3000`                    |
| `NODE_ENV`     | No (default `development`) | `development` / `production` |
| `[SYSTEM]_API_BASE_URL` | Yes (per external system called) | `https://api.example.com` |
| `[SYSTEM]_API_KEY`      | Yes (per external system requiring auth) | — |

## Anti-patterns — what NOT to do

- **Do not** read `process.env.X` outside `src/shared/config.ts` — import the typed constant instead.
- **Do not** commit `.env` — only `.env.example`, with no real value.
- **Do not** let `.env.example` drift from the actual keys `config.ts` reads — update both in the same change.
- **Do not** default a required secret to an empty string or a hardcoded fallback value — use `requireEnv` so a missing key fails fast at startup.
- **Do not** log the resolved value of an environment variable that holds a secret — see `@rules/logging.md` and `@rules/security.md`.

## Integrity verification

Detailed in `@rules/verification.md`. Key points: `.env.example` present and documents every expected key with no real value; `src/shared/config.ts` validates every required variable at startup (fails fast, not lazily); no `process.env.X` read outside `config.ts`; `.env` absent from the repository (`git status`/`git check-ignore`).
