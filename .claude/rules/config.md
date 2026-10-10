# Config, dependencies, i18n rules

## `src/shared/config.ts` structure

Mandatory minimum structure in every project:

```ts
// Application
export const APP_NAME = "AppName";
export const APP_VERSION = "1.0.0";

// Server
export const PORT = Number(process.env.PORT ?? 3000);

// Database (if applicable) — relative path under data/
export const DB_FILENAME = "app_name.db";
export const DB_SCHEMA_VERSION = 1;      // if DB ≠ none — target schema version, == max(MIGRATIONS) — @rules/db.md

// Preferences (if applicable)
export const PREFERENCES_FILENAME = "preferences.json";

// Internationalization (if enabled)
export const DEFAULT_LOCALE = "fr";
export const SUPPORTED_LOCALES = ["fr", "en"] as const;

// Toast position — layout.md §5 (Phase 3 choice, persisted preference)
export const TOAST_POSITION = "top-right";

// Logging — @rules/logging.md
export const LOG_LEVEL = "info";
export const LOG_MAX_BYTES = 1_000_000; // 1 MB, pino file rotation

// Outbound API calls — @rules/api-calls.md
export const API_TIMEOUT_MS = 8000;
export const API_MAX_RETRIES = 2;
```

- Any constant reused in more than one file goes into `shared/config.ts`.
- Every environment-derived value is read **once**, here, via `process.env` — never `process.env.X` scattered across the codebase. Detail: `@rules/env-config.md`.
- Zero color in `config.ts` — the accent lives in `src/views/styles/_custom.scss` (`$primary`), everything else in Bootstrap's own theme (difference vs the Python generator).

## `package.json` — mandatory scripts

```json
{
  "scripts": {
    "dev": "npm run build:css && tsx watch src/index.ts",
    "build": "npm run build:css && tsc",
    "build:css": "sass src/views/styles/app.scss:public/css/app.css",
    "start": "node dist/index.js",
    "lint": "eslint .",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit"
  }
}
```

- No `postinstall` binary-reliability step and no packaging script — this framework never packages or distributes the generated app (see `CLAUDE.md` § STACK). `start` runs the built server directly with plain Node.
- `build:css` compiles `app.scss` (Bootstrap + `_custom.scss` + residual rules) to `public/css/app.css` (`@rules/css.md`). `dev`/`build` run it once before starting; a developer actively editing Sass runs `sass --watch src/views/styles/app.scss:public/css/app.css` in a separate terminal — no `concurrently` dependency added for this.
- Bootstrap Icons are served directly from `node_modules/bootstrap-icons/font/` via a dedicated Express static route (`express.static`) — zero copy step, zero CDN.

## Dependency versioning

`package.json`: caret versions (`^`), pinned to the minor version validated in Phase 1. `package-lock.json` committed.

```json
"dependencies":    { "express": "^5.0.0", "pino": "^10.0.0", "i18next": "^26.0.0",
                     "dotenv": "^17.0.0", "bootstrap": "^5.3.0", "bootstrap-icons": "^1.11.0" },
"devDependencies": { "typescript": "^6.0.0", "tsx": "^4.20.0",
                     "typescript-eslint": "^8.0.0", "eslint": "^9.39.0", "prettier": "^3.8.0",
                     "sass": "^1.77.0",
                     "@types/express": "^5.0.0", "@types/node": "^22.0.0" }
```

Versioning notes:
- `express ^5.0.0`: the router-based architecture (`@rules/mvc.md`) assumes Express 5 (native async error propagation to error-handling middleware — no `express-async-errors` shim needed). Verify at generation (`npm view express dist-tags`).
- `pino ^10.0.0`: mandatory dependency for file + level logging (`@rules/logging.md`). Pair with `pino-pretty` in `devDependencies` only if a human-readable dev console output was validated in Phase 1 (never shipped to the production log file).
- `typescript ^6.0.0`: pin inside `typescript-eslint`'s TypeScript peer range (`>=4.8.4 <6.1.0` for v8 — re-check at generation, `npm view typescript-eslint peerDependencies`). The registry `latest` moves fast; do not blindly track it.
- `eslint ^9.39.0`: flat config mandatory (`eslint.config.mjs`). Requires Node ≥ 20.19.
- `typescript-eslint ^8.0.0`: unified package for flat config — replaces the old separate `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser`.
- `tsx`: dev-time TypeScript runner with watch mode — replaces `ts-node` for this stack. Not a runtime dependency of the built app (`dist/` runs on plain Node via `node dist/index.js`).
- `dotenv`: loads `.env` at startup — see `@rules/env-config.md`. No other secrets-management dependency unless validated in Phase 1.
- `bootstrap ^5.3.0` + `bootstrap-icons ^1.11.0`: the UI framework (`@rules/css.md`, `design-system.md`) — compiled locally via `sass`, served locally, zero CDN.
- `sass ^1.77.0` (Dart Sass, devDependency): compiles `src/views/styles/app.scss` to `public/css/app.css` (`build:css` script above).
- **i18n (if enabled in Phase 1)** — add to `dependencies`: `i18next ^26.0.0` (+ `i18next-fs-backend` if resources are loaded from disk rather than bundled JSON imports).
- **Tests (if enabled in Phase 1)** — add to `devDependencies`: `vitest ^4.1.0`, `supertest ^7.0.0` (HTTP assertions against the Express app), `@types/supertest`, plus the `"test": "vitest run"` script. Detail: `@rules/tests.md`.

