# Local Web App Generator

> Claude Code generator for **local web apps** - Node.js · Express · TypeScript.

Part of a family of Claude Code generators. See also [electron-app-generator](https://github.com/TiercelinQ/electron-app-generator), [dotnet-wpf-app-generator](https://github.com/TiercelinQ/dotnet-wpf-app-generator), [flutter-app-generator](https://github.com/TiercelinQ/flutter-app-generator), [python-app-generator](https://github.com/TiercelinQ/python-app-generator), and [vscode-ext-generator](https://github.com/TiercelinQ/vscode-ext-generator).

Full generation pipeline **plus** post-delivery maintenance skills, an explicit role per skill, persisted specs, centralized executable verification, and native memory.

---

## What it does

A structured prompt system that generates complete, production-ready local web applications (Node.js/Express, UI + API, calling out to external systems) through a 5-phase cycle, then maintains them:

1. **Scoping** - up to 8 questions (objective, local port, preferences, i18n, tests, external API targets) + accent choice (named preset, custom hex, or the Bootstrap default; WCAG AA check)
2. **Featuring** - structured feature sheet, explicit out-of-scope, locked sizing
3. **Surfaces** - navigation, content organization, forms, toast position (6 positions)
4. **Architect** - full file tree, API endpoint table, Bootstrap variables/classes → usage table - locked before any code is written
5. **Development** - auto-chained batch delivery

Each phase writes a spec in the user's language to `docs/specs/` (`01-scoping` … `04-architect`); the contract is the source of truth.

**Maintenance commands**: `/local-webapp-add-feature` (add a feature, contract-compliant — explicit contract-diff validation before writing), `/local-webapp-trace-feature` (trace behavior), `/local-webapp-fix-issue` (root-cause debugging with a decision tree), `/local-webapp-refactor-code` (validated, behavior-preserving), `/local-webapp-migrate-design` (convert a legacy custom-CSS app to Bootstrap 5.3), `/local-webapp-release` (cut a SemVer release from the accumulated changelog), `/local-webapp-run-tests` (executable verification). Plus `/local-webapp-load-project` and `/local-webapp-generate-readme` to load/document existing apps.

Every generated app enforces the same visual design system, strict route/service/view architecture, and locked web security.

---

## Generated app stack

| Element        | Value                                                       |
| -------------- | ----------------------------------------------------------- |
| Target          | Local web app (localhost only)                             |
| Runtime         | Node.js 22 LTS                                              |
| Language        | TypeScript strict                                           |
| Web framework   | Express                                                      |
| Dev/build       | tsx (dev) · tsc (build)                                      |
| Architecture    | Routes = Controllers · Services = external API calls · Views = templates |
| Styling         | Bootstrap 5.3 (npm, compiled locally via Sass) - `_custom.scss` + `app.scss` |
| Icons           | Bootstrap Icons (local npm)                                    |
| i18n            | i18next FR/EN (opt-in)                                       |
| Outbound APIs   | Native `fetch` / `httpx`-equivalent client, timeouts + retries |
| Logging         | pino (file transport, mandatory)                             |
| Tests           | Vitest (opt-in)                                               |
| Distribution    | None - internal, local-only usage                            |
| Security        | Input validation on every route, secrets via `.env`, no client-side secret exposure |
| Quality         | ESLint + Prettier · JSDoc/TSDoc · ApiResult<T> error contract |

---

## Requirements

```bash
claude --version    # Claude Code CLI - installed and authenticated
node --version      # Node.js 22 LTS+
```

---

## Getting started

```bash
git clone https://github.com/TiercelinQ/local-webapp-generator.git
cd local-webapp-generator
claude
```

Then in Claude Code:

```
/local-webapp-app
```

---

## Commands

| Command                          | Action                                             |
| --------------------------------- | --------------------------------------------------- |
| `/local-webapp-app`              | Start menu (4 entry points incl. maintenance)      |
| `/local-webapp-p1-scoping`       | Scoping - up to 8 questions + accent choice        |
| `/local-webapp-p2-featuring`     | Featuring - requirements sheet + locked sizing     |
| `/local-webapp-p3-surfaces`      | Surfaces - layout proposal + customization         |
| `/local-webapp-p4-architect`     | Architect - locked architecture contract (endpoints) |
| `/local-webapp-p5-development`   | Auto-chained batch delivery                        |
| `/local-webapp-add-feature`      | Add a feature to a shipped project (contract diff first) |
| `/local-webapp-trace-feature`    | Trace a feature across route/service/view layers   |
| `/local-webapp-fix-issue`        | Fix a bug - decision tree, root cause              |
| `/local-webapp-refactor-code`    | Refactor under explicit validation only            |
| `/local-webapp-migrate-design`   | Convert a legacy custom-CSS app to Bootstrap 5.3   |
| `/local-webapp-release`          | Cut a SemVer release from the accumulated changelog |
| `/local-webapp-run-tests`        | Executable verification (typecheck, lint, build)   |
| `/local-webapp-load-project`     | Load an existing project from its specs/README     |
| `/local-webapp-generate-readme`  | Generate README.md for an existing project         |
| `/local-webapp-save-session`     | Save current session state                         |
| `/local-webapp-show-state`       | Current project status                             |
| `/local-webapp-show-contract`    | Display locked architecture contract               |
| `/local-webapp-save-memory`      | Persist a note in Claude Code native memory        |

---

## Generated app structure

```
my-app/
├── package.json · tsconfig*.json · eslint.config.mjs
├── README.md
├── CLAUDE.md                      # Project identity (origin, business context, deviations)
├── .claude/settings.json          # Guardrails + verification hook (self-enforced app)
├── docs/specs/                    # Generation specs (user's language): 01-scoping … 04-architect
├── docs/release/CHANGELOG.md      # SemVer changelog (Keep a Changelog)
├── docs/sessions/SESSION_<App>_S0.md  # Delivery baseline session (auto, end of Phase 5)
├── .env.example                   # Documented environment variables
└── src/
    ├── shared/                    # config.ts · types.ts · api-clients.ts
    ├── routes/                    # Express routers (controllers)
    ├── services/                  # Outbound calls to external API systems
    ├── views/                     # Templates / static pages
    └── index.ts                   # Entry point
```

---

## Versioning & changelog

Every generated app carries a SemVer version and a changelog at `docs/release/CHANGELOG.md` (Keep a Changelog format, written in English). Maintenance skills (`add-feature`, `fix-issue`, `refactor-code`, `migrate-design`) accumulate entries under `## [Unreleased]`; `/local-webapp-release` freezes them into a dated version block and bumps the version source (`package.json` version + the `src/shared/config.ts` `APP_VERSION` mirror). The version is never bumped silently. See `rules/versioning.md`.

---

## Design system

All generated apps share the same visual system, defined in `.claude/design-system.md` (v3.0):

- **Bootstrap 5.3** - npm dependency, compiled locally via Sass (`_custom.scss` + `app.scss` → `public/css/app.css`), zero CDN
- **Bootstrap's own visual language** - native shadows, default radius scale, native component states; no custom token derivation
- **Accent** - a single optional `$primary` override (named preset, custom hex, or the Bootstrap default); every other color, including semantics, stays Bootstrap's own standard theme
- **Bootstrap Icons** (local npm font) - no signature gesture; tab selection is the native `.nav-link.active` state
- **Dark mode** - Bootstrap 5.3's native `data-bs-theme` color-mode mechanism
- **Toasts only** - no inline banners, no blocking `alert`/`confirm` for business errors (native Bootstrap `.toast`/`.modal`)

---

## Security

`.claude/rules/security.md` is non-negotiable, applied to 100% of generated apps: every route input validated server-side, secrets read only from `.env` (never hardcoded, never sent to the client), CORS restricted to localhost, no external resource loaded without explicit review. `/local-webapp-fix-issue` and `/local-webapp-add-feature` always route through it.

---

## Documentation

- [GUIDE.md](GUIDE.md) - full usage guide (FR)
- `.claude/design-system.md` - visual token reference
- `.claude/layout.md` - layout companion (pattern catalog + proposed default composition + toast spec)
- `.claude/rules/` - domain rules:
  - `mvc.md` · `css.md` · `errors.md` · `security.md` · `config.md` · `env-config.md` · `api-calls.md` · `tests.md` (opt-in) · `logging.md` · `readme.md` · `versioning.md`
  - `verification.md` - single source of truth for executable + static checks

---

## Generator family

| Generator | Stack | Target |
| --------- | ----- | ------ |
| [python-app-generator](https://github.com/TiercelinQ/python-app-generator) | Python · PySide6 · QSS | Windows desktop |
| [electron-app-generator](https://github.com/TiercelinQ/electron-app-generator) | Node.js · Electron · React · TS | Windows desktop |
| [local-webapp-generator](https://github.com/TiercelinQ/local-webapp-generator) | Node.js · Express · TS | Local web app |
| [dotnet-wpf-app-generator](https://github.com/TiercelinQ/dotnet-wpf-app-generator) | .NET 10 · C# · WPF · MVVM | Windows desktop |
| [flutter-app-generator](https://github.com/TiercelinQ/flutter-app-generator) | Flutter · Dart · Riverpod | Android |
| [vscode-ext-generator](https://github.com/TiercelinQ/vscode-ext-generator) | TypeScript · esbuild · native theming | VS Code extension |

---

## License

MIT
