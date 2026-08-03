# Shared UI catalog (product kit)

Use this file when implementing production screens so AI/humans pick existing `My*` / shared UI instead of inventing one-off layouts.

Learn props and visuals from `playground`. Learn production wiring from `src/features/todo` (list async states + `MyCard` rows).

For architecture/theme rules, still follow `ui-theme-standard.md` and `coding-conventions.md`.

## Decision table (prefer these first)

| Need | Use | Do not invent |
|------|-----|---------------|
| List / settings row surface | `MyCard` | One-off card StyleSheet / raw `Pressable` + shadow |
| Section separator | `MyDivider` | Hardcoded `borderBottomWidth` / hex borders |
| Search field | `MySearchInput` | Manual search icon + clear on `MyTextInput` |
| Initial list/page loading | `MySkeleton` | Ad-hoc gray boxes / spinner-only blank screen when skeleton fits |
| Empty list / empty filter | `MyEmptyState` | Blank `View` or title-only without shared empty |
| Fetch failure + retry | `MyErrorState` | Inline error text without retry affordance |
| Boolean / checkbox / radio in `MyForm` | `MyFormCheckbox` | `MyCheckbox` + `Controller` ad-hoc in new screens |
| Image carousel + fullscreen preview | `ImageSlider` + `ImagePreview` | Custom pager/zoom unless kit cannot support the case |

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

### `MyFormCheckbox`

- Path: `@/components/form` (or `@/components/form/adapters`)
- Bind via `name` like other `MyForm*` adapters; supports `MyCheckbox` `type` (`checkbox` / `radio`)
- Prefer over wiring `MyCheckbox` + RHF manually in new form screens
- Playground: form demo includes checkbox field (`…/playground/form.tsx`); element-only: `…/playground/checkbox.tsx`

## Media (slider + preview)

### `ImageSlider`

- Path: `@/components/ui/image-slider`
- Product carousel; opens fullscreen preview when configured by call site
- Playground: `…/playground/image-slider.tsx`

### `ImagePreview`

- Path: `@/components/ui/image-preview`
- Fullscreen modal over `images[]`: horizontal pager (slide between images), double-tap/pinch zoom, pan when zoomed
- Uses `expo-image` for contain (not `MyImage` — `MyImage` forces square aspect)
- While zoomed, pager swipe is disabled; zoom reset re-enables paging
- Key props: `images`, `activeIndex`, `visible`, `label`, `onClose`, `onIndexChange`

## Import cheat sheet

```ts
import MyCard from '@/components/elements/my-card'
import MyDivider from '@/components/elements/my-divider'
import MyEmptyState from '@/components/elements/my-empty-state'
import MyErrorState from '@/components/elements/my-error-state'
import MySearchInput from '@/components/elements/my-search-input'
import MySkeleton from '@/components/elements/my-skeleton'
import { MyFormCheckbox } from '@/components/form'
import { ImagePreview } from '@/components/ui/image-preview'
import { ImageSlider } from '@/components/ui/image-slider'
```

## Anti-patterns

- Blank list while loading or when empty
- Feature-local “EmptyView” / “ErrorBox” when these facades already cover the case
- New card StyleSheets for standard padded/elevated/pressable surfaces
- Importing `@expo/ui` from features (use branded facades only)
- Copying playground wrapper noise into production screens
