---
argument-hint: <path to file or directory to review>
description: Run a structured code review on the given path. Returns JSON findings.
---

You are reviewing the code at: $ARGUMENTS

Read the target path, then review the code against the conventions in CLAUDE.md.

## Review categories

Report findings in exactly these three categories — nothing else:

1. **Bugs** — logic errors, null/undefined hazards, race conditions, off-by-one, incorrect HTTP codes, broken control flow.
2. **Security** — injection risk, secrets in code, missing auth checks, unsafe deserialization, leaked error details.
3. **Error handling** — missing try/catch, raw DB errors returned to clients, missing `validateRequest`, responses outside the `{ data, meta }` envelope, unhandled promise rejections.

## 🔒 Do NOT report — no exceptions

These are not findings. If you find yourself about to report one, stop and discard it.

- **Style or formatting.** Indentation, quote style, semicolons, line length, trailing commas. Not a finding.
- **Naming preferences.** Renaming a variable for "clarity" when the existing name is correct. Not a finding.
- **Micro-performance.** "Use `for` instead of `.map`" or "this could be memoized." Not a finding unless the code is in a measured hot path documented in CLAUDE.md (it isn't).
- **Test coverage gaps that already match CLAUDE.md's three-test rule** (happy path, validation error, server error). If those three exist, do not request more.
- **Missing JSDoc, comments, or type annotations.** Not a finding.
- **Suggestions to "consider" or "perhaps."** If you are not confident it is a defect, omit it.

If the code is clean against the three categories, return an empty array. An empty array is a valid, expected, frequent result.

## Output format

Return ONLY a valid JSON array. No prose before or after. No markdown fences. The array must be parseable by `JSON.parse`.

Each finding has exactly these fields:

```json
{
  "file": "src/routes/orders.js",
  "line": 42,
  "severity": "high" | "medium" | "low",
  "category": "bug" | "security" | "error-handling",
  "issue": "One sentence describing the defect.",
  "suggestion": "One sentence with the concrete fix."
}
```

Severity guide:
- **high** — will break in production (crash, data loss, security breach)
- **medium** — will misbehave under realistic conditions (wrong status code, leaks error detail)
- **low** — convention violation that affects maintainability (envelope format, missing middleware)

If no issues: return exactly `[]`.
