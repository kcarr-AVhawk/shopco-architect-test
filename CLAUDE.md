# CLAUDE.md — ShopCo Backend API

## Project Overview

Node.js/Express REST API for ShopCo's e-commerce platform. Serves backend routes,
DB access, and rate-limited endpoints.

- **Stack:** Node.js + Express, Jest, npm
- **Entry point:** `src/index.js`
- **Layout:** routes in `src/routes/`, DB layer in `src/db/`, middleware in `src/middleware/`
- **Config:** root `CLAUDE.md` (this file), modular rules in `.claude/rules/`,
  commands in `.claude/commands/`, MCP servers in `.mcp.json`

## Commands

- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`
- Dev server: `npm run dev`

## Coding Conventions

### 🔒 Non-negotiable per-route rules — NO exceptions

These apply to **EVERY** route, including endpoints that feel trivial:
`/health`, `/ping`, `/status`, `/ready`, `/version`, `/metrics`. If an
endpoint returns a response, it follows all three rules below — full stop.

1. **Every handler is wrapped in try/catch.** On catch, respond with
   `{ error: { code, message, retryable } }`. A `/health` route returning
   `{ status: "ok" }` still goes inside try/catch. No shortcuts.

2. **Every successful response uses the envelope** `{ data, meta: { requestId, timestamp } }`.
   No raw objects returned directly. `/health` → `res.json({ data: { status: "ok" }, meta: { requestId, timestamp } })`,
   **not** `res.json({ status: "ok" })`.

3. **Every route calls `validateRequest(schema)` middleware before the handler** —
   even routes with no body or params. Pass an empty/pass-through schema if
   there's nothing to validate. The middleware slot is non-optional so the
   request-ID and error-shape wiring is uniform across the codebase.

### General

- async/await only — no callbacks, no raw Promises
- HTTP codes: **422** validation, **409** conflict, **503** downstream failure
- Timestamps: stored UTC Unix ms, displayed ISO 8601
- Naming: functions `camelCase` · files `kebab-case` · classes `PascalCase`

## Testing Standards

### 🔒 Non-negotiable per-route — three tests minimum, NO exceptions

**Every route — including `/health`, `/ping`, `/status`, `/ready` — ships
with three tests minimum:**

1. **Happy path** — valid request produces the success envelope with the
   correct `data` payload and populated `meta`.
2. **Validation error** — invalid input produces HTTP 422 and the
   `{ error: { code, message, retryable } }` error shape.
3. **Server error** — downstream failure (DB, upstream HTTP) produces the
   appropriate 5xx and error shape. Use `jest.mock` to simulate.

"Simple" routes do not get fewer tests. If a route feels too simple for
three tests, write them anyway — that's the convention.

*Detailed testing conventions in .claude/rules/testing.md (loaded when editing test files).*

## Known Gotchas

- `src/db/` uses a connection pool — never call `db.connect()` directly
- Rate limiting is **global**, applied in `src/middleware/rate-limit.js`
- All timestamps are UTC Unix ms at rest, ISO 8601 on the wire

## What Claude Should NOT Do

- Do **not** install npm packages without asking first
- Do **not** edit `.env` files
- Do **not** refactor files outside the current task's scope
- Do **not** return raw DB errors to clients
- Do **not** write snapshot tests or use `test()` instead of `describe`/`it`
- Do **not** skip the Non-negotiable rules above for "simple" or "trivial"
  routes. If the thought surfaces — *"this endpoint is too simple for
  try/catch / the `{ data, meta }` envelope / `validateRequest` / three
  tests"* — that is exactly the moment to apply them anyway. The
  conventions exist so the codebase stays uniform. No special cases.
