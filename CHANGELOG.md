# Changelog

Tracks changes to the shared kit layer (`src/components/elements`, `src/components/ui`, theme,
and kit-wide tooling) — the parts a product forked from this repo would want to pull forward.
Product-only work (`src/features/<domain>`, product branding, product API wiring) does not
belong here; see `.docs/platform-kit-sync.md`.

Add an entry under `Unreleased` in the same PR that changes shared kit code. Products pull this
repo via a manual backport, not a package/submodule, so this file is the only way a forked
product finds out what changed since it forked.

## Unreleased

### Changed
- `FormFooterBar` / `FormFooterAmountBar`: desktop footer inner matches the form column
  (`FORM_PAGE_MAX_WIDTH` 1280). Amount bar stretches; total stays left; extra control is
  `right` (was `leading`). Primary/save actions sit on the right. Backported from `my-store`.
- `side-bar`: narrower rails — flush `280 → 240`, card `260 → 220`. Collapsed width unchanged.

### Fixed
- `MyBottomSheet`: on web always use RN `Modal` instead of BottomSheetModal/vaul. Nested
  pickers inside another RN Modal (e.g. a fullscreen filter) were portaled behind it and
  never appeared. Backported from `my-store`.
- `MyDropdownInput` / `MyTextInput`: clear (X) lives in the field `endIcon` and stops
  the parent open-press; the trigger hit box matches `MAX_INPUT_WIDTH`. Backported from
  `my-store`.
- `MyTextInput` `numberFormat`: focus selects the whole value so the next keystroke
  replaces it. Backported from `my-store`.
- `side-bar`: collapse/expand remasured rows at `y = 0` on web, so the active pill jumped to
  the first item. Highlight Y is now computed from row/section heights (sections use a fixed
  expanded height of 40). Backported from `my-store`.
- `side-bar`: the active-item highlight (and row color/opacity) stuttered on web when the
  destination screen did a heavy synchronous re-render. Reanimated `withTiming` interpolates on
  the JS main thread there, so it contended with that work; native is unaffected because it
  already animates on the UI thread. Web now drives those properties with a compositor CSS
  `transition` instead, and still `cancelAnimation`s before writing a new native `withTiming` so
  overlapping updates cannot race.
- `src/theme/colors.ts`: `icon.active.tertiary` was hardcoded to `white`, breaking the otherwise
  monotonic `active` ladder (`900 → 700 → white → 300`) and making the icon disappear if that
  token was ever used on a light surface. Now `gray500`, matching `text.active.tertiary`. The 13
  call sites that relied on the old `white` value (playground buttons, `side-bar`, `image-preview`,
  `table-row-more-menu`, `floating-contact`, `my-checkbox`, `my-dropdown-input`) now use the new
  `icon/contrast/dark` token instead (see Added below) — same rendered color, correct token.
- `swipeable-item`: the card shadow/border went through three rounds of fixes. It started
  clipped by the row's own `overflow: hidden` reveal-strip container (moved outside `clip` via a
  new `elevation`/`cardStyle` shell); the shell then rendered static (not sliding with the
  content) and behind a revealed strip's opaque background (now animates with the same
  `translateX` and paints after `clip`); and even once correctly positioned, it rendered
  soft/blurry on iOS. Root cause of the blur: iOS needs an explicit `backgroundColor` to compute
  a crisp, radius-aware shadow, but the shell had to stay transparent so it wouldn't paint over
  `children` — two conflicting requirements on one layer. Split into two: an opaque shadow layer
  hidden under `clip`, and a transparent border layer painted after it. Verified pixel-identical
  to `MySurface`'s own shadow via direct pixel sampling on a real iOS Simulator (a screenshot-only
  "looks fixed" claim was wrong the first time — don't trust rendering fixes on iOS without
  sampling actual pixels on device/simulator).
