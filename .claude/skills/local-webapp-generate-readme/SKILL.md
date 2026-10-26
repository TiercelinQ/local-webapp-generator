---
name: local-webapp-generate-readme
description: Analyze the specs and source of an existing local web app project and generate its README.md (objective, features, stack, tree, API endpoints, conventions, installation). Invoke from the target project root.
model: sonnet
---

# /local-webapp-generate-readme — Generate the README.md

## Role
Technical writer — produce an accurate project README from specs + code.

## Goal
Write a README that reflects what was actually built.

## Deliverable
`README.md` at the project root.

---

Prerequisite: invoked from the target project root.

Use the native Claude Code tools (no shell — Windows-compatible):

1. **Sources, in priority**: `docs/specs/*` (especially `04-architect.md`) for the intended structure, then the real code:
   - List source files via `Glob` `src/**/*` (exclude `node_modules/`, `dist/`).
   - Read `package.json`, `src/shared/` (config, types, logger), `src/routes/`, `src/services/`, `src/views/`.
   - Detect `test/` via `Glob` `test/**/*.test.*`.
   - When specs and code disagree, the code is what shipped — describe the code and note the divergence.
2. Generate `README.md` at the root via `Write`. Write the README in English (public-facing document) — see `@rules/readme.md`:

```markdown
# [APP_NAME] — v[VERSION]

## Objective
[Inferred from docs/specs, config.ts and the structure — 2 sentences max]

## Features
- [Inferred from the present views/ and routes/]

## Technical stack
- Runtime: Node.js 22 LTS+ · Express · TypeScript strict · UI: Bootstrap 5.3 · Icons: Bootstrap Icons
- i18n: [Yes/No — inferred from src/shared/i18n or equivalent]
- Tests: [Yes (Vitest) | No — inferred from the presence of test/]

## Architecture
[Actual file tree with the role of each file]

## API endpoints
[table endpoint (method + path) → route → service → view usage]

## Conventions
[Routes/Services/Views separation, CSS tokens, toasts, security — pointer to the rules]

## Installation
npm install
npm run dev          # development (tsx watch)
npm run typecheck    # TypeScript verification
npm run build        # build (tsc)
npm start             # run the built app on localhost

## Tests
[Section included only if test/ detected]
npm test

## Accent
[Named accent or custom $primary hex inferred from src/views/styles/_custom.scss, otherwise the Bootstrap default theme (design-system v3.0)]
```

3. Write the file via `Write` (never `cat`/heredoc — Windows-incompatible).
4. If anything is undeterminable from specs + code: ask the closed questions with `AskUserQuestion` (clickable options) before writing.

Confirm with: `README.md generated at the project root.`
