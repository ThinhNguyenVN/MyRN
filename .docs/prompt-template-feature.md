# Prompt template: feature or multi-screen flow

Use this template when asking an AI agent to build one feature, one flow, or a small set of screens.

## Copy-paste template

```md
Implement a feature in this repository by following `AGENTS.md` and the relevant files in `.docs/` before coding.

Before implementation, create or update a spec artifact at `specs/<feature-name>.spec.md` using `specs/_template.spec.md`, and keep the spec link in your implementation summary.

## Goal
- Feature name: [feature name]
- Business goal: [what the feature does]
- Completion target: [production-ready / polished MVP / scaffold with correct architecture]

## Design sources
- Figma: [link]
- Stitch: [link]
- Final source of truth: [Figma / Stitch / annotated screenshots / product notes]
- Relevant screens or frame names:
  - [screen 1]
  - [screen 2]
  - [screen 3]

## Scope
Do in this task:
- [screen or flow 1]
- [screen or flow 2]
- [API integration if in scope]
- [shared component updates if in scope]

Do not do in this task:
- [out-of-scope item]
- [out-of-scope item]

## Flow and navigation
- Entry point: [where the user starts]
- Navigation path: [screen A -> screen B -> screen C]
- Exit conditions: [save and go back / replace route / open modal / stay on screen]

## Required behavior
- Loading state: [describe if known]
- Empty state: [describe if known]
- Error state: [describe if known]
- Success handling: [toast / inline / navigate / modal]
- Validation rules: [describe if known]
- Destructive actions needing confirmation: [describe]

If any of the above is unspecified in design, follow `.docs/default-behavior-rules.md`.

## Data and auth
- Backend source: [real API / existing backend / mock / temporary local data]
- API docs or contracts: [link or notes]
- Auth required: [yes/no + brief details]
- Any roles or permissions: [details]
- What must persist across sessions, if anything: [details]

## Technical constraints
- Keep `src/app` as route shell only.
- Put production implementation in `src/features`.
- Follow the `container + view + styles + optional hook/types` pattern.
- Prefer existing shared UI, tokens, and theme helpers.
- Use RTK Query by default for server data.
- Use Redux Toolkit slice/thunk only when they fit the documented boundaries.
- Use `src/features/auth` and `src/features/todo` only as reference implementations for structure and code shape.
- Do not treat `playground` as a structure reference.
- If the new design is visually very different from the current UI and the change repeats across multiple screens, refactor the shared visual layer instead of patching each screen with one-off overrides.
- If the redesign is feature-local and not expected to spread, keep the change local to the feature instead of forcing it into shared UI too early.

## Definition of done
- correct structure and file placement
- correct flow and user behavior in scope
- correct loading/empty/error/success handling
- correct use of shared UI/theme/data-state boundaries
- appropriate validation/testing evidence
- walkthrough evidence for the implemented scope
```

## Notes

- Use this template when design is already fairly clear and you want implementation to begin immediately.
- If the design is still ambiguous, start with `prompt-template-scope-lock.md` first.
- Even when implementation starts immediately, keep `specs/<feature-name>.spec.md` updated as the durable source for scope, assumptions, and AC/test traceability.
