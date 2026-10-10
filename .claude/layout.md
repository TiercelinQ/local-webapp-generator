# Layout System — v2.0 (Local Web App)

> Companion layout reference — not a constraint. This file provides: (1) a **proposed default
> composition** and a **catalog of alternative composition patterns** (§12) that Claude co-designs
> from in Phase 3, the user amending or replacing freely;
> (2) the **feedback spec** (toasts, modals) serving the error contract; (3) **defaults and
> technical recommendations** (dimensions, behaviors) — never a composition restriction.
> The retained composition is the one validated in `docs/specs/03-surfaces.md` and locked in
> `docs/specs/04-architect.md`.
> Built on `design-system.md v3.0 (Local Web App)`. The two files are inseparable.

## Changelog

| Version | Date       | Main change                                                                             |
| ------- | ---------- | ------------------------------------------------------------------------------------------ |
| v2.0    | 2026-08-30 | **Retranslated to Bootstrap 5.3 native components** (navbar, offcanvas, toast, modal) — the same 3 composition patterns and feedback spec, now expressed with Bootstrap markup and Sass variables instead of the v1.0 custom CSS tokens. Signature underline removed (native `.nav-link.active`); drawer default width now Bootstrap's native 400px (was 320px); table row alternation is available again via `.table-striped` (was disabled). |
| v1.0    | 2026-08-30 | (superseded) baseline for local-webapp, derived from the Electron generator `layout.md v4.1`: same composition pattern catalog, toast spec and recurring components, adapted from a desktop `BrowserWindow` to a browser tab and from IPC-persisted preferences to server-persisted or `localStorage` preferences |

Every generated application references the active version in its `README.md`.

---

## 1. GLOBAL STRUCTURE

Proposed default composition — submitted in Phase 3, amendable or replaceable by the user.

```
┌─────────────────────────────────────────────────────┐
│              TOPBAR — .navbar (48-56px)              │
│  [ Logo / Name ]  [ Nav tabs ]  [ Theme ]          │
├─────────────────────────────────────────────────────┤
│                                                     │
│            MAIN CONTENT                             │
│            (scrollable area)                        │
│                                                     │
├─────────────────────────────────────────────────────┤
│                STATUSBAR (28px)                     │
└─────────────────────────────────────────────────────┘
```

Proposed default HTML skeleton (server-rendered layout template):

```html
<div id="app-shell">                                    <!-- grid rows: navbar-height 1fr statusbar-height -->
  <nav id="topbar" class="navbar navbar-expand-lg border-bottom">
  <main id="main-content">
  <footer id="statusbar" class="border-top">
  <div id="toast-container" class="toast-container position-fixed">  <!-- Bootstrap native toast stack -->
  <div id="drawer" class="offcanvas offcanvas-end">       <!-- optional -->
</div>
```

**Right drawer** (optional, Bootstrap `.offcanvas`, over the content):

```
┌─────────────────────────────────────────────────────┐
│                     TOPBAR                          │
├───────────────────────────────┬─────────────────────┤
│                               │                     │
│       MAIN CONTENT            │  DRAWER (400px)     │
│       (reduced)               │  Bootstrap offcanvas │
│                               │                     │
├───────────────────────────────┴─────────────────────┤
│                   STATUSBAR                         │
└─────────────────────────────────────────────────────┘
```

**Toast** (Bootstrap `.toast-container`, top-right corner by default):

```
┌─────────────────────────────────────────────────────┐
│                     TOPBAR              [ Toast 1 ] │
├─────────────────────────────────────────[ Toast 2 ]─┤
│                                                     │
│            MAIN CONTENT                             │
│                                                     │
├─────────────────────────────────────────────────────┤
│                   STATUSBAR                         │
└─────────────────────────────────────────────────────┘
```

---

## 2. BROWSER WINDOW / PAGE

Default values — customizable in Phase 3.

