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
- `side-bar`: the active-item highlight pill could land on the wrong row after navigating (only
  surfaced once the item list became scrollable — see Changed below). Root cause was `withSpring`
  not reliably converging on react-native-web (it could get stuck mid-flight at an arbitrary
  value) and its completion callback never firing there, which let a "still animating" guard get
  stuck and permanently block future highlight updates. Every write path now unconditionally
  re-asserts the current target instead of trusting that guard, and uses `withTiming` instead of
  `withSpring`, which converges reliably on web.
- `side-bar`: the collapse/expand toggle button snapped to its new position instead of sliding
  with the rail — it computed `left` from a plain boolean instead of the shared `collapseProgress`
  value the rail itself animates on. Now driven by the same value via `useAnimatedStyle`.
- `image-picker`: clicking the picker on web could get stuck showing only a loading spinner, with
  the native file dialog never opening. `expo-image-picker`'s web shim opens the dialog by
  dispatching a click on a hidden `<input type="file">`, which only works when it runs
  synchronously within the click's own call stack. Web's permission check is an unconditional
  granted no-op, but `await`-ing it before launching still cost a microtask hop — enough to drop
  the click's user-activation in some cases. Skipped on web so the launch call is reached
  synchronously, in the same task as the click.
- `expandable-search`: expanded width had no upper bound — on a wide desktop window it stretched
  the field far past any reasonable search-bar width, pushing the trailing close button off the
  screen entirely. Capped at `EXPANDABLE_SEARCH_MAX_WIDTH` (480px).
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
- `src/types/icon.ts`: shared Ionicons name type, deduping the same
  `ComponentProps<typeof Ionicons>['name']` pattern independently redeclared in `side-bar` and
  `drawer-menu` (the same pattern still exists in ~9 other files — `menu-list-card`,
  `media-list-row`, `table-row-more-menu`, `tabbar`, `floating-action-button`,
  `profile-menu-button`, `my-button`, `my-icon`, `my-alert` — not yet swept).
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
- `side-bar`: item list is now scrollable (`ScrollView`) instead of a plain `View` that silently
  clipped once a product's menu grew past the rail's height. Row-position measurement switched
  from a cross-container `measureLayout()` call to reading each row's own `onLayout` event
  (relative to its direct parent), which is simpler and immune to the container now sitting
  inside a `ScrollView`'s scrolling wrapper.
- `side-bar`: real collapsed/expanded rail state is now wired up end-to-end — `collapsed`/
  `collapseProgress` existed on the component already but nothing drove them. Only `variant="flush"`
  gets the animated rail-width shrink; `variant="card"` still only fades labels. A
  `SidebarCollapseToggle` button and default-expanded behavior are demonstrated in the playground.
- Playground: merged the "Expandable Search" demo into "Search Input" (`search-input.tsx`) — both
  showcase search-input variants and didn't need separate sidebar entries.
- `my-text`, `my-icon`, `my-surface`: normalized to the standard shared-kit folder layout
  (`foo.tsx` + `type.ts` + `index.tsx` re-export only) — these three predated the convention.
- Home screen (`src/app/(public)/(tabs)/index.tsx`) split into
  `src/features/home/screens/{home-screen.container,home-screen.view,use-home-screen}` per
  `screen-standard.md`; the unreachable second `src/app/(public)/home.tsx` (dead, non-functional
  buttons) was removed.
- Retired some Expo-template scaffolding: `external-link.tsx` deleted (dead code);
  `icon-symbol.tsx`/`.ios.tsx` deleted; `collapsible` rebuilt on `MyIcon`/`MyPressable`.
  `parallax-scroll-view.tsx` was deleted in the same pass and home/playground headers were moved
  to a plain `ScrollView`, but that dropped a `padding: 16` the component supplied around its own
  content with nothing replacing it, leaving those two screens edge-to-edge with no inset — it
  was restored and both screens use it again.
