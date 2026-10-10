# Automated tests rules — Node/Express/TS

## Activation

Conditional — enabled if Phase 1 tests = `Yes`.

If enabled:
- Test setup mandatory in the architectural contract (Phase 4).
- Dedicated extra batch in Phase 5 (Small: 4 batches · Medium/Large: 5 batches).
- Dev dependencies added (`vitest`, `supertest`).

If disabled:
- No test files, no extra batch. Batch count unchanged (Small: 3 · Medium/Large: 4).

---

## Non-negotiable stack

- `vitest` (unit + integration; native mocking via `vi`)
- `supertest` (HTTP assertions against the Express app, without binding a real port)
- No other test framework.

`package.json` script: `"test": "vitest run"` (+ `"test:watch": "vitest"`).
`vitest.config.ts` with `environment: "node"`.

---

## What to test, per layer

| Layer                  | Target              | What to test                                                          |
| ------------------------ | -------------------- | ------------------------------------------------------------------------ |
| `src/shared/`           | Pure logic          | type guards / validators, DTO helpers                                  |
| `src/services/`         | Business logic       | public methods, named errors, edge cases (external API calls mocked)   |
| `src/routes/`           | Integration          | invalid payload rejected; success returns `{ ok: true }`; error → `{ ok: false }` with the right HTTP status — driven via `supertest` against the mounted Express app |
| `src/views/`             | Not unit-tested      | server-rendered templates have no isolated component boundary to test; covered indirectly by the route integration tests (status + body shape) |

---

## Conventions

- File naming: `[module].test.ts` under `test/` mirroring `src/` (single location — detection and delivery rely on `test/**`).
- Test names: explicit French behavior — always French, independent of the user's interface language — e.g. `rejette_un_payload_sans_email`.
- No `expect(true).toBe(true)`, no empty test, no `any` in test code without justification.
- No real network, no real filesystem DB — mock the outbound API client (`@rules/api-calls.md`) and any database access. Use `vi.mock`.
- No arbitrary `setTimeout` waits — use `await`, fake timers (`vi.useFakeTimers()`), or `supertest`'s promise-based assertions.

---

## Route integration test pattern (mandatory)

```ts
import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import * as recordService from "../src/services/record.service";

describe("POST /api/records", () => {
  it("rejette un payload sans email", async () => {
    const app = createApp();
    const res = await request(app).post("/api/records").send({ email: "" });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.type).toBe("danger");
  });

  it("retourne le record créé sur payload valide", async () => {
    vi.spyOn(recordService, "save").mockResolvedValue({ id: 1, email: "a@b.com" });
    const app = createApp();
    const res = await request(app).post("/api/records").send({ email: "a@b.com" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: { id: 1, email: "a@b.com" } });
  });
});
```

## Service unit test pattern (mandatory)

```ts
import { describe, it, expect, vi } from "vitest";
import { saveRecord } from "../src/services/record.service";
import { RecordNotFoundError } from "../src/shared/errors";

describe("record.service", () => {
  it("leve RecordNotFoundError si l'id est inconnu", async () => {
    await expect(saveRecord({ id: "missing" })).rejects.toThrow(RecordNotFoundError);
  });
});
```

`createApp()` (`src/app.ts`) builds and returns the configured Express `app` without calling `.listen()` — the entry point `src/index.ts` imports it and starts the server. This split is what lets `supertest` drive the app in-process, with no bound port.

---

## Anti-patterns — what NOT to do

- **Do not** write `expect(true).toBe(true)`, an empty test, or a `it.skip` left behind.
- **Do not** hit a real external API or a real database — mock the service layer's outbound calls.
- **Do not** use arbitrary `setTimeout` waits — fake timers or `supertest`'s async assertions.
- **Do not** test a route without mocking its underlying service.
- **Do not** attempt to unit-test a server-rendered view in isolation — cover it through the route integration test.
- **Do not** create a test suite when Phase 1 tests = No (and `/local-webapp-run-tests` never scaffolds one unasked).

## Integrity verification

Detailed in `@rules/verification.md`. Key points: each source module has a matching test (Phase 4 mapping); `npm test` (vitest) exit 0; dev dependencies present in `package.json`.
