# Changelog

All notable changes to this generator are documented in this file.
The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.
(This is the changelog of the **generator** itself, distinct from the `docs/release/CHANGELOG.md` of each generated app.)

## [2.0.0] - 2026-11-22
### Added
- `.claude/scripts/` with three dependency-free Node scripts: `bump-release.mjs`, `run-verification.mjs` and `static-checks.mjs`. Tested on fixtures only, not on a generated project. The commands that could call them are unchanged.

### Changed
- **Major version.** Every skill now carries an `effort` field and a rebalanced `model` (`opus` for `p1-scoping`, `p2-featuring`, `p4-architect`, `fix-issue` and `refactor-code`, `haiku` for `release` and `run-tests`), which changes the cost profile of every command. Values come from the 2026-11-22 cost and quality audit and the Claude Code skill frontmatter documentation.
- `local-webapp-show-state` names its sources (the latest `docs/sessions/SESSION_*_S*.md`, then `docs/release/CHANGELOG.md`) instead of risking an invented state.
- `local-webapp-p5-development` loads `@rules/readme.md` and writes the delivered `README.md` in English; it reads `design-system.md` and `layout.md` only before the batch that produces UI.
- `local-webapp-trace-feature` points at `src/index.ts` and `src/shared/errors.ts`, the files the generator actually delivers.
- `local-webapp-save-memory` asks the memory category with `AskUserQuestion` instead of a typed A-D choice.
- `local-webapp-app` maintenance menu routes `/local-webapp-generate-readme`.
- `rules/verification.md` lists the skills that load it (all 8 of them, not 4).

## [0.1.1] - 2026-10-26
### Fixed
- Orphan database leftovers removed: no `@rules/db.md` reference, no `DB_FILENAME` / `DB_SCHEMA_VERSION` in the `config.ts` template, no DB bullet in `rules/verification.md`, no `*.db` in the `.gitignore` template (Phase 1 asks no database question).
- `local-webapp-load-project` now checks the design system version (new step 5), proposes `/local-webapp-migrate-design` once for a legacy custom-CSS app and records a dated refusal note; `/local-webapp-app` lists `migrate-design` in the maintenance menu; the generated README Accent section records `design-system v3.0`.
- Reference tree aligned across `rules/mvc.md`, `README.md` and `GUIDE.md`: `src/shared/http-client.ts`, `src/app.ts` (if tests), `docs/release/`, `docs/sessions/`, `test/`, a single `tsconfig.json`; the GUIDE lists `rules/versioning.md` and three layout patterns (P1 to P3).
- CALIBRATION closing sentence no longer lists tests as a size push (the test suite has its own batch); the Phase 1 question count reads "up to 7 questions plus the accent" everywhere.
- Phase 5 init order and bind address: `dotenv/config` first, then the logger, then `app.listen(config.PORT, "127.0.0.1")` (was an undefined `setupLogging()` and `localhost`); `npm audit` added to the install and run instructions as an advisory check.
- Stale design-system labels ("design system v2.0") replaced by the Bootstrap 5.3 / v3.0 wording in `CLAUDE.md` and `rules/versioning.md`.

### Changed
- JSON routers are mounted under `/api` (page routes at `/`); examples, tests and the Phase 4 endpoints table use the full `/api/...` paths.
- One service function name in the examples (`saveRecord`), `npm test` used consistently in prose, `@rules/x.md` notation in `p1-scoping`, `p4-architect` and `p5-development`, "palette" wording replaced by "accent", Python/Electron derivation leftovers removed from `README.md` and `rules/config.md`.

## [0.1.0] - 2026-08-30
- Initial baseline, derived from the Electron app generator: 5-phase generation pipeline (p1 scoping to p5 development), calibration, MVC-style route/service/view contract, outbound API call conventions, local `.env` configuration, design system (Bootstrap 5.3 compiled via Sass, `$primary` accent override, Bootstrap Icons, `data-bs-theme` dark mode), and the maintenance skill set.
