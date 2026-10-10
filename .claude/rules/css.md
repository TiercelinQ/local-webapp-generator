# CSS rules — file organization, naming, application

> Component specs, palette, and layout values live in `design-system.md` (binding reference) and `layout.md` (composition). This file governs **where Sass/CSS lives, how the accent is applied, and how Bootstrap is consumed** — it does not restate component specs.

## Files

| File                                    | Role                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `src/views/styles/_custom.scss`         | `$primary` override (+ any other validated Bootstrap Sass variable override), imported **before** `bootstrap/scss/bootstrap` |
| `src/views/styles/app.scss`             | Entry point: `@import "custom";` then `@import "bootstrap/scss/bootstrap";`, plus any residual custom rule Bootstrap does not cover |
| `public/css/app.css`                    | Compiled output (`npm run build:css`) — **generated, never hand-edited**, committed        |
| Bootstrap Icons (`bootstrap-icons` npm) | Served from `node_modules/bootstrap-icons/font/` via a dedicated Express static route      |

Linked once by the base layout template: `<link rel="stylesheet" href="/css/app.css">` — a single compiled file contains Bootstrap + the residual custom rules.

## Absolute rules

1. **Bootstrap classes/components first.** A visual need is expressed with a Bootstrap utility class or native component before any custom rule is written. Custom CSS is the exception, not the default.
2. **Zero reinvention of an existing Bootstrap component.** Never hand-build a custom `.btn`, `.card`, `.modal`, `.toast`, `.navbar`, `.offcanvas`, `.dropdown`, or `.pagination` — the native component is used, even when it requires more markup than a bespoke `<div>`.
3. **Dark mode is `data-bs-theme="dark"` / `data-bs-theme="light"` on `<html>`** — Bootstrap's native color-mode mechanism, zero manual token redefinition for standard colors. The only tolerated exception: a targeted, documented `--bs-primary` redefinition inside a `[data-bs-theme="dark"]` block in `app.scss`, when the accent itself must differ per mode (rare — `design-system.md §14`). No `[data-theme]` selector (without the `bs-` prefix), no `@media (prefers-color-scheme)` anywhere.
4. **Residual custom rules confined to `app.scss`**, in a clearly marked block below the Bootstrap imports — only for what Bootstrap does not cover (e.g. the statusbar, structural shell sizing).
5. **`$primary` is the default single point of color customization.** Any further Bootstrap Sass variable override (`$border-radius`, `$font-family-sans-serif`, `$spacer`…) is a validated Phase 1 decision, documented in `docs/specs/01-scoping.md` and `docs/specs/04-architect.md`.
6. **Naming conventions**: Bootstrap classes used as shipped, never renamed or wrapped. Residual custom classes are kebab-case, prefixed to avoid any collision with Bootstrap's own namespace (e.g. `.app-statusbar`, not `.statusbar`). `id` reserved for the unique shell anchors of the **retained composition** (default pattern: `#topbar`, `#main-content`, `#statusbar`, `#toast-container`, `#drawer`, `#app-shell`; alternative patterns add theirs — `layout.md` §12).
7. **One CSS framework: Bootstrap 5.3** (npm, compiled Sass). Zero other CSS framework, zero CSS-in-JS, zero CSS Modules.
8. `box-shadow` is used freely — Bootstrap's own shadow utilities (`.shadow-sm`, `.shadow`, `.shadow-lg`) and native component shadows are the norm, not an exception.
9. **No hardcoded `z-index`** — use Bootstrap's native `$zindex-*` variables (`design-system.md §15`).
10. **`prefers-reduced-motion`**: Bootstrap 5.3 already respects it natively on its own JS-driven component transitions (collapse, fade, offcanvas). Add a residual `@media (prefers-reduced-motion: reduce)` rule in `app.scss` only if a project-specific custom animation is introduced.

## Theme toggle

