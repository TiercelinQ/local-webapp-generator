---
name: local-webapp-load-project
description: Load an existing local web app project (Phase 5 complete) from its specs and README — bring the generator rules to bear on already-delivered code. Invoke from the target project root.
model: sonnet
effort: low
---

# /local-webapp-load-project — Load an existing project

## Role
Onboarding analyst — take charge of a delivered codebase under the generator rules.

## Goal
Understand the project's structure and confirm the rules apply to any later change.

## Deliverable
A one-block confirmation (in the user's language) of the loaded project.

---

Prerequisite: invoked from the target project root, `.claude/` present.

> If the project root has not been provided in this flow, first ask: `Project root to load? (folder path)`. Read everything below relative to that root.

1. **Read the source of truth in priority order:**
   - `docs/specs/04-architect.md` (locked contract — most reliable). If present, it is authoritative for the structure and the API endpoints.
   - Other `docs/specs/*` for the scoping/analysis/layout decisions.
   - `README.md` at the root. If both specs and README are absent: offer `/local-webapp-generate-readme` and stop.
2. **Detect `test/`** via `Glob` with the pattern `test/**/*.test.*` → count the files for the Tests line.
3. Read `package.json` + walk `src/` to confirm the structure (`routes/` / `services/` / `views/` / `shared/`).
4. Confirm take-over with this exact format (in the user's language):

Project loaded: [APP_NAME] v[VERSION]

Stack : Node.js [v] · Express [v] · TypeScript
Entities detected: [list]
API endpoints: [count]
Tests : [present ([N] files) | absent]
i18n: [enabled (FR/EN) | disabled]
Design system: [v3.0 Bootstrap 5.3 | legacy custom CSS]
Changelog: [present (top vX.Y.Z, [N] unreleased entries) | absent (init offered)]
Specs: [docs/specs present: yes/no]

Generator rules applied. Ready for: development · fixes · improvements · adjustments.

5. **Design system version check.** Read the design-system version the app's `README.md` references (every generated app records it in its Accent section) and confirm with the legacy markers of `/local-webapp-migrate-design` (`src/views/styles/tokens.css` or `styles.css`, CSS custom properties `--bg` / `--primary-600` instead of Bootstrap Sass variables, a `[data-theme="dark"]` block instead of `data-bs-theme`, a Lucide sprite `public/icons/sprite.svg`, a `.tabs::after` underline, or `bootstrap` / `bootstrap-icons` / `sass` missing from `package.json`). If the app is **legacy** and its README carries no "conversion declined" note, propose **once**, right after the confirmation block: convert to Bootstrap 5.3 (design system v3.0) with `/local-webapp-migrate-design` (recommended). If the user declines, append `(Bootstrap 5.3 conversion declined on [date])` to the README's design-system reference line and do not re-propose, only on explicit request. **A legacy app is maintained in its own conventions** (its `tokens.css` / `styles.css` and existing code are the visual reference); never mix Bootstrap components into it.
5b. **Changelog / versioning check (retroactive init).** Look for `docs/release/CHANGELOG.md`. If **present**, read the top released version and count the `## [Unreleased]` entries for the confirmation block. If **absent** (app predates the versioning system), propose **once**, right after the confirmation block: initialize it with `/local-webapp-release`'s format via a seed — read the current version from `package.json` `"version"`, create `docs/release/CHANGELOG.md` (create `docs/release/`) with the Keep a Changelog preamble, an empty `## [Unreleased]`, and a `## [<current-version>] - <YYYY-MM-DD>` block noting the baseline (`### Added` / `- Baseline (changelog started).`). Proposed, not imposed; if the user declines, do not re-propose (only on explicit request). Follow `@rules/versioning.md` for the shape.
6. Read and apply all rules (`CLAUDE.md`, `@rules/mvc.md` · `@rules/css.md` · `@rules/errors.md` · `@rules/config.md` · `@rules/env-config.md` · `@rules/api-calls.md` · `@rules/security.md` · `@rules/logging.md` · `@rules/tests.md` (if tests present) · `@rules/versioning.md` · `@rules/verification.md`, `design-system.md`, `layout.md`) to any later change. The `rules/*` are not auto-imported: read them before any code change. On a legacy app (step 5) the app's own design system wins over the framework's `design-system.md` for visual conventions.
7. Any structural or security deviation detected between the code and the rules (or vs `docs/specs/04-architect.md`): report it, do not fix without a request (hand off to `/local-webapp-fix-issue` or `/local-webapp-refactor-code`).
