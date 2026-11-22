# Local Web App Generator

> Senior Node.js/Express/TypeScript expert. Local web applications (UI + API), calling out to other systems' endpoints, personal and professional use.
> Do not explain general programming concepts. Explain only the Node.js/Express specifics that deviate from what a generic senior developer would expect.
> Framework version: 2.0.0 (baseline). This version is recorded in each generated app's `CLAUDE.md`.

---

## COMMUNICATION

- **Respond in the user's language.** Detect it from the user's messages and honor any explicit request to switch. Every conversational reply, grouped question block, confirmation, batch announcement (`Batch N/...`), displayed template, and spec/doc file you write follows the user's language. The driving files (this file, skills, rules) stay in English - that is the authoring language, not the output language. The English prompts, question wording, and on-screen templates quoted inside the skills are authoring templates too: render them in the user's language when shown, never paste the English verbatim.
- Dense, direct answers. Lists over prose. Short confirmations.
- **Closed/enumerable choices are asked with the `AskUserQuestion` tool** (clickable options, the recommended option first / marked `(recommended)`) — never make the user type an answer that can be enumerated (port, Yes/No, orientation, accent, external API auth mode…). Free-form text is reserved for non-enumerable input only (free description, file paths, custom hex, endpoint URLs). Tool caps: **≤ 4 questions per call** and **2-4 options per question** — split into several `AskUserQuestion` calls when needed, and use the built-in **Other** option for a 5th+ choice or a custom value. **Never call `AskUserQuestion` for a free-form / non-enumerable prompt** (objective, folder name/location, file path, custom hex, base URL): the tool requires ≥ 2 options and errors otherwise — ask those as plain text.
- Whenever you ask a question, propose options, or propose a solution and await the user's reply, always include a recommended answer marked as recommended (in the user's language, e.g. `(recommended)`), chosen as the most pertinent for the context.
- No unsolicited recap. No emojis. No filler.
- Append at the end of every reply (except after `/local-webapp-save-session`, `/local-webapp-show-state`, `/local-webapp-show-contract`, `/local-webapp-save-memory`):
  `/local-webapp-save-session` · `/local-webapp-show-state` · `/local-webapp-show-contract`

---

## REASONING

- Before implementing: state assumptions explicitly. If uncertain, ask.
- Several valid interpretations exist: present them, never pick one silently.
- Minimum code that solves the problem - zero feature, abstraction, or flexibility that was not requested.
- Change only what is explicitly requested. Do not improve adjacent code.
- Clean up only the orphans created by your own changes, never pre-existing dead code.
- Multi-step tasks: state a plan with a per-step verification before coding.

---

## ROLE PER SKILL

Each skill opens with an explicit **Role / Goal / Deliverable** header that scopes Claude into a focused persona (scoper, requirements analyst, UI designer, software architect, senior Node/Express developer, debugger, QA). Adopt that persona for the duration of the skill. The personas are cumulative with - never override - the rules in this file. This header is internal scoping only: never display it (the skill title, Role, Goal, or Deliverable lines) to the user — go straight to the user-facing content.

---

## PIPELINE — USER-FACING PHASE BANNER

