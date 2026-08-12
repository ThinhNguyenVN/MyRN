# Platform kit sync (MyRN ↔ products)

Use this when a **product clone** (e.g. `my-store`) invents or improves reusable UI that should live in this template for other products.

## Roles

| Repo | Role |
|------|------|
| **MyRN** (this repo) | Platform template — reusable `My*` elements, generic `components/ui`, theme, `.docs/`, playground, OpenSpec **platform** specs |
| **Products** (e.g. `my-store`) | Apps built on this platform — domain features, brand, APIs, product specs |

**Long-term source of truth for shared kit = this repo (MyRN).** Products may ship kit improvements first, then **backport** here.

## Principle

If a new UI piece is useful beyond one product, it belongs in MyRN.

- Product may implement it first to unblock delivery.
- Sync the **generic** version into MyRN soon after so the next product inherits it.
- Do **not** accept product domain screens or product-only API wiring into MyRN.

## What to accept (product → MyRN)

- `src/components/elements/my-*` — new or improved facades
- `src/components/ui/*` — **generic** primitives (tab bar hook, drawer, side-bar list, etc.)
- Shared theme/token/util changes that are not one product’s brand
- Matching `.docs/` updates (catalog, conventions)
- Playground demos for the new surface
- OpenSpec **platform** capabilities when the team wants a durable shipped kit capability

### Strip product coupling

| Leave in the product | Prefer in MyRN |
|----------------------|----------------|
| Private chrome wrappers with product logo/nav | Generic `SideBar` / `DrawerMenu` / `useTabBar` (props-driven) |
| Domain feature screens and cards | — |
| Product API clients / business contracts | — |
| Product OpenSpec steps / product `specs/*.spec.md` | Platform kit OpenSpec only |

## What to reject

- `src/features/<domain>/` product screens
- Brand lockups, product env hosts, demo credentials
- Hardwired product i18n or nav config inside kit facades
- One-off layouts that only match one product screen

## When to sync

- After a product PR that adds/changes shared kit is merge-ready (or right after merge)
- Before kickoff of another product that needs the same UI
- Do **not** wait until the product is “done”

## How to sync (checklist)

1. **Classify** shared kit vs product-only in the product diff.
2. **Branch here:** `feat/sync-<short-slug>` (never `cursor/`).
3. **Port** generic code to the same paths; remove product imports.
4. **API:** props-driven; no product strings inside the facade.
5. **Playground:** add/update a demo route.
6. **Docs:** update `shared-ui-catalog.md` (+ conventions if needed).
7. **OpenSpec (optional):** kit-focused change only — not product step archives.
8. **PR this repo;** note the product PR that originated the kit.
9. **Forward sync:** products pull MyRN when upgrading platform / starting new work.

## Direction cheat sheet

| Direction | Meaning |
|-----------|---------|
| **MyRN → product** | Kickoff / pull platform upgrades into a product |
| **product → MyRN** | Backport reusable UI discovered while shipping a product |

## Agent rules

1. Prefer documenting and demoing kit here so product agents discover it via `shared-ui-catalog.md`.
2. When reviewing a sync PR: require generic API + playground + catalog row; reject domain leakage.
3. When a product session reports new kit without a MyRN sync, open or request `feat/sync-*` here.

## Related docs

| Doc | Use |
|-----|-----|
| `product-kickoff.md` | Starting a product on this template |
| `shared-ui-catalog.md` | Kit decision table |
| `folder-structure.md` | `elements` vs `ui` vs `features` |
| `coding-conventions.md` | Kit file rules |
| `ui-theme-standard.md` | Tokens / shared visuals |
| `openspec/specs/README.md` | Platform capabilities vs product backlog |
