# MVC rules — Node/Express

## MVC → Express layer mapping

| Layer      | Location            | Content                                       |
| ---------- | -------------------- | ---------------------------------------------- |
| Model      | `src/services/`      | Business logic, data access, outbound API calls |
| Controller | `src/routes/`        | Express routers — request handling, validation |
| View       | `src/views/`         | Server-rendered templates or static pages       |

## Responsibilities

### Services (Models) — `src/services/`
- Pure Node.js + TypeScript. Classes or modules per entity.
- Raise named business errors (`shared/errors.ts`).
- Every outbound call to an external API goes through here — never a direct `fetch` from a route or a view. See `@rules/api-calls.md`.
- **Forbidden**: any Express-specific object (`Request`, `Response`, `Router`). A service takes plain typed arguments and returns plain typed data.
- **Forbidden**: any import from `routes/` or `views/`.

### Routes (Controllers) — `src/routes/`
- One Express router per entity: `[entity].routes.ts`.
- Register the route handlers (`router.get`, `router.post`, …), mounted in `src/index.ts`.
- Validate every route input (params, query, body) before calling the Service — see `@rules/security.md`.
- Intercept business errors and return a structured result (see `@rules/errors.md`). **Never let a raw exception reach the client as an unhandled 500.**
- **Forbidden**: business logic, direct data access, HTML construction beyond passing data to a view template.

### Views — `src/views/`
- Server-rendered templates (or static pages under `public/`) + the small client-side scripts that hydrate them.
- No business logic. No direct data access — only what the route handler passed in, or a `fetch` call to a JSON route for in-page updates.
- Show errors via the toast helper (never business error handling).
- `views/partials/`: structural fragments (topbar, statusbar, drawer, modal, toast-manager).

## Unidirectional imports

```
views (templates/client scripts) ──fetch/form──▶ routes ──▶ services
                                                      │
shared/ (types, config, logger, errors) ◀─────────────┴── importable by all layers
```

- `shared/` contains only types, constants, the logger, and error classes — zero route/service-specific logic, zero circular dependency.
- One entity = one service + one route file + one (or more) view template. Shared constants in `src/shared/config.ts`.

## Generated reference tree

```
my-app/
├── package.json
├── tsconfig.json
├── eslint.config.mjs · .prettierrc
├── .gitignore                      # repo hygiene (delivered last batch) — @rules/config.md
├── .env.example                    # documented env vars — @rules/env-config.md
├── README.md
├── docs/
│   └── specs/                      # generation specs (user's language): 01-scoping … 04-architect
├── public/
│   ├── favicon.ico
│   ├── css/app.css                 # compiled from src/views/styles/app.scss — @rules/css.md
│   └── js/                         # client-side scripts (theme toggle, toast/modal wiring, forms)
└── src/
    ├── shared/
    │   ├── config.ts                # application constants + env accessors
    │   ├── types.ts                 # DTOs + ApiResult<T>
    │   ├── errors.ts                 # named business errors
    │   ├── logger.ts                 # pino setup — @rules/logging.md
    │   └── error-middleware.ts       # Express error-handling middleware — @rules/errors.md
    ├── services/
    │   ├── preferences.ts            # if persisted preferences (server-side) — layout.md §10
    │   └── [entity].service.ts
    ├── routes/
    │   ├── index.ts                  # registerAllRoutes(app)
    │   └── [entity].routes.ts
    ├── views/
    │   ├── layout.html               # base shell template (topbar, content, statusbar)
    │   ├── partials/                 # topbar, statusbar, drawer, modal, toast-manager
    │   ├── [entity].html             # per-entity page templates
    │   └── styles/
    │       ├── _custom.scss          # $primary override + Bootstrap variable overrides — @rules/css.md
    │       └── app.scss              # Bootstrap import + residual custom rules — @rules/css.md
    └── index.ts                      # entry point: loads env, mounts routes, starts the server
```

