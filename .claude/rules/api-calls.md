# Outbound API call rules — Node/Express

> Every call to an external system's API goes through `src/services/` — never a direct `fetch` from a route handler or a view (`CLAUDE.md` § ABSOLUTE RULES). This file defines the shared HTTP client, timeout, retry policy, error mapping, and logging for that layer.

## Principle

- One service module per external system: `src/services/[system].service.ts`.
- Each service wraps its calls through a shared HTTP client helper (`src/shared/http-client.ts`) — no service reimplements timeout/retry logic.
- The client uses Node 22's native `fetch` — no HTTP library dependency (`axios`, `got`…) unless validated in Phase 1.

## Shared HTTP client

Mandatory file `src/shared/http-client.ts`:

```ts
// src/shared/http-client.ts
import { logger } from "./logger";
import * as config from "./config";
import { ExternalApiError } from "./errors";

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
}

export async function httpRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs = config.API_TIMEOUT_MS,
    retries = config.API_MAX_RETRIES,
  } = options;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const start = Date.now();
    try {
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json", ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      const durationMs = Date.now() - start;
      logger.info({ method, url: stripQuery(url), status: res.status, durationMs }, "Outbound call");

      if (!res.ok) {
        if (res.status >= 500 && attempt < retries) {
          lastErr = new ExternalApiError(`HTTP ${res.status}`);
          await backoff(attempt);
          continue;
        }
        throw new ExternalApiError(`HTTP ${res.status}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      const durationMs = Date.now() - start;
      const isAbort = err instanceof Error && err.name === "AbortError";
      logger.warn({ method, url: stripQuery(url), durationMs, attempt, err }, "Outbound call failed");
      if (isAbort || isNetworkError(err)) {
        lastErr = err;
        if (attempt < retries) { await backoff(attempt); continue; }
      }
      throw err instanceof ExternalApiError ? err : new ExternalApiError((err as Error).message);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr instanceof Error ? lastErr : new ExternalApiError("Unknown outbound call failure");
}

function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError; // fetch throws TypeError on DNS/connection failures
}

function backoff(attempt: number): Promise<void> {
  const delayMs = 2 ** attempt * 200; // 200ms, 400ms, 800ms...
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function stripQuery(url: string): string {
  return url.split("?")[0];
}
```

## Service usage

```ts
// src/services/weather.service.ts
import { httpRequest } from "../shared/http-client";
import * as config from "../shared/config";

interface WeatherResponse {
  temperatureC: number;
}

export async function getCurrentTemperature(city: string): Promise<number> {
  const url = new URL(`${config.WEATHER_API_BASE_URL}/current`);
  url.searchParams.set("city", city);
  url.searchParams.set("apiKey", config.WEATHER_API_KEY);

  const data = await httpRequest<WeatherResponse>(url.toString());
  return data.temperatureC;
}
```

```ts
// src/routes/weather.routes.ts (JSON router, mounted under /api: GET /api/weather)
router.get("/weather", async (req, res): Promise<void> => {
  const city = validateCityParam(req.query.city); // @rules/security.md
  try {
    const temperatureC = await weatherService.getCurrentTemperature(city);
    res.json({ ok: true, data: { temperatureC } } satisfies ApiResult<{ temperatureC: number }>);
  } catch (err) {
    if (err instanceof ExternalApiError) {
      res.status(502).json({ ok: false, error: { type: "danger", message: "Service météo indisponible" } } satisfies ApiResult<never>);
      return;
    }
    throw err;
  }
});
```

## Rules

| Concern              | Rule                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| Location             | Every outbound call lives in `src/services/[system].service.ts` — zero direct `fetch` from a route or a view |
| Client               | Native `fetch` (Node 22), wrapped by `src/shared/http-client.ts`                              |
| Timeout              | Mandatory, `AbortController`-based, default `API_TIMEOUT_MS` (`shared/config.ts`), overridable per call |
| Retry                | Exponential backoff, capped at `API_MAX_RETRIES` attempts, **only** on network errors or `5xx` responses — never on `4xx` (a client error will not fix itself by retrying) |
| Error mapping         | Every failure (timeout, network, non-2xx) is wrapped into `ExternalApiError` and mapped to an `ApiResult` error by the calling route — see `@rules/errors.md` |
| Secrets               | Read from `src/shared/config.ts` only — never a literal token/key in a service file. See `@rules/env-config.md` |
| Request construction  | URLs and bodies built from `URL`/`URLSearchParams`/typed objects — never string concatenation. See `@rules/security.md` |
| Logging               | Method, URL without query string, status code, and duration logged via `logger.info`/`logger.warn` — never the request/response body, never headers (may carry a token). See `@rules/logging.md` |

## Anti-patterns — what NOT to do

- **Do not** call `fetch` directly from a route handler or a view — always through a `src/services/` module.
- **Do not** omit the timeout — an outbound call without `AbortController` can hang the request indefinitely.
- **Do not** retry a `4xx` response — retry only on `5xx` and network/timeout errors.
- **Do not** retry without a backoff or without a cap — an unbounded retry loop can hammer the external system.
- **Do not** concatenate a value into the request URL or body — build it from `URL`/`URLSearchParams`/typed objects.
- **Do not** hardcode an API key, token, or base URL in a service file — read it from `src/shared/config.ts`.
- **Do not** log a request/response body or a header — only method, URL (no query string), status, and duration.
- **Do not** let a raw `ExternalApiError` (or any exception) escape a route handler unmapped — always resolve to an `ApiResult`.

## Integrity verification

Detailed in `@rules/verification.md`. Key points: every outbound call in `src/services/` uses `src/shared/http-client.ts` (or an equivalent wrapper) with a timeout and the documented retry policy (5xx/network only, never 4xx); no secret hardcoded in a service file; outbound calls logged (method/URL without query/status/duration) with no sensitive body or header; every route calling an external service maps its failures to `ApiResult`.
