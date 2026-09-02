# Changelog

Tracks changes to the shared kit layer (`src/components/elements`, `src/components/ui`, theme,
and kit-wide tooling) — the parts a product forked from this repo would want to pull forward.
Product-only work (`src/features/<domain>`, product branding, product API wiring) does not
belong here; see `.docs/platform-kit-sync.md`.

Add an entry under `Unreleased` in the same PR that changes shared kit code. Products pull this
repo via a manual backport, not a package/submodule, so this file is the only way a forked
product finds out what changed since it forked.

## Unreleased

### Fixed
- `my-button`, `carousel-dots`: style arrays/objects passed to memoized children were rebuilt on
  every render, defeating their `memo` — now memoized so only the parts that actually changed
  re-render.
- `my-tab-switcher`, `drawer-menu`, `profile-menu-button`, `collapsible`, `my-form-field`: inline
  arrow handlers in JSX (banned by `coding-conventions.md` §5) replaced with named
  `useCallback` handlers — `my-form-field`'s was a ref callback, which fired on every re-render
  rather than only on mount/unmount.
- `my-button`, `floating-contact`, `table-row-more-menu`, hero/testimonials carousel, `my-switch`,
  image-preview/image-slider chrome: hardcoded hex colors and shadow colors replaced with theme
  tokens (`getColor(...)`), matching the kit's own "no hardcoded colors" standard. Colors that
  are genuinely theme-independent (photo-overlay chrome, modal backdrop scrims) are now marked
  with a `theme-exempt` comment instead of silently drifting.

### Added
- `scripts/check-hardcoded-colors.js` (`yarn lint:tokens`, wired into `check:commit`): guards
  `src/components/{elements,ui}` against hardcoded color literals re-appearing.
- `src/configs/brand.config.ts`: the brand palette (`primary`/`secondary`/`tertiary`/
  `quaternary`/`accent`) is now a single override point — rebranding a new product no longer
  requires editing `src/theme/colors.ts` internals.
- `scripts/create-product-from-kit.js` (`yarn create-product`): prompts for app identity and
  rewrites `template.config.json`. Replaces `reset-project` (the `create-expo-app` template
  script, which wiped the repo back to blank — the wrong move for a repo meant to be forked with
  its structure intact).

### Changed
- `my-text`, `my-icon`, `my-surface`: normalized to the standard shared-kit folder layout
  (`foo.tsx` + `type.ts` + `index.tsx` re-export only) — these three predated the convention.
- Home screen (`src/app/(public)/(tabs)/index.tsx`) split into
  `src/features/home/screens/{home-screen.container,home-screen.view,use-home-screen}` per
  `screen-standard.md`; the unreachable second `src/app/(public)/home.tsx` (dead, non-functional
  buttons) was removed.
- Retired remaining Expo-template scaffolding: `external-link.tsx`, `parallax-scroll-view.tsx`,
  `icon-symbol.tsx`/`.ios.tsx` deleted; `collapsible` rebuilt on `MyIcon`/`MyPressable`; home and
  playground headers use a plain `ScrollView` instead of `ParallaxScrollView`.
