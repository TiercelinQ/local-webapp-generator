---
name: local-webapp-p5-development
description: Phase 5 of the local web app generation cycle — development and batch delivery, files written directly to disk, executable verification, final README.
model: sonnet
effort: medium
---

# /local-webapp-p5-development — Batch development

## Role

Senior Node.js/Express developer — build the contracted app to a clean, buildable state.

## Goal

Deliver the application in batches, each one typecheck/lint-clean and contract-compliant, ending with install instructions.

## Deliverable

The full project source on disk + `README.md` + verified build.

---

**Phase banner (show first)** — before anything else, output the phase banner as plain Markdown in the user's language, **never inside a code block or fenced block**. Three blocks, each on its own line: (1) H2 heading: Phase 5/5 — Development; (2) progress line: Scoping ✓ · Features ✓ · Surfaces ✓ · Architecture ✓ · ▶ Development; (3) intent in italics: Deliver the app in batches. See `## PIPELINE` in `CLAUDE.md`.

## Code rules

At start, read and fully apply: `@rules/mvc.md` · `@rules/css.md` · `@rules/errors.md` · `@rules/config.md` · `@rules/env-config.md` · `@rules/api-calls.md` · `@rules/security.md` · `@rules/logging.md` · `@rules/tests.md` (if tests) · `@rules/versioning.md` · `@rules/readme.md` · `@rules/verification.md` (not auto-imported). **Read `design-system.md` and `layout.md`** (no longer auto-imported) only before the batch that produces UI (views, then styles), by the sections that batch needs, not at start. Skip them for batches without UI. Read `docs/specs/04-architect.md` — it is the locked contract this build follows.

Critical reminders:

- ESLint clean · Prettier · TypeScript strict · TSDoc on classes and public API.
- Error handling on all critical operations; global `uncaughtException`/`unhandledRejection` handler + Express error middleware installed; file logging via pino (`@rules/logging.md`).
- Zero hardcoded visual value in TS/view templates — everything in `_custom.scss` / `app.scss` (Bootstrap-first, residual custom only).
- Every styled element has a `class` matching a CSS rule.
- No library that was not validated in Phase 1.
- Web security: `@rules/security.md` at 100%.

## Anti-patterns — what NOT to do

- **Do not** deviate from `docs/specs/04-architect.md` silently — any structural change triggers the deviation protocol (stop, declare, validate) from `@rules/mvc.md`.
- **Do not** weaken web security to make something work (`@rules/security.md`) — validated route inputs, secrets only in `.env`, CORS restricted to localhost.
- **Do not** hardcode an API endpoint URL/credential outside `src/shared/config.ts`, call `fetch` directly from a route handler or a view, or put business logic in a view.
- **Do not** leave a `// TODO`, an empty body, or a placeholder. Each batch is complete and self-contained.
- **Do not** introduce a library or a remote resource not in the contract.
- **Do not** mark the work done while `@rules/verification.md §A` is failing (see Verification below).

## Delivery