Bootstrap Icons do not appear in this tree — served directly from `node_modules/bootstrap-icons/font/` via a dedicated Express static route (`@rules/config.md`, `@rules/css.md`).

## Batch delivery

**Small project (3 batches):**

| Batch | Content                                                                                   |
| ----- | ------------------------------------------------------------------------------------------ |
| 1     | `src/shared/` + `src/services/`                                                            |
| 2     | `src/routes/` + `src/views/` (templates + partials)                                        |
| 3     | `src/index.ts` + `public/` + `src/views/styles/` + `i18n/` (if enabled) + root configs (incl. `.gitignore`, `.env.example`) + `package.json` + README + instructions |

**Medium / Large project (4 batches):**

| Batch | Content                                                                                   |
| ----- | ------------------------------------------------------------------------------------------ |
| 1     | `src/shared/` + `src/services/`                                                            |
| 2     | `src/views/` (templates + partials)                                                        |
| 3     | `src/routes/`                                                                               |
| 4     | `src/index.ts` + `public/` + `src/views/styles/` + `i18n/` (if enabled) + root configs (incl. `.gitignore`, `.env.example`) + `package.json` + README + instructions |

### Tests batch (only if Phase 1 tests = Yes)
Add a final dedicated batch — `test/` (mirroring `src/`) + `vitest.config.ts` + dev dependencies (`vitest`, `supertest`) + the `"test"` script. → Small 4 batches / Medium-Large 5 batches. Patterns and coverage: `@rules/tests.md`.

### Delivery format
- Announcement: `Batch N/[total] — [content]`
- Files written directly to disk, complete and self-contained blocks.
- Automatic chaining between batches without confirmation.
- Last batch: install instructions (`npm install`, `npm run dev`, `npm run typecheck`, `npm run build`, `npm start`) + `README.md` at the root.

## Anti-patterns — what NOT to do (MVC / routing)

- **Do not** call an external API directly from a route handler or a view — always through `src/services/`. See `@rules/api-calls.md`.
- **Do not** put business logic in a route or a view. Routes validate + dispatch; views render. Logic lives in services.
- **Do not** access the database or the filesystem from a route handler — only from a service.
- **Do not** let a raw exception reach the client as an unhandled 500 — return a structured `ApiResult<T>` (`@rules/errors.md`) or a rendered error state.
- **Do not** spread one entity across more files than `service + route + view`. If it grows, that is a contract change → declare the deviation (Phase 4 protocol).
- **Do not** put a shared constant in only one layer — promote it to `src/shared/config.ts`.

## Post-delivery adjustments

Requested by the user after execution. Isolated fix on the affected file + its direct dependencies. Deliver the complete fixed file.

## Anomaly resolution — cleanup protocol

When an anomaly requires several attempts before being resolved, as soon as the definitive solution is identified and delivered, produce a mandatory cleanup report:

```
Anomaly resolved. Elements to remove from the previous attempts:

File [name]:
- [line / block / import / route / className / CSS rule to delete]
- ...
```

- List only the elements added during the failed attempts that are no longer needed.
- Cover all affected files: TS, CSS, shared, configs.
- Deliver the complete cleaned files if the user confirms.
- Then offer: "Do you want to remember this point? `/local-webapp-save-memory`"

## Deletions

Total deletion across all files: code, imports, routes (declaration + handler + client-side calls), types, classNames, CSS rules, i18n keys. Forbidden: commented-out code, empty implementations, residue. Deliver the complete modified files.

## Integrity verification

Detailed in `@rules/verification.md`. Key points: MVC responsibilities respected (zero business logic in view/route, zero HTTP object in service); unidirectional imports (`views → routes → services`, `shared/` importable by all); routes consistent end-to-end (declaration in `routes/index.ts` ↔ handler ↔ view/client calls); architectural contract (`docs/specs/04-architect.md`) respected. Run silently every batch; cross-file checks on the last batch.
