---
description: Testing conventions — loaded only when editing test files.
paths:
  - "**/*.test.js"
  - "**/*.test.ts"
  - "**/*.spec.js"
  - "**/*.spec.ts"
---

# Testing Conventions

## Framework

- Jest is the test runner. Do NOT use other frameworks.
- Use `describe()` and `it()`. The bare `test()` function is banned — always use `describe`/`it`.
- Test files are colocated with source: `foo.js` → `foo.test.js` in the same directory.

## Required test cases per route or handler

Every route or exported handler MUST have these three tests, in this order:

1. **Happy path** — valid input produces expected output and 2xx status.
2. **Validation error** — bad input produces 422 with the structured error envelope.
3. **Server error** — downstream failure (DB, network) produces 503 with the structured error envelope.

If those three exist, do NOT request additional tests in code review. They are sufficient.

## Test naming

- Test names read as full sentences. `it('returns 422 when items array is empty')`, NOT `it('test items')`.
- Top-level `describe` is the unit under test: `describe('POST /orders', () => { ... })`.
- Nested `describe` is allowed for grouping by scenario but optional.

## Structure

- **Arrange / Act / Assert** separated by blank lines inside each `it` block.
- Setup that's identical across tests goes in `beforeEach`.
- Avoid `beforeAll` unless the setup is genuinely expensive and idempotent.

## Mocking

- External HTTP calls — mock with `jest.mock` at the module level.
- Database calls — mock the connection pool, not individual query methods.
- Time — use `jest.useFakeTimers()` for any test asserting timestamp behavior.
- Never mock `validateRequest` — the integration is part of what's being tested.

## Banned

- **Snapshot tests** — banned project-wide. They obscure intent and rot silently.
- `test()` — use `describe`/`it`.
- Skipping tests with `.skip()` in committed code. If a test is broken, fix or delete it.
- `expect.anything()` and `expect.any(Object)` as the only assertion in a test — too loose to catch regressions.

## Coverage

- Coverage is not enforced as a percentage. The three-test rule is the bar.
- A route with happy + validation + server-error tests is "covered enough." Reviewers should NOT request more.
