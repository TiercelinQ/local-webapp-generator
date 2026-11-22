---
name: local-webapp-migrate-design
description: Convert a Node/Express local web app generated with the legacy custom CSS design system (tokens.css/styles.css, accent-tinted neutrals, signature underline, Lucide sprite) to Bootstrap 5.3 — Sass compilation, $primary accent override, Bootstrap Icons, data-bs-theme dark mode — without changing any behavior. Proposed by /local-webapp-load-project when drift is detected; runs only on explicit validation.
model: sonnet
effort: medium
---

# /local-webapp-migrate-design — Convert a legacy app to Bootstrap 5.3

## Role
Migration engineer — port a delivered app from the legacy custom design system to Bootstrap 5.3 with zero behavior change.

## Goal
The app renders under Bootstrap 5.3 (Sass compilation, `$primary` accent, Bootstrap Icons, native `data-bs-theme` dark mode) while every feature, route, service, and business rule behaves exactly as before.

## Deliverable
The converted files on disk (Sass setup, view markup switched to Bootstrap classes/components, icon usages, dependency alignment) + refreshed app `README.md` / `CLAUDE.md` / `docs/specs/04-architect.md` token table + passing verification + a conversion summary.

---

## Prerequisite

The project is loaded (`/local-webapp-load-project`) and detected as **legacy** (custom CSS design system, pre-Bootstrap). Markers: presence of `src/views/styles/tokens.css` and/or `src/views/styles/styles.css` (superseded by `_custom.scss`/`app.scss`), CSS custom properties (`--bg`, `--primary-600`, `--radius`, etc.) instead of Bootstrap Sass variables/`--bs-*`, a `[data-theme="dark"]` block instead of `data-bs-theme`, a Lucide sprite (`public/icons/sprite.svg`) instead of Bootstrap Icons, a `.tabs::after` signature underline / `placeUnderline()` script, `box-shadow: none`/`border-radius: 5px` custom rules, or an absence of `bootstrap`/`bootstrap-icons`/`sass` in `package.json` dependencies. If the app already uses Bootstrap 5.3 in full, say so and stop.

**Load context**: `design-system.md` (current, v3.0) + `layout.md` (current, v2.0) + `@rules/css.md` + `@rules/config.md` + `@rules/mvc.md` (cleanup protocol) + `@rules/verification.md`, and the app's `docs/specs/01-scoping.md` (original accent) + `docs/specs/04-architect.md` (locked contract).

## Step 1 — Inventory (read-only)

- `tokens.css`/`styles.css` (if present): current accent (`--primary-600`), custom component rules (tabs underline, modal/drawer/toast custom markup, table row styling), any `box-shadow`/literal `border-radius`.
- `docs/specs/01-scoping.md`: original accent choice — becomes the `$primary` value.
- Views (`Grep` for Lucide sprite references, custom `.modal-overlay`/`.tabs`/`.drawer` markup, inline `style=`): every element that must be re-expressed with a Bootstrap component/class.
- `package.json`: confirm absence of `bootstrap`/`bootstrap-icons`/`sass`.
- The retained composition (`docs/specs/03-surfaces.md`): maps to P1/P2/P3 in the current `layout.md`.

## Step 2 — Accent conversion decision

- Extract the accent hex from `01-scoping.md` → becomes the single `$primary` value in `_custom.scss`. Any other legacy override (background/text/border roles) is **dropped** — Bootstrap's standard theme replaces the derived-neutrals approach; note this explicitly in the conversion plan as an intentional, user-facing visual change (not a bug).
- Run the AA contrast check on `$primary` vs white/near-black (same method as `/local-webapp-p1-scoping` §2).

## Step 3 — Conversion plan (validation gate)

