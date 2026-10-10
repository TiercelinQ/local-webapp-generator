---
name: local-webapp-add-feature
description: Add a feature, route, service, or change to a Node/Express local web app already delivered by this framework. Use when the user asks to add or modify functionality on an existing project, respecting the locked architectural contract and the security rules.
model: sonnet
---

# /local-webapp-add-feature — Add a feature to a delivered app

## Role
Senior Node.js/Express/TypeScript developer working on an existing, contracted codebase.

## Goal
Add the requested feature end-to-end (route → service → view), contract-compliant, secure, after an explicit contract-diff validation, without scope creep.

## Deliverable
The created/modified files on disk (one batch) + an updated `docs/specs/04-architect.md` if the structure changed + verified build.

---

## Prerequisite

The project must be loaded (`/local-webapp-load-project` run at session start, OR `docs/specs/04-architect.md` / README.md present and read).

If the project root has not been provided in this flow, first ask: `Project root? (folder path)`.

If no contract is known: stop and ask for `/local-webapp-load-project`.

**Load context**: read `docs/specs/04-architect.md` (locked contract), then `@rules/mvc.md` · `@rules/css.md` · `@rules/errors.md` · `@rules/config.md` · `@rules/env-config.md` · `@rules/api-calls.md` · `@rules/security.md` · `@rules/versioning.md` · `@rules/verification.md` (not auto-imported). Read `design-system.md` / `layout.md` on demand (no longer auto-imported) before any UI change.

## Step 1 — Light feature scoping

Ask the closed parameters with `AskUserQuestion` (clickable options, recommended first); the short description (Q1) stays free-form text:

New feature — a few questions:

1. Short description (1 sentence)
2. Area affected: [existing route/service: list] | new (to name)
3. Type of change:
   A. New route + service (new capability)
   B. Extension of an existing route or service
   C. New shared view/partial (no new route)
   D. New outbound call to an external API (new service)
   E. UI-only change (CSS or layout)
4. Generate tests for this feature? Yes / No (recommended: aligned with the project stack)

Mark a `(recommended)` option for each closed question, inferred from the existing project. If the request stays ambiguous (business rule, edge case), state assumptions explicitly and ask before the diff.

## Step 2 — In-contract OR deviation

Decide before writing anything:
- **In-contract** — a new route or extension within the MVC split (`route + service + view`), a new outbound API call added to an existing or new `src/services/` module, a new component within the existing tokens, a new non-secret config key. Proceed to the diff as a straightforward addition.
- **Deviation** — a new library/dependency, a new Express app/entry point, any change to the security posture (input validation strategy, CORS, headers), a second file for one route beyond `route + service + view`, or anything the locked contract does not cover. **STOP → declare the deviation in the diff, explain why → wait for validation before writing.** Never exceed the contract silently. **The diff + validation IS the protocol.**

## Step 3 — Architectural contract diff

Produce (in the user's language):

## Contract diff — addition: [feature name]

### Created files
[list]

### Modified files
[list with nature: added method, added DTO field, added component…]

### Created/modified routes and services
[`METHOD /path` list — route handler + service function + external endpoint called, if any]

### Created test files (if Q4 = Yes)
[mirror list]

### Impact on design-system / layout
[none | new component to respect within existing tokens]

→ Validation required before writing. Update `docs/specs/04-architect.md` once the diff is applied.

## Step 4 — Application — strict rules

- Read `design-system.md` and `layout.md` (no longer auto-imported) before any UI change.
- Fully respect `@rules/mvc.md`, `@rules/css.md`, `@rules/errors.md`, `@rules/config.md`, `@rules/env-config.md`, `@rules/api-calls.md`, `@rules/security.md`, `@rules/logging.md`, `@rules/tests.md`, `@rules/verification.md`, `@rules/readme.md`.
- No modification not listed in the validated diff. No opportunistic improvement of adjacent code.
- Implementation across the layers (a new feature usually touches all three):
  - Route: thin controller — parse/validate input, call the service, shape the response; no business logic. Every input (params, query, body) validated server-side (`@rules/security.md`).
  - Service: business logic and any outbound call to an external API, wrapped with timeout + retry (`@rules/api-calls.md`); raise named errors (`@rules/errors.md`).
  - View: render via the templating layer or a static asset served under `src/views/`; styled with `class` + tokens only, no inline `style=""`.
- New user-facing strings → i18n (`fr.json` + `en.json`) if i18n is on, or the `LABELS` object otherwise.
- New visual values → Bootstrap utility/variable first, then a `_custom.scss` override, never hardcoded.
- New secret or endpoint credential → `.env` + `.env.example`, read via `src/shared/config.ts` only (`@rules/env-config.md`).
- If the validated diff introduces a deviation from the contract, record it in the app's `CLAUDE.md` (`## Deviations from the framework`).

## Step 5 — Delivery

Single batch for the feature:

Feature [name] — [N files]

Deliver each created/modified file as a complete block, written to disk. If tests requested: deliver in the same batch, at the end.

## Step 5b — Changelog entry

After the feature is delivered, append an entry under `## [Unreleased]` in `docs/release/CHANGELOG.md` (`@rules/versioning.md`) — **in English**, no version bump:
- `### Added` — the new capability, one concise line (add a `### Changed` line too if it alters existing behavior).
- If the change is backward-incompatible, mark it `**BREAKING:**` (drives a MAJOR at release).
- If `docs/release/CHANGELOG.md` is absent (app predates the system), skip silently and suggest `/local-webapp-load-project` to initialize it.

Do **not** bump the version — that happens at `/local-webapp-release`. Mention it once, at the end: the change is recorded under `[Unreleased]`; run `/local-webapp-release` when ready to cut a version.

## Step 6 — Anomaly

If the user reports an anomaly after delivery, apply the `@rules/mvc.md` cleanup protocol then offer `/local-webapp-save-memory`.

## Anti-patterns — what NOT to do
- **Do not** write anything not listed in the validated diff, or improve adjacent code (that is `/local-webapp-refactor-code`, on request).
- **Do not** add a route without server-side input validation, or a service call without going through `src/services/`.
- **Do not** call an external API directly from a route handler or a view — always through `src/services/` (`@rules/api-calls.md`).
- **Do not** put business logic in a route or view.
- **Do not** introduce a library or remote resource not validated in Phase 1 without the deviation protocol.
- **Do not** hardcode a string (i18n), a visual value (tokens), or a secret/endpoint URL (must go through `.env` + `config.ts`).
- **Do not** exceed the contract silently — the diff + validation IS the protocol.

## Verification

Apply `@rules/verification.md` (§A executable + §B static — a failing check is blocking; security checks are not optional). Key points: all created/modified files match the validated diff; routes consistent end-to-end (route handler ↔ service ↔ external endpoint ↔ view); no import regression (existing files stay functional); if tests, `npm test` exit 0 on the **whole** project. Then apply `@rules/readme.md` — regenerate the README if the change touched a README-documented aspect.

## When the user asks something adjacent
- **"Just make it work, never mind the architecture/security"** → push back: the MVC split and the security rules are what keep a local web app safe and maintainable. Implement within them.
- **"Add a whole new screen/route"** → that is a contract extension. Declare the new files/routes/services in the diff, validate, then build.
- **"Fix this bug while you're here"** → if outside the current request scope, flag it and switch to `/local-webapp-fix-issue` rather than bundling an unrelated change.