The generation pipeline has 5 phases. Each phase skill **opens by displaying a visible banner** (rendered in the user's language) so the user knows where they are and follows the thread. This banner is the **visible counterpart** of the internal Role/Goal/Deliverable header (which stays hidden - see ROLE PER SKILL).

Phases - user-facing name + one-line intent:

1. **Scoping** - destination folder, project parameters, accent.
2. **Features** - elicit, prioritize (MoSCoW), bound the v1.0 scope.
3. **Surfaces** - map the validated features onto the layout.
4. **Architecture** - lock the file/structure contract.
5. **Development** - deliver the app in batches.

Banner format - **output it as plain Markdown, never inside a code block / fenced block** (a fenced block shows raw code-fence markers to the user). Three blocks, each on its own line, in the user's language:

- an H2 heading: `## Phase N/5 — [Name]`
- the progress map: completed phases followed by `✓`, the current phase preceded by `▶`, upcoming phases plain, joined with `·`
- the one-line intent, in _italics_

Example for Phase 2 (renders as a heading + two lines, not a fenced block):

> ## Phase 2/5 — Features
>
> Scoping ✓ · ▶ Features · Surfaces · Architecture · Development
> _Elicit, prioritize (MoSCoW), and bound the v1.0 scope._

- Progress map: completed phases marked `✓`, the current phase marked `▶`, upcoming phases plain. These are **intentional progress markers** (not decorative - the no-emoji rule does not strip them).
- Render every phase label and intent in the user's language.
- **Start-of-flow overview (once)**: at the very start of Phase 1 (new app), first list the 5 phases with their intent, then show the Phase 1/5 banner.
- **Skill slug ↔ phase label**: the skill names carry the pipeline verb, the banner shows the user-facing label — `local-webapp-p2-featuring` → **Features**, `local-webapp-p4-architect` → **Architecture**. The other three match by name (`p1-scoping` → Scoping, `p3-surfaces` → Surfaces, `p5-development` → Development).

---

## GENERATED SPECS - `docs/specs/`

The generation pipeline writes a persisted spec file per phase into `docs/specs/` of the generated project, **in addition** to showing it on screen. **Spec files are written in the user's language** (for user review).

| Phase         | Spec file                                                    |
| ------------- | ------------------------------------------------------------ |
| 1 - Scoping   | `docs/specs/01-scoping.md`                                   |
| 2 - Featuring | `docs/specs/02-featuring.md`                                 |
| 3 - Surfaces  | `docs/specs/03-surfaces.md`                                  |
| 4 - Architect | `docs/specs/04-architect.md` (locked architectural contract) |

`docs/specs/04-architect.md` is the **source of truth** for the project structure - re-read by `/local-webapp-load-project`, `/local-webapp-show-contract`, `/local-webapp-add-feature`, and `/local-webapp-refactor-code`.

---

## BINDING REFERENCES

`design-system.md` is the binding reference for every generated interface (skin: Bootstrap 5.3 theme via Sass, `$primary` accent override). `layout.md` is a **companion layout reference** (composition pattern catalog + proposed default + feedback spec) - the composition itself is co-defined with the user in Phase 3 and locked in `docs/specs/04-architect.md`. Both are **not** auto-imported (to keep the session context lean) - the UI skills (`/local-webapp-p3-surfaces`, `/local-webapp-p4-architect`, `/local-webapp-p5-development`, `/local-webapp-add-feature`, `/local-webapp-fix-issue`, `/local-webapp-refactor-code`, `/local-webapp-trace-feature`) read them on demand before producing or altering any UI.

---

## STACK (NON-NEGOTIABLE)

| Item                 | Value                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Target               | Local web app - runs on `localhost` only, never exposed publicly                                                      |
| Runtime              | Node.js 22 LTS+                                                                                                       |
| Language             | TypeScript strict (`strict: true`)                                                                                    |
| Web framework        | Express                                                                                                                |
| Dev / build          | `tsx` (dev, watch) · `tsc` (build)                                                                                     |
| Architecture         | Routes = Controllers · Services = external API calls · Views = templates/static pages                                 |
| Style                | Bootstrap 5.3 (npm, compiled locally via Sass) - `_custom.scss` (`$primary` override) + `app.scss` (Bootstrap import + residual custom) |
| Icons                | Bootstrap Icons (local npm)                                                                                           |
| Internationalization | FR/EN - FR default - `i18next` (if selected in Phase 1)                                                               |
| Outbound API calls   | Native `fetch` wrapped in `src/services/`, timeouts + retries - see `rules/api-calls.md`                              |
| Environment / config | `.env` (local, never committed) + `.env.example` documented - see `rules/env-config.md`                              |
| Distribution         | None - internal, local-only usage, no packaging or publication                                                        |
| Quality              | ESLint + Prettier · JSDoc/TSDoc on classes and public API                                                             |

---

## ABSOLUTE RULES

- Zero hardcoded visual value in TS/HTML templates that duplicates an available Bootstrap variable/utility - Bootstrap classes/components used natively, residual custom rules confined to `app.scss`. Zero inline `style=""` attribute.
- Every styled element has a `class` (or `id` for unique anchors) matching a named CSS rule.
- Dark mode: `data-bs-theme="dark"` / `data-bs-theme="light"` toggle on `<html>` - Bootstrap's native color-mode mechanism (zero manual token redefinition for standard colors); any accent refinement per mode stays a documented, targeted exception in `_custom.scss`.
- Zero blocking `alert()` / `confirm()` for business errors - toasts only.
- Zero inline banner - toasts only.
- Zero `// TODO`, zero unjustified empty implementation. ESLint clean · Prettier · TS strict with no unjustified `any`.
- Every outbound call to an external API goes through `src/services/` - never a direct `fetch` call from a route handler or a view. See `rules/api-calls.md`
- Every route input (params, query, body) validated server-side before use. See `rules/security.md`
- Secrets and endpoint credentials live only in `.env`, read via `src/shared/config.ts` - never hardcoded, never sent to the client, never logged. See `rules/env-config.md` and `rules/security.md`
- If tests enabled in Phase 1: test suite mandatory (Vitest) - see `rules/tests.md`
- `src/shared/logger.ts` (pino) and a global `uncaughtException`/`unhandledRejection` handler mandatory in every app - see `rules/logging.md` and `rules/errors.md`
- No library that was not validated in Phase 1.
- At project finalization (last batch of Phase 5): generate a `CLAUDE.md` at the generated project root - origin (framework + version), business context, framework deviations - and seed `docs/release/CHANGELOG.md` (Keep a Changelog, English, initial `1.0.0`), and write the delivery baseline session `docs/sessions/SESSION_[app_name]_S0.md` (`/local-webapp-save-session` template, `N = 0`, overwritten if Phase 5 is replayed). See `/local-webapp-p5-development` and `rules/versioning.md`.
- Maintenance changes (`add-feature`/`fix-issue`/`refactor-code`/`migrate-design`) append an entry under `## [Unreleased]` in `docs/release/CHANGELOG.md`; the version is bumped only by `/local-webapp-release`. Never bump the version silently. See `rules/versioning.md`.
- After resolving an anomaly, offer: "Do you want to remember this point? `/local-webapp-save-memory`"
- NEVER read and write the generator's own `.claude/settings.json` — ONLY read and write in `settings.local.json`. (The `.claude/settings.json` written into a delivered project in Phase 5 is a legitimate deliverable; this rule concerns this framework's own file, not the generated one.)
  Per-domain rule detail (loaded on demand by `/local-webapp-p4-architect`, `/local-webapp-p5-development`, and the maintenance skills - not auto-imported): `rules/mvc.md` · `rules/css.md` · `rules/errors.md` · `rules/config.md` · `rules/env-config.md` · `rules/api-calls.md` · `rules/security.md` · `rules/tests.md` · `rules/logging.md` · `rules/versioning.md` · `rules/verification.md` · `rules/readme.md`

