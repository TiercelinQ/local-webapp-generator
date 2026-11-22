---
name: local-webapp-p4-architect
description: Phase 4 of the local web app generation cycle — complete architectural contract (tree, role of each file, API endpoints, Bootstrap variables/classes → usage table), written to the contract spec and locked after validation.
model: opus
effort: high
---

# /local-webapp-p4-architect — Architectural contract

## Role
Software architect — design the locked structure the whole build will follow.

## Goal
Produce a complete, unambiguous architectural contract that freezes the file tree, API endpoints, and CSS mapping.

## Deliverable
`docs/specs/04-architect.md` (written in the user's language) — the locked source of truth + on-screen contract.

---

**Phase banner (show first)** — before anything else, output the phase banner as plain Markdown in the user's language, **never inside a code block or fenced block**. Three blocks, each on its own line: (1) H2 heading: Phase 4/5 — Architecture; (2) progress line: Scoping ✓ · Features ✓ · Surfaces ✓ · ▶ Architecture · Development; (3) intent in italics: Lock the file/structure contract. See `## PIPELINE` in `CLAUDE.md`.

At start: read `design-system.md`, `layout.md` (no longer auto-imported), `@rules/mvc.md` (tree, batches, routes/services/views conventions) and `@rules/css.md` (Bootstrap/Sass organization). Read `docs/specs/01-scoping.md` through `03-surfaces.md` for the validated decisions.

Present (in the user's language, as plain Markdown — never inside a code block):

1. **Complete project tree** (model: `@rules/mvc.md`, `src/{shared,routes,services,views}`) with the role of each file.
2. **API endpoints table** (route → controller/route handler → service → external system called → view/response):

| Route | Method | Controller (route handler) | Service | External system called | View / response |
| ----- | ------ | --------------------------- | ------- | ------------------------ | ---------------- |
| `/entities` | GET | `entities.routes.ts` | `entities.service.ts` | — (local) | `entities/list.view` |
| `/entities/:id` | GET | `entities.routes.ts` | `entities.service.ts` | `[external system]` | `entities/detail.view` |
| `/entities` | POST | `entities.routes.ts` | `entities.service.ts` | `[external system]` | redirect + flash toast |
| `/api/preferences` | GET/PUT | `preferences.routes.ts` | `preferences.service.ts` | — (local) | JSON (fetch consumer: topbar theme control) |

   JSON routers are mounted under `/api` and page routes at `/` (`@rules/mvc.md`); write the full path in the Route column.

   The "External system called" column names the entry from `docs/specs/01-scoping.md` (or "—" for a purely local route). Every row whose service calls out goes through the dedicated wrapper in `src/services/` (`@rules/api-calls.md`) — never a direct `fetch` from a route handler or a view.

3. **Bootstrap variables & classes → usage table** (`app.scss`/`_custom.scss` and the templates that consume them):

| Variable / class | Value | Target usage |
| ------------------- | ----------- | ---------------- |
| `$primary` (`_custom.scss`) | #4682B4 (or Bootstrap default) | `.btn-primary`, `.nav-link.active`, focus ring |
| `.navbar` / `.navbar-nav` | Bootstrap native | `#topbar` |
| `.offcanvas.offcanvas-end` | Bootstrap native, `--bs-offcanvas-width` | `#drawer` |
| `.toast` / `.toast-container` | Bootstrap native | `#toast-container` |
| `.modal` | Bootstrap native | confirmation dialogs |
| …                        | …           | …                 |

   The example rows use the **default composition** (topbar + tabs, via `.navbar`). Consuming views and Bootstrap components always follow **the retained composition from `docs/specs/03-surfaces.md`** — another pattern (`layout.md` §12) replaces them with its own shell components (e.g. `.list-group.flex-column` for a sidebar, P2).

4. **Source → test mapping** (only if tests enabled in Phase 1): each source module → its `*.test.ts` file. See `@rules/tests.md`.

**→ Validation required. This contract is locked.**

Any deviation (merge, split, rename, addition, removal of a file, API endpoint, or library) requires:

1. Stop.
2. Declare the deviation + justification.
3. Validation before resuming.

**Blocking rule**: do not deliver Batch 1 until validation is explicit.

## Write the spec

Once validated, write the full contract to `docs/specs/04-architect.md` (in the user's language). This file is the **locked source of truth** re-read by `/local-webapp-p5-development`, `/local-webapp-load-project`, `/local-webapp-show-contract`, `/local-webapp-add-feature`, and `/local-webapp-refactor-code`.

→ Chain to `/local-webapp-p5-development` after validation.
