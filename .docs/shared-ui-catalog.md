# Shared UI catalog (product kit)

Use this file when implementing production screens so AI/humans pick existing `My*` / shared UI instead of inventing one-off layouts.

Learn props and visuals from `playground`. Learn production wiring from `src/features/todo` (list async states + `MyCard` rows).

For architecture/theme rules, still follow `ui-theme-standard.md` and `coding-conventions.md`.

Reusable kit invented in a product must be backported here — see `platform-kit-sync.md`.

## Decision table (prefer these first)

| Need | Use | Do not invent |
|------|-----|---------------|
| List / settings row surface | `MyCard` | One-off card StyleSheet / raw `Pressable` + shadow |
| Section separator | `MyDivider` | Hardcoded `borderBottomWidth` / hex borders |
| Search field | `MySearchInput` | Manual search icon + clear on `MyTextInput` |
| Header search that expands | `ExpandableSearch` (`components/ui/expandable-search`) | Ad-hoc animated width + icon toggle |
| Floating add / primary action | `FloatingActionButton` (`components/ui/floating-action-button`) | Absolute `MyButton.Icon` one-offs |
| List row: thumb + title + subtitle + trailing | `MediaListRow` (`components/ui/media-list-row`) | One-off product/order row layouts |
| Desktop page header (title + back + actions) | `WebsiteHeader` (`components/ui/website-header`) | One-off private header chrome |
| Multi-step wizard indicator | `Stepper` (`components/ui/stepper`) | Custom step circles / progress rows |
| List pagination controls | `Pagination` (`components/ui/pagination`) | Ad-hoc prev/next + page buttons |
| Initial list/page loading | `MySkeleton` | Ad-hoc gray boxes / spinner-only blank screen when skeleton fits |
| Empty list / empty filter | `MyEmptyState` | Blank `View` or title-only without shared empty |
| Fetch failure + retry | `MyErrorState` | Inline error text without retry affordance |
| Boolean / checkbox / radio in `MyForm` | `MyFormCheckbox` | `MyCheckbox` + `Controller` ad-hoc in new screens |
| Image carousel + fullscreen preview | `ImageSlider` + `ImagePreview` | Custom pager/zoom unless kit cannot support the case |
| Pick image from library (web/iOS/Android) | `pickImage` / `buildImageFormData` (`components/ui/image-picker`) | Ad-hoc `<input type="file">` / Files document picker for photos |
| Image dropzone + preview + clear | `ImagePickerField` (`components/ui/image-picker`) | Feature-only upload boxes that reimplement dashed dropzone UI |
| Edge nav drawer (hamburger menu) | `DrawerMenu` | Ad-hoc `Modal` + absolute panel |
| App rail (web) | `SideBar` (`card` \| `flush`, icons, header/footer) | One-off left nav View |
| Bottom tabs (pill active) | `useTabBar` / `TabBarButton` | Raw `tabBarButton` + default RN border/elevation |

## Layout surfaces

### `MyDivider`

- Path: `@/components/elements/my-divider`
- Props: `orientation?: 'horizontal' \| 'vertical'` (default `horizontal`) + `ContainerStyleProps`
- Tokens: border/spacing via theme — do not hardcode border color
- Playground: `src/app/(public)/(tabs)/playground/divider.tsx`

### `MyCard`

- Path: `@/components/elements/my-card`
- Compose: `MySurface` + padding/radius; optional `onPress` → `MyPressable`
- Key props: `children`, `elevation?: ElevationToken \| 'none'`, `radius?`, `onPress?`, `disabled?` + `ContainerStyleProps`
- Prefer for list/settings rows; use `MySurface` directly when you only need elevation without card padding/press API
- Playground: `…/playground/card.tsx` (includes elevation cases: `none`, soft/hard)
- Canonical: `src/features/todo/screens/todo-list.view.tsx` (row surface)

## Navigation chrome

### `DrawerMenu`

- Path: `@/components/ui/drawer-menu`
- Edge panel with backdrop fade + slide; props: `visible`, `onClose`, `title`, `subtitle?`, `meta?`, `data`, `onSelected?`, `side?: 'left' \| 'right'` (default `left`), `width?`, `headerContent?`, `footer?`
- Playground: `src/app/(public)/(tabs)/playground/drawer-menu.tsx`

### `SideBar`

- Path: `@/components/ui/side-bar`
- Sliding highlight nav list; `variant?: 'card' \| 'flush'`; optional `icon` / `iconFocused`, `header`, `footer`, `highlightColor`
- Used by playground layout rail; product flush rail for authenticated chrome

### `Tab bar` (`useTabBar` / `TabBarButton`)

- Path: `@/components/ui/tabbar`
- Pill active state, theme tokens, dark-mode border/elevation overrides for RN `BottomTabBar`
- `useTabBar({ items, openDrawer?, mobileOnly? })` → `renderTabBar`, `screenOptions`, `tabScreens`
- Pass `items: TabBarNavItem[]` (`id`, `labelKey`, `icon`, `iconFocused?`)
- `mobileOnly: true` when desktop uses a sidebar instead of tabs
- `openDrawer` enables mobile header menu button
- Nested routes can hide the bar via pathname heuristics in `use-tab-bar` (e.g. create/edit screens)
- Sample wiring: `src/app/(public)/(tabs)/_layout.tsx`

### `WebsiteHeader`

