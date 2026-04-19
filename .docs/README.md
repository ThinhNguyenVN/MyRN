# `my-rn` starter-kit docs

This directory defines the working conventions that future apps generated from `create-myrn-app` should follow.

The goal is not to document every file in the repo. The goal is to give humans and AI agents a small set of strict references that are easy to apply in concrete tasks.

## Core rules

- `src/app` is route shell only.
- Production screen implementation lives in `src/features`.
- `src/features/auth` and `src/features/todo` are the canonical reference features.
- `src/app/(public)/(tabs)/playground` stays in the app as a component usage catalog.
- `playground` is not a structure reference for production code.
- Branch names must use `feat/`, `fix/`, `issue/`, or `release/`.
- Do not create or use `cursor/` branches for normal development work.

## Read this file first, then pick the matching spec

- `folder-structure.md`: where code belongs.
- `screen-standard.md`: how one production screen should be built.
- `ui-theme-standard.md`: how to use shared components, tokens, and styles.
- `data-state-standard.md`: how to call APIs and structure RTK Query, Redux Toolkit, hooks, and auth.
- `canonical-references.md`: which existing files are the source of truth when there is ambiguity.

## Suggested AI reading order by task

### Add a new screen

Read:

1. `folder-structure.md`
2. `screen-standard.md`
3. `canonical-references.md`

### Add or update shared UI

Read:

1. `ui-theme-standard.md`
2. `canonical-references.md`

### Add or update API, RTK Query, Redux Toolkit, or auth state

Read:

1. `data-state-standard.md`
2. `canonical-references.md`

### Review whether code follows starter-kit rules

Read all files in this directory, then compare the change against `src/features/auth` and `src/features/todo`.

## What this docs set intentionally does not do

- It does not treat `playground` as production structure.
- It does not encourage inventing new patterns when a canonical one already exists.
- It does not allow route files to become feature modules.

## Golden path

When adding a feature, copy the shape and boundaries from `auth` and `todo` first. Only create a new pattern if both canonical features fail to cover the use case.
