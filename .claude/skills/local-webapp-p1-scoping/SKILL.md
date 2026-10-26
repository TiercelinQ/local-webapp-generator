---
name: local-webapp-p1-scoping
description: Phase 1 of the local web app generation cycle — scoping in up to 7 questions plus the accent (incl. local port, external API systems to call, persistent preferences, i18n, tests), accent choice, calibration announcement (number of batches), and writing of the scoping spec.
model: sonnet
---

# /local-webapp-p1-scoping — Scoping

## Role
Project scoper — turn a vague idea into a bounded, validated scope.

## Goal
Lock the project parameters (port, external API systems, preferences, i18n, tests) before any analysis.

## Deliverable
`docs/specs/01-scoping.md` (written in the user's language) + on-screen summary.

---

## 1. Questions

**Phase banner (show first)** — on a new app, first list the 5 phases once (overview in `## PIPELINE` of `CLAUDE.md`). Then output the phase banner as plain Markdown in the user's language, **never inside a code block or fenced block**. Three blocks, each on its own line: (1) H2 heading: Phase 1/5 — Scoping; (2) progress line: ▶ Scoping · Features · Surfaces · Architecture · Development; (3) intent in italics: Destination folder, project parameters, accent.

Start with the objective, then establish the project root (folder name → location → creation), then ask the closed parameters with the `AskUserQuestion` tool (clickable options, the recommended one first). Cap = **4 questions per call** → **two calls**.

1. **Objective** — plain text, **not** `AskUserQuestion` (free-form, non-enumerable): "Application objective? (free description)".

### Project root (folder name → location → creation)

> Skip this block if a project root is already established for this flow.

- **Folder name** — propose 2-4 candidate names derived from the objective, **in kebab-case** (e.g. `expense-tracker`), the recommended one first, with `AskUserQuestion` (the **Other** option carries a custom name as free-form text). The user selects a candidate or types their own. This is the **project directory name**, distinct from the application name chosen in Phase 2.
- **Location** — free-form text: `Parent folder where to create the project? (path, e.g. C:\projects)`.
- **Create the folder** — project root = `[parent]\[folder-name]`. Create it, then confirm: `Project root: [path]`. If it already exists and is not empty, warn and ask the user to confirm reuse or pick another name. Store this path as the project root — all generated files and specs (`docs/specs/`) are written there.

### External API systems

> Free-form text, **not** `AskUserQuestion` (non-enumerable): "External API systems this app calls out to? (base URL(s) and, if known, auth method — e.g. API key in header, Bearer token, none). Leave empty if none."

Record every declared system verbatim; each becomes a dedicated wrapper under `src/services/` (`@rules/api-calls.md`) and a documented `.env` variable (`@rules/env-config.md`).

### Closed parameters

2. **`AskUserQuestion` — call 1** (4 questions, each with a recommended option):
   - **Local port**: `3000` (recommended) · `5000` · `8080` · **Other** (free-form custom port).
   - **Persistent preferences** (theme, layout state…): `Yes` (recommended) · `No`.
   - **FR/EN i18n** (FR by default): `No` (recommended, unless a real EN need) · `Yes`.
   - **Automated tests** (Vitest): `Yes` (recommended, pro use) · `No`.
3. **`AskUserQuestion` — call 2** (1 question):
   - **Expected environment variables beyond the external API credentials** (e.g. a shared secret, a feature flag): `None` (recommended) · `Yes — I'll list them`. If `Yes`, ask the list as free-form text.

## 2. Accent

After the answers, propose the **accent** with `AskUserQuestion` (single question; clickable options from the catalog, recommended default first; the **Other** option covers a custom hex and "Bootstrap default — no override"). Bootstrap 5.3's standard theme drives every other color; the only per-project override is `$primary` (`design-system.md §2`).

- **Accent — `AskUserQuestion`**, options (≤ 4): `Steel Blue` (default, recommended) · `Teal` · `Forest` · `Slate`. The **Other** option covers `Amber`, `Ruby`, a **custom hex**, and **Bootstrap default** (no override — ships the stock Bootstrap blue `#0d6efd`). Catalog + hex values: `design-system.md §2`.
- Steel Blue is the recommended default; the named accents are canonical hex values — do not improvise them. If no answer: Steel Blue.
- Claude writes a single `$primary: #hex;` line to `_custom.scss` (or omits it for the Bootstrap default) — no derivation, Bootstrap's own Sass computes every dependent shade (hover/active states, `--bs-primary-rgb`, etc.) at compile time.
- **Contrast check (WCAG AA, non-blocking)**: compute `$primary` against white and against near-black (the two candidate `--bs-*` text-on-primary outcomes); if the ratio fails AA, report it (`color — ratio — target`) and ask the user to confirm or adjust before continuing. Bootstrap's own semantic colors (success/warning/danger/info) are pre-validated AA by the framework and are not re-checked here.
- The global `design-system.md` stays unchanged.

## 3. Provisional calibration — announced at the end of Phase 1

Apply the CALIBRATION table in `CLAUDE.md` (canonical source) — it holds the size thresholds, the batch counts, and the +1 batch when tests are enabled; do not restate them here.

Announce it as **provisional** (template, rendered in the user's language):

Provisional calibration: [Small | Medium/Large] — [N] batches (incl. 1 test batch if enabled)
(Confirmed at the end of Phase 2, after counting the real features.)

The real feature count is not known yet (features are elicited in Phase 2). The calibration is **confirmed and locked at the end of Phase 2**, on the v1.0 feature count.

## 4. Libraries

Any library outside the stack (charts, zod…) is proposed and validated here — none can be added later without a declaration protocol.

## 5. Write the spec

Write `docs/specs/01-scoping.md` (in the user's language) capturing: objective, local port, external API systems (base URLs + auth method if known), persistent preferences, i18n, tests, expected environment variables, the **accent** (preset name or custom hex, or "Bootstrap default") and the contrast-check result, validated libraries, and the provisional calibration (size + number of batches — confirmed in Phase 2). If `docs/specs/` does not exist yet, create it (it will live in the generated project root).

→ Chain to `/local-webapp-p2-featuring` after validation.
