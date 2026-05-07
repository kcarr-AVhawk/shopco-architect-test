---
description: API conventions — loaded only when editing route handlers.
paths:
  - "src/routes/**/*.js"
  - "src/routes/**/*.ts"
---

# API Conventions

## Response envelope (success)

Every 2xx response MUST use this shape:
{
"data": <the actual payload>,
"meta": {
"requestId": <string, propagated from req.id>,
"timestamp": <ISO 8601 string>
}
}
- Do NOT return raw payloads at the top level. Always wrap in `{ data, meta }`.
- `meta.requestId` MUST come from `req.id` (set by middleware). Fallback to `crypto.randomUUID()` only if middleware is absent — never the literal string `'unknown'`.
- `meta.timestamp` is ISO 8601: `new Date().toISOString()`.

## Response envelope (error)

Every non-2xx response MUST use this shape:
{
"error": {
"code": <UPPER_SNAKE_CASE string>,
"message": <safe-for-client string>,
"retryable": <boolean>
}
}
- `code` is a stable identifier — `INTERNAL_ERROR`, `INVALID_INPUT`, `RESOURCE_NOT_FOUND`, etc.
- `message` is safe for client display. NEVER include `err.message`, `err.stack`, or DB error text directly.
- `retryable: true` for 503 / transient. `retryable: false` for 4xx and irrecoverable 5xx.

## HTTP status codes

Use ONLY these codes. Each has a specific meaning — do NOT substitute.

- **200** — Success with body.
- **201** — Resource created.
- **204** — Success, no body.
- **400** — Malformed request (parse error, missing required header).
- **401** — Authentication missing or invalid.
- **403** — Authenticated but not authorized for this resource.
- **404** — Resource not found.
- **409** — Conflict (uniqueness violation, version mismatch).
- **422** — Validation error (well-formed but semantically invalid).
- **500** — Unexpected server error inside this handler. The handler did not depend on a downstream service.
- **503** — Downstream failure (DB unavailable, upstream API timeout). NEVER use 503 for a bug in this handler — that is a 500.

## Required middleware

Every route handler MUST be preceded by `validateRequest(schema)`:
router.post('/path', validateRequest(orderSchema), async (req, res) => { ... })
- Pass an actual schema object — NEVER `null`, NEVER `undefined`.
- Schemas live in `src/schemas/<resource>.js`. If one doesn't exist, create it before adding the route.
- For routes with no body (GET, DELETE), pass an empty-object schema: `validateRequest({})`.

## Async handlers

- All handlers are `async` functions.
- Wrap the handler body in `try/catch`.
- The `catch` block MUST return the error envelope above. NEVER return `err.message` or `err.stack`.

## Database access

- Always go through the connection pool in `src/db/`. NEVER call `db.connect()` directly inside a route.
- Always use parameterized queries. NEVER interpolate user input into SQL strings.
- Wrap DB errors as 503 with `retryable: true` — but inspect the error first to ensure it's actually a downstream issue (connection refused, timeout). Logic errors in your query are 500.

## Imports

- Every dependency referenced in a route must be imported at the top of the file. Do NOT rely on globals.
- Common imports: `express`, the validateRequest middleware, the pool from `src/db`, schemas from `src/schemas`.
