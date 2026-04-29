# Prompt template: full app build

Use this template when asking an AI agent to build a whole app or a large app surface from Figma, Stitch, screenshots, notes, or mixed inputs.

## Copy-paste template

```md
Implement this app in the current repository.

Before coding:
- follow `AGENTS.md`
- read the relevant files in `.docs/`
- use `src/features/auth` and `src/features/todo` only as reference implementations for structure and code shape

## Goal
- Build: [whole app / MVP / app shell + core flows]
- Product purpose: [2-5 lines]
- Completion level: [production-ready / high-fidelity prototype / scaffold with real architecture]

## Design sources
- Figma: [link]
- Stitch: [link]
- Additional screenshots/files: [list]
- Final source of truth if inputs differ: [Figma / Stitch / screenshot set / written notes]

## Scope
Build in this iteration:
- [flow or screen 1]
- [flow or screen 2]
- [flow or screen 3]

Out of scope:
- [items]

## Core flows
- Entry flow: [describe]
- Navigation model: [tabs / stack / modal / redirect rules]
- Main user journeys:
  - [journey 1]
  - [journey 2]
  - [journey 3]

## Screen and behavior expectations
For each screen or flow, define:
- loading behavior: [describe or say "use project defaults"]
- empty behavior: [describe or say "use project defaults"]
- error behavior: [describe or say "use project defaults"]
- success behavior: [describe or say "use project defaults"]
- validation behavior: [describe or say "use project defaults"]
- destructive action behavior: [describe or say "use project defaults"]

If behavior is not specified in design, follow `.docs/default-behavior-rules.md`.

## Data and backend
- Data source: [real API / mock / mixed]
- API docs or contracts: [links or notes]
- Auth requirement: [none / login / token / role-based]
- Main entities:
  - [entity 1]
  - [entity 2]
  - [entity 3]
- Which screens must use real data now:
  - [list]
- Which screens may use mock data temporarily:
  - [list]

## Technical constraints
- `src/app` must stay a thin route shell.
- Production implementation must live in `src/features`.
- Starter routes such as `src/app/(public)/home.tsx` and `src/app/(public)/(tabs)/index.tsx` are replaceable samples, not fixed product requirements.
- Reuse existing shared UI, theme, token, API, and store layers before adding new abstractions.
- If the new design is a large visual redesign, keep the architecture and data boundaries, but allow refactoring shared theme and shared UI layers to match the new system.
- If visual changes repeat across many screens, prefer shared-layer refactors over one-off screen overrides.
- Use RTK Query by default for server data.
- Use Redux Toolkit slice or thunk only when appropriate for client-owned state or orchestration.
- Prefer route constants when paths are reused.
- Do not copy the folder structure of `playground`.

## Text and localization
- Text handling: [use i18n / hardcode temporarily / add keys only for new screens]
- Primary language: [vi / en / bilingual]

## Definition of done
The task is done when:
- app shell, providers, and routes are correct
- features are placed under `src/features`
- UI matches the design within scope
- required states are implemented
- data/auth boundaries follow project conventions
- checks/tests appropriate to the changes are run
- working walkthrough evidence is produced

## Decision policy
If design and implementation constraints conflict:
- preserve project architecture first
- preserve required behavior second
- preserve shared UI/theme consistency third
- preserve visual fidelity fourth

If a detail is missing:
- do not invent a new architecture pattern
- use `.docs/default-behavior-rules.md`
- stay consistent with `auth` and `todo`
```

## Notes for the requester

- Be explicit about what is out of scope.
- If Figma and Stitch differ, declare one final source of truth.
- If links may be inaccessible, attach screenshots and written notes.
- If behavior is not fully designed, say "use project defaults" so the agent follows the shared default rules instead of improvising.
- If the design is a major visual departure from the current app, say so explicitly and ask for a scope-lock pass first.
