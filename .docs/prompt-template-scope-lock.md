# Prompt template: scope lock before implementation

Use this prompt when the design is large, ambiguous, or split across multiple sources and you want alignment before implementation starts.

## Template

I want you to review the design sources and lock scope before coding.

### Goal
- Do not implement yet.
- First produce a scoped implementation plan for this app/feature using the project conventions in `AGENTS.md`, `.docs/product-kickoff.md`, and `.docs/`.

### Design sources
- Figma: [link]
- Stitch: [link]
- Additional screenshots or notes: [attachments or notes]
- Final source of truth when the sources conflict: [Figma / Stitch / written notes]

### Requested scope
- [screen or flow 1]
- [screen or flow 2]
- [screen or flow 3]

### Context
- Product goal: [short description]
- Data/auth context: [real API / mock / auth requirements]
- Out of scope: [list]

### What I want from you before coding
1. Summarize the target flows and screens.
2. Identify missing or ambiguous behavior from the design.
3. Map the work to the project structure in `src/app`, `src/features`, shared UI, and data/state layers.
4. Propose the implementation order.
5. List any assumptions you would use if I do not clarify them.
6. Call out anything that should follow the default behavior rules.
7. If the design represents a large visual redesign, identify which parts should change at the token layer, shared UI layer, shell layer, and feature-only layer.

### Constraints
- Use `src/features/auth` and `src/features/todo` only as structural references.
- Do not invent a new architecture pattern if the current conventions already cover the case.
- Treat `playground` as a component catalog only.
- If the redesign changes repeated visual patterns across many screens, prefer refactoring shared tokens or shared UI instead of patching each screen locally.
- Keep architecture stable even if the visual system changes heavily.

## Expected output

The scope-lock response should include:
- in-scope screens
- out-of-scope items
- flow summary
- implementation order
- data/state approach
- shared UI reuse plan (map screens to `.docs/shared-ui-catalog.md` kit pieces where applicable)
- open questions
- explicit assumptions if coding were to start immediately
- proposed spec artifact path (`specs/<feature-or-domain-name>.spec.md`) and what sections must be filled first