- Path: `@/components/ui/website-header`
- Desktop page header: title, optional back, notifications + profile actions
- Pair with `WebsiteHeaderNav` for stack header options; `useComingSoon` backs unwired actions
- Playground: `…/playground/website-header.tsx`

## List / async UI states

Wire in this order for list-first screens:

1. Initial load (no data yet) → `MySkeleton`
2. Fetch failed (no usable stale content) → `MyErrorState` + `onRetry`
3. Success but zero items → `MyEmptyState`
4. Success with items → list content (`MyList` + row UI)

Canonical reference: `todo-list.view.tsx` / `todo-list.container.tsx`.

### `MySkeleton`

- Path: `@/components/elements/my-skeleton`
- Props: `preset?: 'listRow' \| 'textBlock' \| 'card'` (default `listRow`), `count?` (default `1`), `isLoading?` (default `true`)
- Example: `<MySkeleton preset="listRow" count={6} />`
- Playground: `…/playground/skeleton.tsx`

### `MyEmptyState`

- Path: `@/components/elements/my-empty-state`
- Props: `title` (required), `subtitle?`, `actionLabel?` + `onActionPress?`
- Playground: `…/playground/empty-state.tsx`

### `MyErrorState`

- Path: `@/components/elements/my-error-state`
- Props: `message` (required), `title?`, `retryLabel?` (default Retry), `onRetry` (required)
- Playground: `…/playground/error-state.tsx`

## Search + form

### `MySearchInput`

- Path: `@/components/elements/my-search-input`
- Thin preset on `MyTextInput`: search icon, clear when non-empty, `returnKeyType="search"`; remaining props forward
- Playground: `…/playground/search-input.tsx`

### `ExpandableSearch`

- Path: `@/components/ui/expandable-search`
- Collapsed icon → animated expanded `MySearchInput`; controlled `expanded` / `onExpandedChange`
- Playground: `…/playground/expandable-search.tsx`

### `MyFormCheckbox`

- Path: `@/components/form` (or `@/components/form/adapters`)
- Bind via `name` like other `MyForm*` adapters; supports `MyCheckbox` `type` (`checkbox` / `radio`)
- Prefer over wiring `MyCheckbox` + RHF manually in new form screens
- Playground: form demo includes checkbox field (`…/playground/form.tsx`); element-only: `…/playground/checkbox.tsx`

### `Stepper`

- Path: `@/components/ui/stepper`
- Multi-step indicator; `steps`, `activeStep`, optional `maxReached` / `allowJump` / `onStepPress`
- Playground: `…/playground/stepper.tsx`

### `Pagination`

- Path: `@/components/ui/pagination`
- Prev / next + page buttons with summary copy from `pagination.*` i18n
- Playground: `…/playground/pagination.tsx`

## Media (slider + preview + pick)

### `ImageSlider`

- Path: `@/components/ui/image-slider`
- Product carousel; opens fullscreen preview when configured by call site
- Playground: `…/playground/image-slider.tsx`

### `ImagePreview`

- Path: `@/components/ui/image-preview`
- Fullscreen gallery over `images[]`: pager slide, double-tap/pinch zoom, pan when zoomed
- Do not use `MyImage` inside fullscreen preview (square aspect) — preview path is built for contain
- While zoomed, pager swipe is disabled
- Key props: `images`, `activeIndex`, `visible`, `label`, `onClose`, `onIndexChange`

### `ImagePickerField` / `pickImage`

- Path: `@/components/ui/image-picker`
- `pickImage` + `buildImageFormData` for library pick + multipart; `ImagePickerField` for dropzone UI (web drag-drop)
- Playground: `…/playground/image-picker.tsx`

### `MediaListRow`

- Path: `@/components/ui/media-list-row`
- Thumb + title + subtitle + optional trailing for list rows
- Playground: `…/playground/media-list-row.tsx`

### `FloatingActionButton`

- Path: `@/components/ui/floating-action-button`
- Docked bottom-right `MyButton.Icon`; optional `bottomOffset` above tab bar
- Playground: `…/playground/floating-action-button.tsx`

## Import cheat sheet

```ts
import MyCard from '@/components/elements/my-card'
import MyDivider from '@/components/elements/my-divider'
import MyEmptyState from '@/components/elements/my-empty-state'
import MyErrorState from '@/components/elements/my-error-state'
import MySearchInput from '@/components/elements/my-search-input'
import MySkeleton from '@/components/elements/my-skeleton'
import { MyFormCheckbox } from '@/components/form'
import { ExpandableSearch } from '@/components/ui/expandable-search'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { ImagePickerField, pickImage, buildImageFormData } from '@/components/ui/image-picker'
import { ImagePreview } from '@/components/ui/image-preview'
import { ImageSlider } from '@/components/ui/image-slider'
import { MediaListRow } from '@/components/ui/media-list-row'
import { Pagination } from '@/components/ui/pagination'
import { Stepper } from '@/components/ui/stepper'
import { WebsiteHeader } from '@/components/ui/website-header'
import DrawerMenu from '@/components/ui/drawer-menu'
import SideBar from '@/components/ui/side-bar'
```

## Anti-patterns

- Blank list while loading or when empty
- Feature-local “EmptyView” / “ErrorBox” when these facades already cover the case
- New card StyleSheets for standard padded/elevated/pressable surfaces
- Importing `@expo/ui` from features (use branded facades only)
- Copying playground wrapper noise into production screens