| Token / option     | Default                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| minimum viewport    | 1024×768 (below this, layout degrades gracefully — `.navbar-expand-lg` collapses to a toggler at Bootstrap's `lg` breakpoint) |
| default port         | `3000` (overridable via `.env` `PORT`)                                     |
| theme on first visit | follows the OS/browser theme (`prefers-color-scheme`), resolved to `data-bs-theme` |
| `<title>`             | app name                                                                    |
| favicon               | `public/favicon.ico` (provided by the user, otherwise a generic placeholder) |
| initial paint         | server-rendered HTML with the resolved `data-bs-theme` already applied (no flash) |

---

## 3. TOPBAR — Bootstrap Navbar

| Token              | Default                  |
| -------------------- | --------------------------- |
| markup              | `.navbar.navbar-expand-lg.border-bottom`, `--bs-navbar-height` (Bootstrap default) |
| light mode bg       | `--bs-body-bg`               |
| dark mode bg        | `--bs-body-bg` (redefined natively by `data-bs-theme="dark"`) |
| bottom border       | `.border-bottom` (`--bs-border-color`) |
| horizontal padding  | Bootstrap navbar default container padding |

### Topbar zones (left → right)

```
[ .navbar-brand ]  [ .navbar-nav / .nav-link ]  ···  [ Theme toggle ]
```

| Zone   | Content                          | Bootstrap markup           |
| -------- | ----------------------------------- | ------------------------------ |
| Left   | SVG logo + app name                | `.navbar-brand`               |
| Center | Navigation tabs                    | `.navbar-nav` + `.nav-link`   |
| Right  | Light/dark theme selector          | icon button, `.btn.btn-outline-secondary` or plain `.nav-link` |

### Logo / App name

- `.navbar-brand` — icon (Bootstrap Icons `fs-4`) + label.
- Not clickable, unless the composition needs a "home" affordance (Phase 3 choice).

### Navigation tabs (`.navbar-nav`)

- `<a class="nav-link">` (or `<button class="nav-link">` for a SPA-style client-side switch) inside `.navbar-nav`, mounted in `.navbar-collapse` for responsive behavior (`.navbar-toggler` below the `lg` breakpoint).
- 5 visible tabs recommended at most; beyond, a Bootstrap `.dropdown` keeps the topbar readable.
- **Active tab**: native `.nav-link.active` (`aria-current="page"`). **No signature underline** — Bootstrap's own active-state styling is the only visual indicator.
- Inactive tab: default `.nav-link` styling.
- Hover: native Bootstrap `.nav-link:hover` — no custom "border strengthening" token.

### Theme selector

- Bootstrap Icons only (`bi-sun` / `bi-moon`), inside a `.btn.btn-outline-secondary` or a plain `.nav-link`.
- Mandatory `title`: "Passer en mode sombre" / "Passer en mode clair".
- Instant toggle — `data-bs-theme` switched on `<html>` + persisted (cookie or `localStorage`, so it survives a reload without a server round-trip; a signed-in/single-user local app may instead persist it server-side).

---

## 4. MAIN CONTENT AREA

| Token             | Default                            |
| ------------------- | -------------------------------------- |
| light mode bg      | `--bs-body-bg`                       |
| dark mode bg       | `--bs-body-bg` (native color-mode)   |
| inner padding      | `.p-4` (Bootstrap spacing scale, §4 of `design-system.md`) |
| scroll             | vertical — `overflow-y: auto`        |
| max content width  | `.container` / `.container-xl` (Bootstrap responsive container) |

### Section header

```
[ Section title ]   [ Subtitle / short description ]
```

- Title: `<h2>` or `.h2`, Bootstrap default heading weight.
- Subtitle: `.text-body-secondary`, `.small` or `.fs-6`.
- Bottom margin: `.mb-4` before the content.

---

## 5. TOAST — Bootstrap native

Fully replaces the inline banner. No inline banner in the applications.
Component: `src/views/partials/toast-manager` template + Bootstrap's own JS toast component — `#toast-container.toast-container.position-fixed`.

### Position — Phase 3 choice

6 positions available, mapped to Bootstrap positioning utilities. Default: `top-right`.

| Position        | Bootstrap utility classes            |
| ----------------- | ---------------------------------------- |
| `top-right`      | `.position-fixed.top-0.end-0`          |
| `top-left`       | `.position-fixed.top-0.start-0`        |
| `top-center`     | `.position-fixed.top-0.start-50.translate-middle-x` |
| `bottom-right`   | `.position-fixed.bottom-0.end-0`       |
| `bottom-left`    | `.position-fixed.bottom-0.start-0`     |
| `bottom-center`  | `.position-fixed.bottom-0.start-50.translate-middle-x` |

> Motion: Bootstrap's own toast fade transition (native JS component) — nothing custom to write.

### Margins and stacking

| Token                          | Value                                        |
| --------------------------------- | ------------------------------------------------ |
| width                            | Bootstrap toast default (auto, content-based, capped by `.toast-container`) |
| margin from edge                 | `.m-3` (Bootstrap spacing utility)               |
| spacing between toasts           | `.toast-container`'s native `gap` (Bootstrap 5.3) |
| stacking                         | Vertical, queue, no overlap (native `.toast-container` behavior) |

### Implementation

- The toast client script instantiates Bootstrap's `bootstrap.Toast` component per message, appended to `#toast-container` positioned per `TOAST_POSITION`.
- `TOAST_POSITION` (`src/shared/config.ts`) = `"top-right"` by default, modified per Phase 3 choice.
- Server-rendered actions that need to show a toast after a redirect (e.g. form submit) pass the message via a short-lived flash mechanism (query param or session-backed flash), read once by the client script on load.

### Display durations

| Type      | Duration   | Manual dismiss    | Bootstrap attributes                          |
| ----------- | ------------ | -------------------- | -------------------------------------------------- |
| `success` | 4s          | No                   | `data-bs-delay="4000"`                            |
| `info`    | 4s          | No                   | `data-bs-delay="4000"`                            |
| `warning` | 6s          | Yes (`.btn-close`)  | `data-bs-delay="6000"`                            |
| `danger`  | persistent  | Yes (`.btn-close`) mandatory | `data-bs-autohide="false"`                |

### Toast anatomy — Bootstrap native

```html
<div class="toast text-bg-{{variant}}" role="alert">
  <div class="toast-header">
    <i class="bi bi-{{icon}} me-2"></i>
    <strong class="me-auto">{{message}}</strong>
    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
  </div>
  <div class="toast-body">{{description}}</div> <!-- optional -->
</div>
```

| Type      | Variant class      | Icon (Bootstrap Icons) |
| ----------- | --------------------- | ------------------------- |
| `success` | `.text-bg-success`   | `bi-check-circle`        |
| `warning` | `.text-bg-warning`   | `bi-exclamation-triangle`|
| `danger`  | `.text-bg-danger`    | `bi-x-circle`             |
| `info`    | `.text-bg-info`      | `bi-info-circle`          |

> Layering: `.toast-container` uses `$zindex-toast` (Bootstrap native), above modals — a persistent `danger` toast is never hidden.

---

## 6. RIGHT DRAWER — Bootstrap Offcanvas

Optional component. Default values below.

| Token         | Default                                                                     |
| --------------- | -------------------------------------------------------------------------------- |
| markup         | `.offcanvas.offcanvas-end`                                                      |
| width          | `--bs-offcanvas-width` Bootstrap default, **400px** — not overridden by default (replaces the old fixed 320px) |
| animation      | Bootstrap native offcanvas slide-in transition                                  |
| light mode bg  | `--bs-body-bg`                                                                   |
| dark mode bg   | `--bs-body-bg` (native color-mode)                                              |
| overlay        | `.offcanvas-backdrop` (native)                                                  |

- Opened by explicit action only (`data-bs-toggle="offcanvas"`). Never automatically.
- Close: native — `data-bs-dismiss="offcanvas"`, backdrop click, or Escape (all handled by Bootstrap's JS).
- Drawer header: `.offcanvas-header` (title + `.btn-close`).
- Drawer content: `.offcanvas-body`, vertically scrollable on overflow (native).

---

## 7. STATUSBAR

No direct Bootstrap component — this remains a **legitimate residual custom element**, styled with Bootstrap utility classes.

| Token              | Default                       |
| -------------------- | -------------------------------- |
| height              | `$statusbar-height` = 28px (residual Sass variable, `design-system.md §5`) |
| light mode bg       | `.bg-body-tertiary` or `$statusbar-bg` residual variable |
| dark mode bg        | native color-mode equivalent    |
| top border          | `.border-top`                    |
| horizontal padding  | `.px-3`                          |
| font                | `.small`                         |
| text color          | `.text-body-secondary`           |

### Statusbar zones (left → right)

```
[ Status message ]  ···  [ Progress ]  [ Contextual info ]
```

| Zone   | Content                                                                   |
| -------- | ------------------------------------------------------------------------------ |
| Left   | Current status message ("Prêt", "Chargement…", "requête en cours")           |
| Center | `.progress` Bootstrap native — visible only when an operation is running     |
| Right  | Fixed contextual info (API target, version, connection status…)              |

---

## 8. RECURRING COMPONENTS

### Data table (`.table`)

- `<table class="table table-hover">`. Header: default `<thead>` styling.
- Column sorting: clicking a sortable column header sorts by that column; a second click reverses the order (ascending, then descending). The active column shows a Bootstrap Icons `bi-chevron-up` (ascending) or `bi-chevron-down` (descending) indicator; other columns show none. One sort column at a time.
- Selected row: `.table-active`.
- Row alternation: **available again** via `.table-striped` — a Phase 3 choice per project (no longer disabled by default as in v1.0).
- Pagination below the table recommended beyond ~50 rows.

### Input form

- `.form-label` above each field, `.form-control` / `.form-select` for inputs.
- Spacing between fields: `.mb-3`.
- Field in error: `.is-invalid` on the control + `.invalid-feedback` below it (replaces the old `.has-error` custom class).
- Form actions: `.d-flex.justify-content-end.gap-2` — Cancel (`.btn-secondary`) + Confirm (`.btn-primary`).
- Submission: standard HTML form POST to a route, or a `fetch` call intercepting `submit` with `preventDefault` for an in-page update — pick per form in Phase 3/4, documented in the architecture contract.

### Charts / Visualization

- Background: transparent (inherits the main content).
- Palette: Bootstrap CSS variables — `--bs-primary`, `--bs-success`, `--bs-warning`, `--bs-danger`, `--bs-info` (replaces the old `--chart-*` tokens).
- Legend: `.text-body-secondary`, `.small`.
- Chart library: to validate in Phase 1 (none by default).

### Modal — Bootstrap native

```html
<div class="modal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{title}}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">{{content}}</div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-primary">Confirm</button>
      </div>
    </div>
  </div>
</div>
```

- Fully replaces the old `<dialog>` / `.modal-overlay` custom pattern. Opened via `data-bs-toggle="modal"` or the JS `bootstrap.Modal` API.
- Close: `.btn-close`, Cancel, Escape, or backdrop click — all native.
- Width: `.modal-dialog` default, or `.modal-lg`/`.modal-sm` per Phase 3 choice.
- Zero blocking `alert()` / `confirm()` — always this native modal.

### Pagination — Bootstrap native

```html
<nav>
  <ul class="pagination">
    <li class="page-item"><a class="page-link">&laquo;</a></li>
    <li class="page-item active"><a class="page-link">2</a></li>
    <li class="page-item"><a class="page-link">&raquo;</a></li>
  </ul>
</nav>
```

Shown below a table when it grows long — beyond ~50 rows by default. `.page-item.active` marks the current page; `.disabled` on the prev/next arrows at the boundaries.

---

## 9. GLOBAL KEYBOARD NAVIGATION

Default shortcuts — customizable in Phase 3.

| Shortcut            | Action                                 |
| ---------------------- | ------------------------------------------ |
| `Tab` / `Shift+Tab`  | Navigate between interactive elements    |
| `Enter` / `Space`    | Activate focused button / item            |
| `Escape`             | Close active offcanvas / modal / dropdown — handled natively by Bootstrap |
| `Alt+1…9`            | Direct navigation to tab N                |

Implementation: `keydown` listeners in a small client-side script, scoped to the shell, for the app-specific shortcuts (`Alt+1…9`) — Escape/focus-trap for modal/offcanvas/dropdown is Bootstrap's own JS.

---

## 10. PERSISTED PREFERENCES

Single-user local app — preferences live in a small JSON file on the server (`data/preferences.json`, read/written by `src/services/preferences.ts`) or in `localStorage` for purely presentational state (theme, drawer open/closed) that need not survive a machine change. Pick one mechanism per preference in Phase 3/4, documented in the architecture contract.

| Preference          | Default value | Mechanism        |
| ---------------------- | ---------------- | ------------------- |
| theme (`data-bs-theme`) | OS system      | `localStorage`      |
| drawer state          | closed          | `localStorage`      |
| language (if i18n)    | fr              | `localStorage`      |
| toast position        | top-right       | build-time config   |

---

## 11. DESIGN SYSTEM CROSS-REFERENCE

This file does not redefine variables — it consumes Bootstrap's own. Every visual value is traced to `design-system.md v3.0 (Local Web App)`.

| Need                       | Bootstrap variable / class                              |
| ----------------------------- | ------------------------------------------------------------ |
| Main background             | `--bs-body-bg`                                               |
| Secondary areas background  | `.bg-body-tertiary` / `--bs-tertiary-bg`                     |
| Drawer background            | `--bs-body-bg` (offcanvas native)                            |
| Primary text                 | `--bs-body-color`                                             |
| Secondary text               | `--bs-secondary-color` / `.text-body-secondary`               |
| Borders                      | `--bs-border-color`                                           |
| Active / selection color     | `--bs-primary`                                                 |
| Focus                        | native Bootstrap focus styling / `.focus-ring` (`design-system.md §8`) |
| Transitions                   | `$transition-base` / `$transition-fade` / `$transition-collapse` |
| Shape                         | `$border-radius` (Bootstrap default)                          |
| Shadows                       | `.shadow-sm` / `.shadow` / `.shadow-lg` + native component shadows |
| Overlay opacity               | Bootstrap native backdrop opacity (`.modal-backdrop`, `.offcanvas-backdrop`) |
| Stacking order                | Bootstrap native `$zindex-*` scale (`design-system.md §15`)   |

---

## 12. COMPOSITION PATTERNS

Catalog of alternative composition patterns for the Phase 3 co-design flow. The default composition (§1-§10) is pattern **P1**. Each pattern below is a starting point the user may amend or replace; dimensions are defaults. The retained composition is recorded in `docs/specs/03-surfaces.md` and locked in `docs/specs/04-architect.md`. The feedback spec (§5 toasts, §8 modals) applies to every pattern.

### P1 — Topbar + tabs (default)

Horizontal navigation embedded in the topbar — the composition proposed by default in Phase 3.

**Structure**: see §1 (shell, drawer, toast overlay) and §3 (`.navbar` zones, tabs, theme selector). Not repeated here.

| Element         | Default                                                       |
| ------------------ | ------------------------------------------------------------------ |
| topbar             | `.navbar.navbar-expand-lg` — §3                                    |
| navigation tabs   | `.navbar-nav` centered/left, 5 visible at most (`.dropdown` beyond) — §3 |
| statusbar         | `$statusbar-height` = 28px — §7                                    |

**When to recommend**: 2-5 top-level views of comparable weight, flat hierarchy, no sub-navigation.

**Implementation notes**: anchors `#app-shell`, `#topbar`, `#main-content`, `#statusbar` (§1). Either server-rendered pages per route, or a single page with client-side view switching — decided in Phase 3.

**Interactions**: toasts (§5), drawer (§6), statusbar (§7), and modals (§8) unchanged.

### P2 — Vertical sidebar

Left navigation column — for many sections, or sections carrying sub-items. Implemented as a Bootstrap vertical nav (`.nav.flex-column` or `.list-group`/`.nav-pills.flex-column`).

**Structure**

```
┌──────────┬──────────────────────────────────────────┐
│ SIDEBAR  │        TOPBAR (reduced, optional)        │
│ (240px)  ├──────────────────────────────────────────┤
│          │                                          │
│ [ico] …  │            MAIN CONTENT                  │
│ [ico] …  │            (scrollable area)             │
│ [ico] …  │                                          │
├──────────┴──────────────────────────────────────────┤
│                 STATUSBAR (28px)                    │
└─────────────────────────────────────────────────────┘
```

Proposed HTML skeleton (server-rendered layout template):

```html
<div id="app-shell">                                       <!-- grid columns: 240px 1fr -->
  <nav id="sidebar" class="nav flex-column">                <!-- or .list-group -->
  <header id="topbar" class="navbar border-bottom">          <!-- reduced (title + global actions) — optional -->
  <main id="main-content">
  <footer id="statusbar" class="border-top">
  <div id="toast-container" class="toast-container position-fixed">
  <div id="drawer" class="offcanvas offcanvas-end">          <!-- optional -->
</div>
```

| Element               | Default                                                                |
| ------------------------ | ---------------------------------------------------------------------------- |
| width (expanded)       | 240px (residual Sass variable — no Bootstrap default for a fixed sidebar)  |
| width (collapsed)      | icons only — Bootstrap Icons `fs-4` + `.p-3` padding on each side          |
| bg                      | `.bg-body-tertiary`                                                        |
| right border            | `.border-end`                                                              |
| item                    | `.nav-link` (icon + label) or `.list-group-item.list-group-item-action`   |
| item label              | word-wraps within the 240px width, never truncated or ellipsized           |
| active item             | native `.nav-link.active` / `.list-group-item.active`                      |
| collapse toggle         | optional — state persisted like the drawer (§10)                           |
| topbar (if kept)        | reduced `.navbar` — app name + global actions (theme)                     |

**When to recommend**: more than 5 top-level views; grouped sections or sub-items; long labels that would crowd a topbar; a navigation the user wants always visible.

**Implementation notes**: anchor `#sidebar`, items are `.nav-link`/`.list-group-item` for real route navigation. `#app-shell` becomes a 2-column grid. The collapsed state is a persisted preference (§10), like the drawer.

**Interactions**: toasts (§5) keep their 6 positions and their margins; the drawer (§6) still overlays the content; the statusbar (§7) spans the full width.

### P3 — Master-detail

List panel + detail panel — for one dominant entity browsed and inspected item by item. Implemented with Bootstrap's grid (`.row`/`.col-*`) and `.list-group` for the master list.

**Structure**

```
┌─────────────────────────────────────────────────────┐
│                     TOPBAR                          │
├────────────────────┬────────────────────────────────┤
│  MASTER LIST       │  DETAIL PANE                   │
│  (320px)           │  (flexible)                    │
│  [ item ]          │  [ title + item actions ]      │
│  [ item selected ] │  [ fields / sections ]         │
│  [ item ]          │                                │
├────────────────────┴────────────────────────────────┤
│                   STATUSBAR                         │
└─────────────────────────────────────────────────────┘
```

| Element             | Default                                                    |
| ---------------------- | ---------------------------------------------------------------- |
| master list width    | `.col-4`/`.col-3` (Bootstrap grid) or a fixed 320px residual variable |
| list bg               | `.bg-body-tertiary`                                              |
| separator             | `.border-end` (between list and detail), `.list-group` item borders (native) |
| selected item         | native `.list-group-item.active` (replaces the old `--primary-bg` custom token) |
| detail padding        | `.p-4`                                                            |
| empty state           | centered message, `.text-body-secondary`                         |
| list header actions   | add / refresh — top of the list panel, `.btn-group` or discrete `.btn`s |

**When to recommend**: a dominant entity listed and inspected/edited one at a time (records, jobs, files); the user needs the list and the detail visible together; it replaces the table → modal round trip.

**Implementation notes**: anchors `#master-list` and `#detail-pane`, two zones inside `#main-content` (Bootstrap grid `.row`/`.col-*`). Selection is either a route param (`/items/:id`, server-rendered detail) or client-side state with a `fetch` to load the detail — decided in Phase 3/4. An explicit empty state renders when nothing is selected. Item actions live in the detail header, list-level actions in the list header.

**Interactions**: composes inside the content area of P1 or P2. Toasts (§5) and modals (§8) unchanged — a destructive confirmation stays the native Bootstrap modal (§8). The right drawer (§6) is usually redundant with the detail pane: pick one.