> **Version maintenance**: this table and these notes reflect the state validated at the time of writing and **age quickly** — treat every version number above as *indicative*, not authoritative. Before pinning in a new project, re-confirm the current **minor and major** versions and the breaking-change / peer-range notes (`npm outdated`, `npm view <pkg> dist-tags`, the release notes). The caret rule and the structure stay; the numbers are refreshed per project in Phase 1.

## TypeScript

- `strict: true` in `tsconfig.json`. `noUnusedLocals`, `noUnusedParameters` enabled.
- Single `tsconfig.json` (no split node/web configs — the whole app is one Node process).
- `any` forbidden unless justified with a comment. Incoming route input (`req.params`/`req.query`/`req.body`) is `unknown` then validated — see `@rules/security.md`.
- TSDoc on exported classes and public methods.

## Internationalization (if enabled in Phase 1)

- `i18next`, JSON resources: `src/shared/i18n/fr.json` and `en.json`.
- All visible strings in server-rendered templates go through `t("key")`.
- Dotted-notation keys per entity: `record.saved`, `nav.settings`.
- Language resolved at request time from a persisted preference (cookie, `localStorage`-driven client hint, or session), FR by default.
- Zero visible hardcoded string in routes, services, or views. If i18n not enabled: centralized FR strings in `src/shared/i18n/fr.json` anyway (future toggle at zero cost) — exception: a "Small" project where a `LABELS` object in `shared/config.ts` is enough.

## Logging

Summary — full detail in `@rules/logging.md`.

- `pino ^10.0.0` (mandatory dependency) + `src/shared/logger.ts` (single setup point, imported first in `src/index.ts`).
- File transport: `logs/app.log`, capped at `LOG_MAX_BYTES`, level `LOG_LEVEL` (`debug` if env var `[APP_NAME]_DEBUG=1`).
- Zero `console.log` in delivered code — only `logger.*`.

## `.gitignore`

Delivered at the project root in the last batch (`@rules/mvc.md` batch table · `/local-webapp-p5-development`). Single source of truth for what stays out of the repo. Comments in English (the authoring language).

```gitignore
# --- Dependencies & build --------------------------------------------------
node_modules/
/dist/
.env

# --- App runtime data (defensive; normally under data/, outside the repo history) -
*.db
preferences.json
logs/

# --- Claude Code -----------------------------------------------------------
# Personal, never committed.
.claude/settings.local.json
.claude/agent-memory/
# NOTE: .claude/settings.json IS a delivered asset — do NOT ignore it.

# Local work plan — never committed.
tasks/

# Private specs. Only the published changelog is committed.
docs/*
!docs/release/
docs/release/*
!docs/release/CHANGELOG.md

# OS noise.
.DS_Store
Thumbs.db
desktop.ini
```

- **Build output is anchored** (`/dist/`) — the leading slash confines the pattern to the repo root.
- **App runtime data is defensive** (`*.db`, `preferences.json`, `logs/`) — the app writes them under `data/`/`logs/` in the project folder (no OS user-data directory to hide behind, unlike a desktop app), so the pattern is the actual guard here, not a safety net. `@rules/security.md`.
- **Never ignored** (delivered assets): `docs/release/CHANGELOG.md` (the negated pattern above), `.claude/settings.json`, the generated root `CLAUDE.md`, `test/`/`tests/`, and `.env.example` (documented, no secret).
- Verify the template with `git add -A` + `git status`, **not** only `git check-ignore` — the negation rules make `check-ignore` misleading.

## Integrity verification

Detailed in `@rules/verification.md`. Key points: every constant reused in more than one file lives in `src/shared/config.ts` (zero color there — the accent lives in `_custom.scss`); zero scattered `process.env.X` outside `config.ts`; dependency versions re-confirmed at generation and caret-pinned inside the documented peer ranges; `build:css` compiled and up to date.