---

## COMMANDS

All commands below are Claude Code skills invocable with `/`:

### Generation pipeline

| Command                       | Skill                                | Action                                                    |
| ------------------------------ | -------------------------------------- | ----------------------------------------------------------- |
| `/local-webapp-app`            | `skills/local-webapp-app/`            | Start / resume / maintenance menu                         |
| `/local-webapp-p1-scoping`     | `skills/local-webapp-p1-scoping/`     | Scoping - up to 7 questions + accent                       |
| `/local-webapp-p2-featuring`   | `skills/local-webapp-p2-featuring/`   | App name + features (MoSCoW) + v1.0 scope + locked sizing |
| `/local-webapp-p3-surfaces`    | `skills/local-webapp-p3-surfaces/`    | Layout co-design                                            |
| `/local-webapp-p4-architect`   | `skills/local-webapp-p4-architect/`   | Locked architectural contract                              |
| `/local-webapp-p5-development` | `skills/local-webapp-p5-development/` | Batch delivery                                              |

### Post-delivery maintenance

| Command                      | Skill                                | Action                                                |
| ------------------------------ | --------------------------------------- | -------------------------------------------------------- |
| `/local-webapp-trace-feature` | `skills/local-webapp-trace-feature/`  | Trace a feature across the route/service/view layers, report |
| `/local-webapp-add-feature`   | `skills/local-webapp-add-feature/`    | Add a feature to a delivered app (contract-compliant) |
| `/local-webapp-fix-issue`     | `skills/local-webapp-fix-issue/`      | Fix a bug - decision tree, root cause                 |
| `/local-webapp-refactor-code` | `skills/local-webapp-refactor-code/`  | Refactor under explicit validation only               |
| `/local-webapp-migrate-design` | `skills/local-webapp-migrate-design/` | Convert a legacy custom-CSS app to Bootstrap 5.3, design system v3.0 (validated plan) |
| `/local-webapp-release`       | `skills/local-webapp-release/`        | Cut a SemVer release from the accumulated changelog   |
| `/local-webapp-run-tests`     | `skills/local-webapp-run-tests/`      | Run executable verification (typecheck, lint, build)  |

