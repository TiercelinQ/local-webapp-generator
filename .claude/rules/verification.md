# Verification rules — single source of truth

> Centralized, reusable verification for the whole framework. Referenced by `/local-webapp-p5-development`, `/local-webapp-add-feature`, `/local-webapp-fix-issue`, and `/local-webapp-run-tests` — never duplicated in those skills.
> Two parts: **executable verification** (run real commands) and **static integrity** (read the code). Run silently; report only on a discrepancy.

---

## A. Executable verification (run the commands)

When the environment allows it (Node + npm available), these commands are **mandatory** and a failure is **blocking** — do not mark work as done while any of them fails. Run them in order:

```
npm install                  # dependencies resolve
npm run typecheck            # tsc --noEmit — MUST be clean
npm run lint                 # eslint — clean
npm run build                # tsc — succeeds
npm test                     # vitest — only if tests were enabled in Phase 1 / test/ exists
```

Rules:
- A non-zero exit or any reported error is a failure → fix the root cause, do not silence the rule. Re-run until clean.
- No packaging or distribution step exists in this framework — verification stops at `build` (and `test` when applicable). Never add a packaging/dist command.
- If Node/npm is **not** available in the environment, say so explicitly, fall back to the static checks below (read-through), and tell the user which commands they must run themselves before considering the work verified. Never claim a clean typecheck you could not run.
- Quote the relevant command output as proof when reporting completion.
- **`npm test`** (vitest): run only if tests were enabled in Phase 1 / `test/` exists — exit code 0. Otherwise skip — **do not scaffold a suite**.
- The generated app ships a `.claude/settings.json` (deny guards on secrets/artifacts + a `Stop` hook running `npm run lint`). These enforce the rules automatically in later maintenance sessions but **do not replace** this checklist.

---

## B. Static integrity (read the code)

### Every batch / every change
1. TypeScript compiles (`tsc --noEmit` mentally, then confirmed by §A when the env is available).
2. Imports: all used, none missing, unidirectional direction respected (`views → routes → services`; `shared` importable by all).
3. MVC responsibilities respected (zero business logic in view/route, zero HTTP object in service). See `@rules/mvc.md` anti-patterns.
4. Zero `// TODO`, zero unjustified empty implementation, zero unjustified `any`.
4b. Error-handling middleware registered last in `src/index.ts`; `uncaughtException`/`unhandledRejection` handlers present (see `@rules/errors.md`).
5. Node 22 LTS+ · zero deprecated API.
6. `design-system.md` compliance + the composition validated in `docs/specs/03-surfaces.md`/`04-architect.md` + the retained `layout.md` specs (toasts, modals) — Bootstrap components used natively wherever available (no custom reinvention of `.btn`/`.card`/`.modal`/`.toast`/`.navbar`/`.offcanvas`), zero hardcoded visual value that duplicates an available Bootstrap variable/utility, zero inline `style=""`. See `@rules/css.md` anti-patterns.
7. `@rules/security.md` respected (server bound to `127.0.0.1`, validated route inputs, parameterized SQL and outbound requests, CORS absent or localhost-restricted, no secret in client-facing output or logs).
8. Errors: business errors raised in the service, caught in the route, returned as `ApiResult<T>`, surfaced as toasts; no `alert()`/`confirm()`. See `@rules/errors.md`.
9. Outbound API calls: every call goes through `src/services/`, uses `fetch` with a timeout and the documented retry policy, never a direct call from a route or a view. See `@rules/api-calls.md`.

### Last batch only — cross-file
10. All inter-layer imports resolved; routes consistent end-to-end (`routes/index.ts` declaration ↔ handler ↔ view/client calls).
11. `ApiResult<T>` usage consistent across every JSON-returning route.
12. Architectural contract (`docs/specs/04-architect.md`) respected — every file, endpoint, and library matches the locked contract, or a declared+validated deviation exists.
13. Zero hardcoded visual value in templates, zero inline `style=""`.
14. i18n keys: all used, none missing (if enabled).
15. `docs/specs/` present and consistent with the delivered code.
16. `docs/release/CHANGELOG.md` present, Keep a Changelog-shaped (English), and its top released version equals `package.json` `"version"` **and** `src/shared/config.ts` `APP_VERSION` (all three agree). See `@rules/versioning.md`.
17. `.gitignore` present at the project root and correct (`@rules/config.md § .gitignore`): ignores `node_modules/`, the anchored build output (`/dist/`), `.env`, `tasks/`, `.claude/settings.local.json` + `.claude/agent-memory/`, and `docs/specs/`; **never** ignores `docs/release/CHANGELOG.md`, `.claude/settings.json`, the generated `CLAUDE.md`, `test/`, or `.env.example`. Verify with `git add -A` + `git status`, not only `git check-ignore` (the negation rules mislead it).

### Per-domain (conditional — see the matching rule for detail)
- **logging** (`@rules/logging.md`): `src/shared/logger.ts` present and conforming; imported right after `import "dotenv/config"` in `src/index.ts`; `pino` in `dependencies`; no `console.log` in delivered `src/`; every non-re-throwing `catch` calls `logger.error(...)`.
- **env-config** (`@rules/env-config.md`): `.env.example` present and documents every expected key with no real value; startup validation fails fast on a missing required variable; no scattered `process.env.X` outside `src/shared/config.ts`.
- **api-calls** (`@rules/api-calls.md`): every outbound call in `src/services/` uses the shared HTTP client with a timeout and the documented retry policy (5xx/network only, never 4xx); no secret hardcoded; outbound calls logged (method/URL/status/duration) without sensitive query params or bodies.
- **tests** (`@rules/tests.md`): if enabled, each source module has a matching test (Phase 4 mapping); `npm test` exit 0; dev dependencies present.
- **versioning** (`@rules/versioning.md`): `docs/release/CHANGELOG.md` present and English; top released version == `package.json` `"version"` == `config.ts APP_VERSION`; maintenance changes recorded under `[Unreleased]` in the right category; after `/local-webapp-release`, `[Unreleased]` reset empty and the cut block carries the right version + date.

---

## C. Reporting

- All clean → one short confirmation line in the user's language (no full recap of the checklist).
- Any discrepancy → name the file, the failing check (§A command output or §B item number), and the fix applied or proposed.
- Verification that could not be run (no Node/npm) → state it plainly and list the commands the user must run.