```js
// public/js/theme.js — principle
document.documentElement.setAttribute("data-bs-theme", theme); // "light" | "dark"
localStorage.setItem("theme", theme); // or a server-persisted preference — layout.md §10
```

- Initial theme: persisted preference, otherwise OS theme (`prefers-color-scheme` read server-side or client-side before first paint, so the initial HTML ships with the resolved `data-bs-theme` — no flash).
- Bootstrap's own components follow automatically — no action needed beyond setting the attribute.

## Internal organization of `_custom.scss`

```scss
// _custom.scss — [APP_NAME]
// Reference: design-system.md v3.0 (Local Web App) — project accent
$primary: #4682B4;          // Phase 1 accent choice — optional, omit for Bootstrap default
// $border-radius: ...;      // optional project-level override, validated in Phase 1 if used
// $spacer: ...;             // optional project-level override, validated in Phase 1 if used

// Optional: dark-mode-specific accent refinement (rare, documented exception — design-system.md §14)
// [data-bs-theme="dark"] { --bs-primary: ...; }
```

## Internal organization of `app.scss`

```scss
// app.scss — [APP_NAME]
// Reference: design-system.md v3.0 (Local Web App) — layout.md v2.0
@import "custom";
@import "bootstrap/scss/bootstrap";

// --- RESIDUAL CUSTOM RULES (only what Bootstrap does not cover) -----------
// token: $statusbar-height (design-system.md §5)
#statusbar { height: $statusbar-height; }

// structural shell sizing specific to the retained composition (layout.md §12)
#app-shell { ... }

// --- REDUCED MOTION (only if a residual custom animation was added) -------
@media (prefers-reduced-motion: reduce) {
  /* neutralize the project-specific animation only — Bootstrap's own
     JS-driven transitions already respect this natively */
}
```

## Per-project accent

In Phase 1 the project picks an **accent** (named preset or custom hex) — the single override of the Bootstrap theme (`design-system.md §2`). Claude writes it as a single `$primary: #hex;` line in `_custom.scss` (or omits the line entirely for the Bootstrap default). No derivation: Bootstrap's own Sass compiles every dependent shade (`--bs-primary-rgb`, hover/active states, focus ring) automatically. The default `design-system.md` accent catalog stays unchanged; a custom accent replaces only this one line in `_custom.scss`.

## Anti-patterns — what NOT to do

- **Do not** hand-build a custom `.btn`, `.card`, `.modal`, `.toast`, `.navbar`, `.offcanvas`, `.dropdown`, or `.pagination` — use the native Bootstrap component.
- **Do not** write a literal color/size that duplicates an available Bootstrap variable or utility class — use the variable/utility.
- **Do not** add a `[data-theme]` selector (without `bs-`) or a `@media (prefers-color-scheme)` — dark mode lives in Bootstrap's native `data-bs-theme` mechanism.
- **Do not** introduce a second CSS framework, CSS-in-JS, or CSS Modules alongside Bootstrap.
- **Do not** use an `id` for styling beyond the shell anchors — use a Bootstrap or residual custom class.
- **Do not** hardcode a `z-index` — use Bootstrap's `$zindex-*` variables.
- **Do not** edit `public/css/app.css` by hand — it is generated by `npm run build:css` from `app.scss`.
- **Do not** load Bootstrap or Bootstrap Icons via CDN — npm only, compiled/served locally.
- **Do not** add a Bootstrap Sass variable override beyond `$primary` without validating it in Phase 1 and documenting it in the architecture contract.

## Integrity verification

Detailed in `@rules/verification.md`. Key points: `app.scss` imports `custom` before `bootstrap/scss/bootstrap`; `public/css/app.css` up to date (recompiled after any Sass change); zero hand-built reinvention of an existing Bootstrap component; `data-bs-theme` used throughout (zero residual `data-theme` without the `bs-` prefix); zero CDN reference for Bootstrap or Bootstrap Icons; residual custom rules confined to the marked block of `app.scss`.