Present the plan (in the user's language): files touched, dependency additions (`bootstrap`, `bootstrap-icons`, `sass`), the accent decision, the component mapping table (below) instantiated with what is actually found in the app, and an explicit note that **the whole visual appearance changes** (design system replacement, not a re-skin) while **no behavior changes** (no route, service, or i18n edit). **→ Validation required before writing.**

## Step 4 — Conversion (single batch, complete files)

1. **`package.json`** — add `bootstrap`, `bootstrap-icons` (dependencies) and `sass` (devDependency); add/adjust the `build:css` script (`@rules/config.md`).
2. **Delete legacy files** — `src/views/styles/tokens.css`, `src/views/styles/styles.css`, `public/icons/sprite.svg` (full removal).
3. **Create `_custom.scss`** — the extracted `$primary` (or omitted for the Bootstrap default).
4. **Create `app.scss`** — `@import "custom"; @import "bootstrap/scss/bootstrap";` + any residual custom rule with no Bootstrap equivalent (statusbar, structural shell sizing) ported from the legacy `styles.css`, rewritten to consume `--bs-*`/Sass variables.
5. **Views** — component-by-component remap per the mapping table below; Lucide `<svg><use></use></svg>` → `<i class="bi bi-*">`; `data-theme` → `data-bs-theme`; theme toggle script updated (`document.documentElement.setAttribute("data-bs-theme", theme)`).
6. **Docs** — app `README.md`: stack line "Icons" → Bootstrap Icons, "Style" line → Bootstrap 5.3; app `CLAUDE.md`: dated migration note under `## Deviations from the framework`; `docs/specs/04-architect.md`: refresh the Bootstrap variables/classes → usage table, append a dated migration note.
7. **Changelog** — append a `### Changed` entry under `## [Unreleased]` in `docs/release/CHANGELOG.md` (`@rules/versioning.md`): `- Migrated UI from the legacy custom design system to Bootstrap 5.3.` (English, no version bump; infers MINOR at `/local-webapp-release`). If the file is absent (legacy app never initialized), skip silently and suggest `/local-webapp-load-project`.

### Component mapping table (legacy → Bootstrap 5.3)

| Legacy element | Bootstrap 5.3 target |
| --- | --- |
| `.tabs` + `.tabs::after` signature underline | `.navbar-nav` + `.nav-link.active` (native, no JS underline) |
| `.btn-primary`/`.btn-secondary`/`.btn-danger`/`.btn-ghost` | `.btn-primary`/`.btn-secondary`/`.btn-danger`/`.btn-outline-secondary` |
| `.data-table` | `.table.table-hover` |
| `.modal`/`.modal-overlay` custom | `.modal`/`.modal-dialog`/`.modal-content` native + `data-bs-toggle`/`data-bs-dismiss` |
| `#drawer` custom slide panel | `.offcanvas.offcanvas-end` native |
| `.toast` custom | `.toast`/`.toast-container` native, `data-bs-autohide`/`data-bs-delay` |
| `.has-error` field | `.is-invalid` + `.invalid-feedback` |
| Pagination custom tokens | `.pagination`/`.page-item`/`.page-link` |
| Lucide sprite icon | Bootstrap Icons `<i class="bi bi-*">` |
| `[data-theme="dark"]` | `[data-bs-theme="dark"]` |

Any icon not mappable to an obvious Bootstrap Icons equivalent: pick the closest match, verify the class name resolves, and list the chosen mapping in the conversion summary. Never invent an icon name.

## Step 5 — Verification and summary

- Run `@rules/verification.md §A` in full (`npm install` → `typecheck` → `lint` → `build`; `npm test` if the project has tests) — a failure is blocking.
- Residual grep: `tokens.css`, `styles.css`, `data-theme=` (without `bs-`), `sprite.svg`, `--primary-600`, `box-shadow: none`, `placeUnderline` must return nothing in `src/`/`public/`.
- Manual visual pass by the user: state explicitly that the whole visual language changes (Bootstrap's own look replaces the legacy custom depth-by-stroke language) — every feature must behave identically. Report the conversion summary (files, component mappings, AA result on `$primary`).
- After an anomaly: cleanup protocol (`@rules/mvc.md`), then offer `/local-webapp-save-memory`.

## Anti-patterns — what NOT to do

- **Do not** run without the Step 3 validation, and do not convert partially — the app is either fully legacy or fully Bootstrap (never a mix).
- **Do not** touch routes, services, i18n keys, or any business logic — this is a design-system replacement, not a feature change.
- **Do not** redesign the layout/composition — the retained Phase 3 composition stays; only its component implementation changes (P1/P2/P3 in `layout.md §12`).
- **Do not** improvise a Bootstrap Icons class name — map it, verify it resolves, report it.
- **Do not** leave dead residue (legacy token file, stray hardcoded hex, unused Lucide sprite reference, `placeUnderline` script).
- **Do not** try to preserve the legacy palette's derived neutrals/semantics — Bootstrap's standard theme replaces them; only the accent (`$primary`) carries over.

## Integrity verification

Detailed in `@rules/verification.md`. Key points: §A executable suite green after conversion; zero legacy token/file/Lucide/underline residue in `src/`/`public/`; `_custom.scss`/`app.scss` present and consuming Bootstrap correctly; `data-bs-theme` used throughout (zero residual `data-theme` without the `bs-` prefix); app README/CLAUDE.md/04-architect.md updated with the Bootstrap reference and the dated migration note.