- `swipeable-item`: Android's elevation approximation used a divisor of 2 instead of
  `MySurface`'s own 4, making the fallback ~2x more pronounced than intended.
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
- `i18n`: persist/hydrate app locale (`app.locale` in storage), default from the device,
  `AppLocaleSwitch` on `MySegment`. Backported from `my-store`. `useAppInit` runs
  `hydrateAppLocale`; `WebsiteHeader` shows a compact switcher. `FALLBACK_LOCALE` stays
  `en` in this template (products override, e.g. my-store uses `vi`).
- `my-segment`: sliding labeled pill for 2+ equal-width values (`options`, `value`,
  `onChange`, `size?: 'compact' | 'default'`). Backported from `my-store` so products stop
  inventing a local `*-switcher` for locale / period / billing. Playground:
  `…/playground/segment.tsx`.
- `menu-list-card`: optional `trailing` on a row (replaces the chevron); `onPress` is
  optional so a row can host a control without being a button.
- `text/contrast/{light,dark}` and `icon/contrast/{light,dark}` theme tokens
  (`src/theme/colors.ts`): pick a text/icon color that reads well **on top of one specific
  fill/badge/button**, independent of the app's light/dark theme — a screen in one theme can have
  both a dark-fill button and a light-fill badge at once, so this couldn't be solved by the
  existing `active`/`inactive` ladder or by switching theme. Replaces the previous workarounds
  (`brand/white`, hardcoded `'#ffffff'`) for that need; see `.docs/ui-theme-standard.md` §
  "`active`/`inactive` vs `contrast`" for when to use which, including the `warning`-solid gotcha
  (a bright brand color can still need dark text).
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
- `src/components/ui/my-table`: shared web-table shell (`MySurface` panel + horizontal scroll +
  `Pagination` footer) backported from `my-store`. A product declares `columns:
  MyTableColumn[]` — width/align/gap/`hideWhen` are computed once and applied identically to the
  header and every row cell via `React.cloneElement`, so a product can no longer let a header's
  style and a row's style hand-drift apart (the recurring bug class this replaces). Cell content
  stays fully product-owned via `renderHeader`/`renderCell`. See `shared-ui-catalog.md` § `MyTable`.
- `src/hooks/use-measured-table-columns.ts` + `src/utils/responsive-visibility.ts`
  (`resolveHysteresisVisible`): the width-measurement + hysteresis-based show/hide primitives
  `MyTable`'s responsive column-hiding is built on — Schmitt-trigger-style (hide/show thresholds
  a margin apart) so a table's own width oscillating a few px near a breakpoint (e.g. the
  browser scrollbar appearing/disappearing as a column hides) can't flicker a column open/closed
  forever.
- `jest.config.js`: added a `resolver` for `react-native-worklets` (reanimated 4's native
  runtime resolves to its non-`.native.ts` build under Jest) plus `moduleNameMapper` stubs for
  `@expo/vector-icons` and `expo-haptics` — both pull in `expo-modules-core` native code at
  import time that Jest/jsdom has no bridge for. Without these, no component that renders
  `MyIcon` or `MyPressable` (i.e. almost everything) can be full-rendered in a test; `MyTable`'s
  own test suite is the first component test in this repo that actually exercises this path.

### Changed
- `my-tab-switcher`: add `fillParent` (default `true`, reports-style full-height pane). Nested
  inside a page `ScrollView`, `flex: 1` on both the switcher and its pane lets iOS trap pans in
  the inner scroll. Pass `fillParent={false}` so the switcher hugs content. Playground demo
  (already inside a scroll) now uses hug mode.
- `swipeable-item`: card shadow/border layer logic extracted into `use-card-shell.ts` (the main
  file had grown to 471 lines picking up loose ends across the shadow-fix commits above); the
  swipe-to-delete commit-threshold formula, previously repeated identically 4x across
  `settle()`/`onUpdate()` for the left/right strips, deduped into one `commitThreshold()` worklet
  helper; the card corner radius, previously `Radius.large` hardcoded in two places plus
  `getRadius('large')` in `styles.ts`, centralized into one `CARD_SHELL_RADIUS` export; the
  `SwipeableActionButtons` export (zero consumers anywhere in the codebase) removed.
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
