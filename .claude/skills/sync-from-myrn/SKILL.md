---
name: sync-from-myrn
description: Pull shared-kit updates from the MyRN platform template into this product repo, using MyRN's CHANGELOG.md as the manifest of what changed and a local sync marker to know where the last sync left off.
---

# Sync from MyRN

Use this in a **product repo** (a project started from the MyRN template, e.g. `my-store`,
`blue-star`) to pull forward shared-kit updates from MyRN — the reverse of
`.docs/platform-kit-sync.md`, which covers backporting product-invented UI *into* MyRN.

This is a judgment task, not a mechanical patch apply. Read each changed file with real
understanding before touching the product's copy — see "Applying a change" below.

## 0. Preconditions

- This repo must be a git repository with at least one commit. If it isn't yet
  (`git rev-parse --git-dir` fails), stop and tell the user to `git init` (and commit the current
  state) first — don't do that yourself without asking, since it's the first git action on the
  repo.
- MyRN's canonical remote is `https://github.com/ThinhNguyenVN/MyRN`. If no remote named `myrn`
  exists (`git remote get-url myrn`), add it: `git remote add myrn https://github.com/ThinhNguyenVN/MyRN`.
  This works even though this repo doesn't share git history with MyRN — everything below reaches
  MyRN's content by path by via `git show`/`git diff` against the `myrn` remote, not by ancestry.
- `git fetch myrn` to get the latest `myrn/main`.

## 1. Find the sync marker

Look for `.myrn-sync.json` at the repo root:

```json
{
  "lastSyncedSha": "<myrn commit sha>",
  "lastSyncedAt": "<ISO date>",
  "notes": "<optional short human note from the last sync>"
}
```

- **File exists:** the sync scope is everything added to MyRN's `CHANGELOG.md` between
  `lastSyncedSha` and `myrn/main` HEAD. Get it with:
  `git diff <lastSyncedSha> myrn/main -- CHANGELOG.md` — only the **added** (`+`) lines are new
  entries; ignore context/removed lines.
- **File doesn't exist (first sync):** the scope is everything currently under MyRN's
  `## Unreleased` heading. Read it with `git show myrn/main:CHANGELOG.md`.

Either way, end up with a list of changelog bullets to consider — each one names a component/file
and explains what changed and why. That explanation is the point: it tells you *why* a fix was
needed, which is what lets you judge whether this product needs the same fix versus already being
unaffected.

## 2. Scope: what to pull, what to leave

Only the shared kit layer is in scope — same boundary as `.docs/platform-kit-sync.md`:

- `src/components/elements/*`, `src/components/ui/*` — generic primitives
- `src/theme/*`, `src/types/*`, `src/configs/brand.config.ts` (only the *shape*, never a
  product's actual palette values)
- Kit-wide tooling (`scripts/check-hardcoded-colors.js` and similar), `.docs/*` conventions

Never pull:
- `src/features/<domain>/*` — product screens
- Anything already product-branded (colors, copy, nav config) — a changelog bullet that touches
  `brand.config.ts`'s *shape* is in scope; one product's actual brand values are not
- Playground-only changes (new demo routes, playground screen reshuffles) — unless the product
  still ships `playground` unmodified and the user wants it kept in sync too; ask if unsure

If `.docs/platform-kit-sync.md` exists in this repo (it does unless the product deleted it),
defer to its table over the summary above if they ever disagree.

## 3. Applying a change

For each in-scope bullet, per file it touches:

1. `git diff <product's current version> myrn/main -- <path>` to see MyRN's actual change.
2. Read the product's current version of that file. If it's untouched since the product forked,
   apply MyRN's change directly (`git show myrn/main:<path>` to get the new content, or apply the
   diff with `git apply`/`git apply --3way` for a multi-file patch).
3. If the product has customized that file (renamed props, added product-specific logic, wrapped
   it differently), **port the intent of MyRN's change into the product's current version by
   hand** rather than overwriting — the same way you'd reconcile a merge conflict with judgment.
4. If the change doesn't apply here at all (component not used, already fixed differently,
   superseded by product-specific work), skip it — note why in your final summary so the record
   is honest, not just quiet.

## 4. Verify

Run this repo's own lint/typecheck/test commands (check `package.json` scripts — same names as
MyRN: `yarn lint`, `npx tsc --noEmit`, `yarn test` or equivalent) before considering the sync done.

## 5. Wrap up

- **Do not commit automatically.** Summarize what was pulled in (bullet per change), what was
  skipped and why, and anything that needs the user's own follow-up (e.g. a customization that
  made porting a fix ambiguous). Ask before committing, same as any other change in this repo.
- Once the user confirms, write/update `.myrn-sync.json` with `myrn/main`'s current HEAD sha
  (`git rev-parse myrn/main`), today's date, and a one-line note — include that file in the
  commit.