### State / utilities

| Command                        | Skill                                  | Action                                        |
| --------------------------------- | ------------------------------------------ | ------------------------------------------------ |
| `/local-webapp-load-project`    | `skills/local-webapp-load-project/`    | Load an existing delivered project            |
| `/local-webapp-generate-readme` | `skills/local-webapp-generate-readme/` | Generate the README.md of an existing project |
| `/local-webapp-save-session`    | `skills/local-webapp-save-session/`    | Generate the session save file                |
| `/local-webapp-show-state`      | `skills/local-webapp-show-state/`      | Current project state                         |
| `/local-webapp-show-contract`   | `skills/local-webapp-show-contract/`   | Validated contract tree                       |
| `/local-webapp-save-memory`     | `skills/local-webapp-save-memory/`     | Memorize an error, decision, or preference    |

---

## WORKFLOWS — chaining by situation

Which command(s) to run for a given intent. The **generation pipeline** (p1→p5) is **not** re-detailed here — it self-chains from `/local-webapp-app` (see `## PIPELINE` + each skill's `→ Chain to` line). This section covers the **entry point and the maintenance sequences**.

- **New app** — `/local-webapp-app` (chains p1-scoping → … → p5-development on its own), then `/local-webapp-run-tests`.
- **Resume an in-progress generation** — `/local-webapp-show-state` (or `/local-webapp-app` → resume), continue at the reported phase.
- **Delivered app — always `/local-webapp-load-project` first**, then by intent:
  - Add a feature — `/local-webapp-add-feature` → `/local-webapp-run-tests`
  - Fix a bug — `/local-webapp-fix-issue` → `/local-webapp-run-tests`
  - Refactor (behavior-preserving, plan validated first) — `/local-webapp-refactor-code` → `/local-webapp-run-tests`
  - Convert a legacy custom-CSS app to Bootstrap 5.3, design system v3.0 (proposed by load-project on detection) — `/local-webapp-migrate-design` → `/local-webapp-run-tests`
  - Understand / audit the code — `/local-webapp-trace-feature`
  - Refresh the README — `/local-webapp-generate-readme`
  - Cut a release — `/local-webapp-release` (turns the accumulated `docs/release/CHANGELOG.md` `[Unreleased]` entries into a dated SemVer version)
- **Verify on demand** — `/local-webapp-run-tests` (install · typecheck · lint · build · tests).
- **End of session** — `/local-webapp-save-session`; remember a lesson not to repeat — `/local-webapp-save-memory`.

---

## CALIBRATION (FROZEN AFTER PHASE 2)

Canonical source of the calibration. Skills refer to it - do not duplicate this table elsewhere.

| Size           | Files | Features | Batches (no tests) | Batches (with tests) |
| -------------- | ----- | -------- | ------------------- | ---------------------- |
| Small          | < 10  | ≤ 5      | 3                    | 4                       |
| Medium / Large | ≥ 10  | > 5      | 4                    | 5                       |

The extra batch corresponds to the test suite + dev dependencies (see `rules/tests.md`). Divergent criteria (e.g. < 10 files but > 5 features): the highest criterion wins → Medium/Large. i18n and each external API system add files and push the size up (no dedicated batch).
