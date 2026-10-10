---
name: local-webapp-p3-surfaces
description: Phase 3 of the local web app generation cycle — guided UI co-design based on the layout.md pattern catalog (navigation, content organization, forms), tailored proposal, grouped detail questions, validated synthesis written to the layout spec before Phase 4.
model: sonnet
---

# /local-webapp-p3-surfaces — Layout co-design

## Role
UI designer — map the validated features onto a layout co-defined with the user.

## Goal
Define the concrete layout (navigation, content organization, forms and actions, drawer/modal, toast position, recurring components), co-designed from the `layout.md` pattern catalog (§12), freely amendable by the user.

## Deliverable
`docs/specs/03-surfaces.md` (written in the user's language) + on-screen synthesis.

---

## 1. Analysis

**Phase banner (show first)** — before anything else, output the phase banner as plain Markdown in the user's language, **never inside a code block or fenced block**. Three blocks, each on its own line: (1) H2 heading: Phase 3/5 — Surfaces; (2) progress line: Scoping ✓ · Features ✓ · ▶ Surfaces · Architecture · Development; (3) intent in italics: Map the validated features onto the layout. See `## PIPELINE` in `CLAUDE.md`.

**Read `design-system.md` and `layout.md` first** (no longer auto-imported) — `layout.md` includes the **§12 composition pattern catalog** (P1 topbar + tabs — the default, P2 vertical sidebar, P3 master-detail).

Then read the features validated in Phase 2 (`docs/specs/02-featuring.md`) and derive the signals that drive the co-design: number of top-level views, flat or grouped hierarchy, dominant entities, list/detail needs, form volume. These signals choose the recommended option of every question below — never ask what the features already answer.

## 2. Structuring questionnaire — questions via `AskUserQuestion`

Adaptive. **Cap: 2 `AskUserQuestion` calls before the proposal** — one call is usually enough (group the open axes into a single call of ≤ 4 questions). Ask only the axes the features leave open; derive the others silently. For each question, mark the option you recommend with `(recommended)`, chosen from the validated feature context, and **justify it in one line** against the features. Ask with `AskUserQuestion` (clickable options, ≤ 4 options each, **Other** for a composition the user defines). Ask in the user's language:

1. **Main navigation** — options drawn from the `layout.md` §12 catalog, the recommended one first:
   A. Topbar + tabs (P1) — 2-5 top-level views of comparable weight
   B. Vertical sidebar (P2) — more than 5 views, grouped sections, or long labels
   C. Master-detail (P3) — one dominant entity listed and inspected item by item
   **Other** — a composition the user describes.

2. **Content organization** — how the retained navigation is filled:
   A. One view per feature
   B. Sections grouping several features
   C. Master-detail inside the content area (list + detail, `layout.md §12` P3)

3. **Forms and actions** — where creation/editing happens:
   A. Modal over the current view (`layout.md §8`)
   B. Dedicated view / section
   C. Inline in the list
   And where the actions sit: per row · in the section header · in the detail pane.

4. **Recurring components** — only if the features leave it open (table vs cards, density, pagination beyond ~50 rows). Otherwise derive them from the features without asking.

## 3. Tailored proposal

Compose the proposal from the retained pattern + the answers, adjusted to the validated features, and state explicitly that the user may amend any part of it or define a different composition. Produce (in the user's language):

## Proposed layout — [APP_NAME]

**Structure**
[Zones of the retained pattern — e.g. topbar + tabs / sidebar + content / master + detail — plus main content and statusbar]

**Navigation**
| [Tab / Section / Item] | Content |
| --- | ------- |
| …   | …       |

**Recurring components**
- [Table / Form / Charts — depending on the features]

## 4. Detail questions — questions via `AskUserQuestion`

Conditioned on the retained pattern. Same rules as above: recommended option marked, clickable options, ≤ 4 options each, **Other** for the rest, split into ≤ 4-question calls. Ask in the user's language, showing only the questions the retained pattern and the feature context make relevant:

A few choices to confirm:

1. [Only if P1 — topbar + tabs] Tab position in the topbar:
   A. After the logo and name (left-aligned)
   B. Centered

   [Only if P2 — vertical sidebar] Sidebar behavior:
   A. Always expanded (240px)
   B. Collapsible — icons only when collapsed (state persisted, `layout.md §10`)

2. Secondary panel: drawer or modal?
   A. Drawer (persistent side panel)
   B. Modal (overlay window)
   C. None

[If A — Drawer:]
3. Drawer width:
   A. Bootstrap default — 400px (design-system.md / layout.md default, recommended)
   B. Fixed custom — specify the value
   C. Dynamic (adapts to content)

[If B — Modal:]
3. Modal size:
   A. Fixed — specify width × height
   B. Dynamic (adapts to content)

4. Modal internal layout:
   A. Header + main content + footer
   B. Header + 2 columns (main content) + footer
   C. Header + main content (no footer)
   D. Other — I'm not sure, help me choose

5. Toast position (`layout.md §5`):
   A. Top-right (default)
   B. Top-left
   C. Top-center
   D. Bottom-right
   E. Bottom-left
   F. Bottom-center

If the project clearly needs no drawer or modal, skip questions 3/4 and note the absence of a secondary panel. With P3 (master-detail) the detail pane usually replaces the drawer — confirm rather than assume. Question 5 (toasts) is always asked; the choice sets `TOAST_POSITION` (`src/shared/config.ts`) and the persisted `toast position` preference.

If the user picks D on question 4: ask 3 questions with `AskUserQuestion` to help define the layout:

To help you choose the layout:

a. What is the main purpose of this modal?
b. Are there actions to perform from this modal? Yes / No
c. Is the content homogeneous (single block) or heterogeneous (several sections)?

Based on the answers, propose 2 suited layouts with a justified recommendation, then confirm before the synthesis.

## 5. Synthesis

Produce the complete synthesis of the validated layout (in the user's language): the retained composition pattern (`layout.md §12` name — P1/P2/P3 — or "user-defined") and the amendments made to it, structure, navigation, content organization, forms and actions, secondary panel, recurring components, toast position.

**→ Explicit validation required before Phase 4.**

## 6. Write the spec

Once validated, write the synthesis to `docs/specs/03-surfaces.md` (in the user's language).

→ Chain to `/local-webapp-p4-architect` after validation.
