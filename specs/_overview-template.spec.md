# Product overview: <product-name>

> Product-level feature roadmap for this repo. Kickoff rules: `.docs/product-kickoff.md` (rule 2).
> Use this **once per product** when there are 2+ main features — write it **before** any
> per-feature `specs/<name>.spec.md` or `openspec/changes/<feature>/`.
> Keep this file high-level: feature list + status only. Full AC, design, and flows live in the
> per-feature spec or OpenSpec change referenced by each row below — do not duplicate them here.

## Metadata
- Product: <product-name>
- Owner: <name>
- Status: Draft | Approved | In Progress
- Last updated: <yyyy-mm-dd>

## Goal
- Business goal:
- Target platforms: iOS | Android | Web
- Completion target: production-ready | polished MVP | scaffold

## Feature list

| # | Feature | Slug | Priority | Status | Spec | OpenSpec change |
|---|---------|------|----------|--------|------|------------------|
| 1 | <Feature name> | `<feature-slug>` | P0 | Not started | `specs/<feature-slug>.spec.md` | `openspec/changes/<feature-slug>/` |
| 2 | | | | | | |

> - Slug is the contract: when a feature is implemented, its spec and OpenSpec change directory
>   must use this **exact slug** — do not rename at implementation time.
> - Status values: `Not started` | `In progress` | `Done`.
> - Leave the `Spec` / `OpenSpec change` cells as the planned path even before that file/folder
>   exists; fill them in for real once the feature starts.

## Out of scope (this version)
- <item 1>
- <item 2>

## Assumptions
- A-01:

## Open Questions
- Q-01:

## Notes
- <cross-feature dependencies, sequencing constraints, shared-kit implications>