- Write to the project root chosen at the start of the flow (via `/local-webapp-app` or `/local-webapp-p1-scoping`); if it was not set in this flow, ask for it once: `Destination folder for the files? (e.g. C:\projects\MyApp)`.
- Create the folders and write the files **directly to disk** — no manual action required.
- Announcement (in the user's language): `Batch N/[total] — [content]`
- Automatic chaining between batches without confirmation.
- After each delivered batch, if the session is running long or the context is heavily loaded, offer `/local-webapp-save-session` before starting the next batch — the automatic chaining above stays the default.
- Batch split: tables in `@rules/mvc.md` (3 batches Small / 4 batches Medium-Large, frozen in Phase 2).

## Verification

Apply `@rules/verification.md` — both the executable commands (§A, blocking when the env is available) and the static integrity checks (§B). Silent — reported only on a discrepancy. Cross-file checks run on the last batch.

## Last batch — mandatory extra deliverables

- **`src/index.ts`** with the strict init order: `import "dotenv/config"` (first statement, `@rules/env-config.md`) then `import "./shared/logger"` (`@rules/logging.md`) → global `process.on("uncaughtException")` / `process.on("unhandledRejection")` handlers → config load + validation (`src/shared/config.ts`, `@rules/env-config.md`) → Express app assembled (middleware, routers registered) → global error middleware mounted last → `app.listen(config.PORT, "127.0.0.1")` (never `0.0.0.0`), with a startup log line (`Listening on http://127.0.0.1:[PORT]`). See `@rules/security.md`.
- Install and run instructions:
  ```
  npm install
  npm run dev        # development (tsx watch)
  npm run typecheck  # TypeScript verification
  npm run lint       # ESLint
  npm run build      # tsc
  npm start           # run the built app
  npm audit           # dependency vulnerability check (advisory, @rules/security.md)
  ```
  (+ `npm test` if tests enabled.)
- **`.gitignore`** written at the project root — template in `@rules/config.md §.gitignore`. Keeps `node_modules/`, the anchored build output (`/dist/`), `.env`, `tasks/`, `.claude/settings.local.json` + `.claude/agent-memory/`, and the private `docs/specs/` out of the repo, while **never** ignoring `docs/release/CHANGELOG.md`, `.claude/settings.json`, the generated `CLAUDE.md`, or `test/`.
- **`.env.example`** written at the project root, documenting every variable read via `src/shared/config.ts`: the local `PORT`, one entry per external API system declared in Phase 1 (base URL + credential placeholder, matching the auth method recorded in `docs/specs/01-scoping.md`), and any other environment variable listed in Phase 1. Every entry commented (purpose, whether required). No real secret value — placeholders only. See `@rules/env-config.md`.
- **`docs/release/CHANGELOG.md`** written at the project root (create `docs/release/`), seeded per `@rules/versioning.md` — **in English**, Keep a Changelog shape: the preamble, an empty `## [Unreleased]`, and the initial `## [1.0.0] - <YYYY-MM-DD>` block with `### Added` / `- Initial release.`. The `1.0.0` matches the app version in `package.json` / `APP_VERSION`. Later releases are cut with `/local-webapp-release`.
- `README.md` written automatically at the project root, in English (`@rules/readme.md`): objective, stack, tree, API endpoints, conventions, installation.
- **`CLAUDE.md`** written at the generated project root (in the user's language), recording the app's identity for future sessions:

  ```markdown
  # [app-name]

  ## Origin

  Framework: local-webapp v0.1.1

  ## Business context

  [What the app does — synthesized from docs/specs/02-featuring.md: objective + key features]

  ## Deviations from the framework

  - None

  ## Maintenance

  - Load the project first: `/local-webapp-load-project`
  - Change it: `/local-webapp-add-feature` · `/local-webapp-fix-issue` · `/local-webapp-refactor-code` (each records the change under `[Unreleased]` in `docs/release/CHANGELOG.md`; the version does not move)
  - Verify: `/local-webapp-run-tests`
  - Publish a version: `/local-webapp-release` (turns the accumulated `[Unreleased]` changelog into a dated version and raises the version number)
  ```

  `[app-name]` = the app name from Phase 2. The version here is the **framework** version declared at the top of the framework `CLAUDE.md` (currently 0.1.1) — not the app's own version (which starts at 1.0.0 in `package.json` / `docs/release/CHANGELOG.md`). Replace the `Deviations` list with every deviation validated via the Phase 4/5 deviation protocol (`- [deviation] — reason: [justification]`); if none, keep `- None`.

- **`.claude/settings.json`** written at the generated project root so the app stays self-enforced in later maintenance sessions:

  ```json
  {
    "permissions": {
      "allow": [
        "Bash(npm:*)",
        "Bash(npx:*)",
        "Bash(node:*)",
        "Read",
        "Write",
        "Edit"
      ],
      "deny": [
        "Read(**/.env)",
        "Read(**/.env.*)",
        "Read(**/secrets/**)",
        "Write(**/.env)",
        "Write(**/.env.*)",
        "Write(**/secrets/**)",
        "Edit(**/.env)",
        "Edit(**/.env.*)",
        "Edit(**/secrets/**)",
        "Write(**/node_modules/**)",
        "Write(**/dist/**)"
      ]
    },
    "hooks": {
      "Stop": [{ "hooks": [{ "type": "command", "command": "npm run lint" }] }]
    }
  }
  ```

  The `Stop` hook runs the fast static check at the end of each turn. Note in the README that the user can tune or remove it. **To skip it on doc-only turns** (make it conditional), replace the command with a tiny guard shipped as `scripts/stop-lint.cjs` and point the hook at `node scripts/stop-lint.cjs` (a bare inline `node -e`/shell guard is not portable across cmd/PowerShell/bash — use the script). The guard: `git status --porcelain`, run `npm run lint` **only** when a `.ts` path is present, and **degrade to always-lint** if git is unavailable (no repo / error):

  ```js
  // scripts/stop-lint.cjs — Stop-hook guard: lint only when a TS source file has uncommitted changes.
  const { execSync } = require("node:child_process");
  let changed = true;
  try {
    changed = /\.ts(\s|$)/m.test(
      execSync("git status --porcelain", { encoding: "utf8" }),
    );
  } catch {
    /* no git → lint */
  }
  if (changed) execSync("npm run lint", { stdio: "inherit" });
  ```

  **Deny anchoring (deliberate):** no deny pattern may ever match `docs/release/CHANGELOG.md` (written at delivery and by the maintenance/release skills).

- **`docs/sessions/SESSION_[app_name]_S0.md`** written at the project root (create `docs/sessions/`) — the **delivery baseline** session, produced automatically here, no user action. Apply the `/local-webapp-save-session` template as-is (that skill stays the single source of the format) with `[N]` **forced to `0`**: `Completed phase: 5 — Development`, `Next phase: — (delivered — maintenance via /local-webapp-load-project)`, every delivered batch checked, locked decisions and open points filled. **Overwrite** it if it already exists (Phase 5 replayed). `S0` is reserved for this baseline; manual `/local-webapp-save-session` saves keep numbering from `1`.
- Confirm `docs/specs/` is present and consistent with the delivered code.

## Test batch — only if Phase 1 tests = Yes

Add a final dedicated batch: announce `Batch [final]/[total] — test/ + dev dependencies`. Deliver `test/` mirroring `src/` (per `@rules/tests.md`: route/controller pattern with mocked service calls via `vi`, no real network call), `vitest.config.ts`, the dev dependencies (`vitest`, `supertest` if used for route tests) and the `"test": "vitest run"` script. Append the `npm test` instruction to the README.

## Final delivery summary

Once the last batch (plus the tests batch if any) is delivered, close Phase 5 with a **delivery summary** in the user's language. **Make every file and the project folder a clickable Markdown link** `[label](path)`, each path pointing to the real on-disk location under the project root (relative to the project root, or absolute if the project root lies outside the current workspace). **Valid link syntax (mandatory)**: a Markdown link destination cannot contain spaces unless wrapped in angle brackets. When the path contains spaces (typical of absolute Windows paths), wrap the destination in `<…>` and use forward slashes, e.g. `[README.md](<E:/Informatique/1-projects/.../my-app/README.md>)`. Without spaces, a plain relative path is fine. List:

- **Project folder** — the project root (clickable).
- **README.md** — how to run, stack, tree, conventions (clickable).
- **Generated `CLAUDE.md`** — the app identity for future sessions (clickable).
- **`.env.example`** — the documented environment variables (clickable).
- **Documentation — phase specs** — one clickable link each: `docs/specs/01-scoping.md`, `docs/specs/02-featuring.md`, `docs/specs/03-surfaces.md`, `docs/specs/04-architect.md`, plus the delivery baseline `docs/sessions/SESSION_[app_name]_S0.md`.
- **How to run** — the key commands (also in the README):

  ```
  npm install
  cp .env.example .env   # fill in the real values
  npm run dev
  npm audit               # dependency vulnerability check (advisory)
  ```

  (+ `npm test` if tests enabled.)

- **Maintenance & release** — after delivery: `/local-webapp-load-project` first, then `/local-webapp-add-feature` · `/local-webapp-fix-issue` · `/local-webapp-refactor-code` to change it, `/local-webapp-run-tests` to verify, and `/local-webapp-release` to publish a version (it turns the accumulated `[Unreleased]` changelog into a dated version and raises the number). The same reminder is recorded in the generated `CLAUDE.md`.

The summary points to the documents; it does not restate them.

## Post-delivery adjustments

Isolated fix on the affected file + direct dependencies. Deliver the complete fixed file.
After resolving an anomaly: cleanup report (`@rules/mvc.md`) then offer `Do you want to remember this point? /local-webapp-save-memory`.
