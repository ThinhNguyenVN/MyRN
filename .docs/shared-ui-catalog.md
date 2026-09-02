# Shared UI catalog (product kit)

Use this file when implementing production screens so AI/humans pick existing `My*` / shared UI instead of inventing one-off layouts.

Learn props and visuals from `playground`. Learn production wiring from `src/features/todo` (list async states + `MyCard` rows).

For architecture/theme rules, still follow `ui-theme-standard.md` and `coding-conventions.md`.

Reusable kit invented in a product must be backported here — see `platform-kit-sync.md`.

## Decision table (prefer these first)

| Need | Use | Do not invent |
|------|-----|---------------|
| List / settings row surface | `MyCard` | One-off card StyleSheet / raw `Pressable` + shadow |
| Form/settings section (soft elevation, optional title) | `MySectionCard` | Feature-local `*-section-card.tsx` copy + duplicated `sectionSurface`/`sectionBody` styles |
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
| Form body scroll (native keyboard) | `MyKeyboardAvoiding.ScrollView` | Raw `ScrollView` / `KeyboardAvoidingView` around form fields |
| Initial list loading (page-level) | `LoadingPlaceholder` (`components/ui/loading-placeholder`) | Ad-hoc `MySkeleton` wrappers per screen |
| Image carousel + fullscreen preview | `ImageSlider` + `ImagePreview` | Custom pager/zoom unless kit cannot support the case |
| Pick image from library or camera (web/iOS/Android) | `pickImage` / `pickImageFromCamera` / `buildImageFormData` (`components/ui/image-picker`) | Ad-hoc `<input type="file">` / Files document picker for photos |
| Image dropzone + preview + clear | `ImagePickerField` (`components/ui/image-picker`) | Feature-only upload boxes that reimplement dashed dropzone UI |
| Edge nav drawer (hamburger menu) | `DrawerMenu` | Ad-hoc `Modal` + absolute panel |
| Native full-screen picker / filter | `NativeFullscreenModal` | Feature-local `Modal` with one-off iOS/Android padding |
| Status / tag color | `MyTag` | One-off badge StyleSheets / `MyChip` for status |
| App rail (web) | `SideBar` (`card` \| `flush`, icons, header/footer) | One-off left nav View |
| List filter menu (mobile sheet + desktop popover) | `MyBottomSheet` (mobile) + `TriggerModal` (desktop), Clear/Apply through `footer` prop | Rendering Clear/Apply inside the scrollable panel; `useScrollView={false}` + custom `contentContainerStyle` as a footer-spacing workaround |
| Bottom tabs (pill active) | `useTabBar` / `TabBarButton` | Raw `tabBarButton` + default RN border/elevation |
| In-page tab switcher (2+ content panes, animated slide) | `MyTabSwitcher` (`components/ui/my-tab-switcher`) | Ad-hoc `useState` + conditional render without transition |
| Form sticky footer (save + extras + amount) | `FormFooterBar` | One-off absolute footer rows |
| Order line (product / unit / qty / price) | `OrderFormLineEditor` | Feature-only line cards |
| Desktop table row overflow | `TableRowMoreMenu` | Ad-hoc `TriggerModal` per table |
| Client-side list paging | `useClientListPaging` | Per-feature page/load-more state |
| Grouped nav rows in a card (settings/profile-style) | `MenuListCard` (`components/ui/menu-list-card`) | One-off row list with hand-rolled dividers/chevrons |
| Avatar-triggered popover menu (e.g. header profile action) | `ProfileMenuButton` (`components/ui/profile-menu-button`) | Ad-hoc `TriggerModal` + avatar wiring per screen |
| Marketing/landing hero with slide transition | `HeroCarousel` + `HeroBackground` (`components/ui/carousel`) | Feature-local carousel + manual crossfade `Animated.Image` |
| Testimonial / review carousel | `TestimonialsCarousel` (`components/ui/carousel`) | One-off card + `useState` index per landing feature |
| Sliding dot indicator (any carousel) | `CarouselDots` (`components/ui/carousel`) | Inline `onPress={() => setIndex(i)}` per dot (violates `no-inline-render-handlers`) |
| Floating contact buttons (call/email/chat stack) | `FloatingContact` (`components/ui/floating-contact`) | Ad-hoc absolute `View` + per-button `Animated` pulse |

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

### `MySectionCard`

- Path: `@/components/elements/my-section-card`
- Compose: `MySurface` (`elevation="soft/down/small"`, `fill/background/tertiary`) + padded `MyView` body + optional title
- Key props: `title?: string`, `children`, `radius?: RadiusType` (default `'large'`), `gap?: number` (default `getSpacing('x6')`)
- Use for a titled form/settings section card — do **not** re-create a local `*-section-card.tsx` per feature, that's exactly the duplication this component replaces
- If the ScrollView content wrapping a `MySectionCard` sits flush against its container's horizontal edges (no `paddingHorizontal` inside the `ScrollView`'s `contentContainerStyle`), the card's elevation shadow gets clipped left/right on web — `react-native-web`'s `ScrollView` sets `overflow-x: hidden`, so shadow needs padding *inside* the scroll content (not just on a wrapper outside the `ScrollView`) to have room to spread into

### `MyTag`

- Path: `@/components/elements/my-tag`
- Pill status label: `tone` `success` \| `neutral` \| `alert` \| `warning` \| `info`; `size` `default` \| `compact`
- Use for order/history/stock status — do not restyle `MyChip` or duplicate badge StyleSheets
- Playground: `…/playground/tag.tsx`

## Navigation chrome

### `DrawerMenu`

- Path: `@/components/ui/drawer-menu`
- Edge panel with backdrop fade + slide; props: `visible`, `onClose`, `title`, `subtitle?`, `meta?`, `data`, `onSelected?`, `side?: 'left' \| 'right'` (default `left`), `width?`, `headerContent?`, `footer?`
- `DrawerProvider` / `useOpenDrawer` for hamburger → open drawer without product chrome
- Playground: `src/app/(public)/(tabs)/playground/drawer-menu.tsx`

### `NativeFullscreenModal`

- Path: `@/components/ui/native-fullscreen-modal`
- Native-only full-window picker chrome: iOS `presentationStyle` (`fullScreen` or `pageSheet`), Android full `Modal` + top inset
- Props: `visible`, `title`, `onClose`, `children`, `presentation?`, `onDismiss?`, `footer?`, `avoidKeyboard?`
- Used by `MyDropdownInput` (`pageSheet`) and mobile list filters (`fullScreen`)

### `SideBar`

- Path: `@/components/ui/side-bar`
- Sliding highlight nav list; `variant?: 'card' \| 'flush'`; optional `icon` / `iconFocused`, `header`, `footer`, `highlightColor`
- Collapse: `collapsed?` + optional `collapseProgress` SharedValue; width `SIDEBAR_COLLAPSED_WIDTH` (72). Section rows: `kind: 'section'`
- `SidebarCollapseToggle` — circular chevron chip for product rails (props: `collapsed`, `onPress`, `accessibilityLabel`)
- Auto-collapse helper: `BREAKPOINT_SIDEBAR_COMPACT` (1200) in `@/constants/dimensions`
- Used by playground layout rail; product flush rail for authenticated chrome (`PrivateSidebar` stays in the product)

### Filter menu (`MyBottomSheet` mobile + `TriggerModal` desktop)

Product pattern for a list filter that renders as a real bottom sheet on mobile and a positioned popover on desktop, sharing one panel + one actions component. No generic playground demo (product-specific fields) — this documents the contract, not a concrete screen.

- **`XxxFilterPanel`**: pure form fields only — no internal `ScrollView`, no internal Clear/Apply row, no `showActions` prop. `MyBottomSheet` already wraps `children` in a scrollable area (default `useScrollView={true}`) and `TriggerModal`'s content area does the same for the desktop popover — do not add a second scroller or override `contentContainerStyle`/`useScrollView` inside the panel.
- **`XxxFilterActions`** (exported alongside the panel): pure button-row layout only — `flexDirection: 'row', alignItems: 'center', width: '100%', gap`. No border, no padding, no background. The same component renders inside two different footer slots (`MyBottomSheet`'s `footer` prop and `TriggerModal`'s `footer` prop), and both slots already own their own border/padding — giving the buttons row its own chrome too just stacks/doubles it.
- **Wiring**: always pass Clear/Apply through the `footer` prop — `<MyBottomSheet footer={<XxxFilterActions .../>}>…</MyBottomSheet>` and `<TriggerModal footer={filterFooter}>…</TriggerModal>` — never as a sibling child or nested inside the panel. `MyBottomSheet` renders `footer` **outside** the scrollable content so it stays pinned to the bottom; nesting it inside the scroll means it scrolls away and can clip or double-render.

Two gotchas are already handled centrally inside `MyBottomSheet` — do not re-solve them per feature:

- **Web horizontal padding**: `@expo/ui`'s web bottom-sheet polyfill (`vaul`) hard-codes `padding: '0 16px'` on its outer wrapper. `MyBottomSheet` counters this with `padding: 0` in `resolvedBackgroundStyle` so header/content/footer borders reach the true left/right edges.
- **Native bottom safe-area**: the native sheet (SwiftUI `.sheet` / Android `ModalBottomSheet`) already reserves safe-area space at the bottom by itself. `MyBottomSheet`'s own `footer` style only adds a small extra cushion on top (skipped entirely once the OS inset already covers it) — do not add another `insets.bottom` in a feature's `filterActions` style, it will double-count and the footer ends up with too much bottom padding.

### `Tab bar` (`useTabBar` / `TabBarButton`)

- Path: `@/components/ui/tabbar`
- Pill active state, theme tokens, dark-mode border/elevation overrides for RN `BottomTabBar`
- `useTabBar({ items, openDrawer?, mobileOnly? })` → `renderTabBar`, `screenOptions`, `tabScreens`
- Pass `items: TabBarNavItem[]` (`id`, `labelKey`, `icon`, `iconFocused?`)
- `mobileOnly: true` when desktop uses a sidebar instead of tabs
- `openDrawer` enables mobile header menu button
- Nested routes can hide the bar via pathname heuristics in `use-tab-bar` (e.g. create/edit screens)
- Sample wiring: `src/app/(public)/(tabs)/_layout.tsx`

### `MyTabSwitcher`

- Path: `@/components/ui/my-tab-switcher`
- In-page pill tab switcher with animated slide between panes (not a route-level tab bar — use `useTabBar` for that)
- Props: `tabs: MyTabItem<TId>[]` (`id`, `label`), `activeId`, `onChange`, `renderContent(id)`, `duration?` (default 220ms), `containerStyle?`, `tabBarStyle?`
- Direction-aware: slides content in from the side matching tab order (right tab → slides in from right)
- Generic over `TId extends string` — pass a union of tab ids for type-safe `activeId`/`onChange`
- Playground: `…/playground/my-tab-switcher.tsx`

### `WebsiteHeader`

- Path: `@/components/ui/website-header`
- Desktop page header: title, optional back, notifications + profile actions
- `right?` slot before notifications; `WebsiteHeaderNav` forwards stack `options.headerRight`
- Pair with `WebsiteHeaderNav` for stack header options; `useComingSoon` backs unwired actions
- Profile action: pass `profileMenuItems: ProfileMenuItem[]` (+ optional `avatarUri`) to render a `ProfileMenuButton` popover instead of the plain icon; omit both to keep the old `onProfilePress` icon-only behavior. Product-specific data (e.g. "what goes in the menu") stays in the product — don't hardwire a domain hook into this component.
- Playground: `…/playground/website-header.tsx`

### `PrivateStackHeader`

- Path: `@/components/ui/private-stack-header`
- Stack header that switches mobile `NavigationBarHeader` vs desktop `WebsiteHeaderNav`
- `usePrivateStackHeaders({ fallbackBackHref })` for list vs child screens + optional hamburger via `useOpenDrawer`
- Product wrappers (`PrivateDrawer` / `PrivateSidebar` with logo + nav) stay in the product

## List / async UI states

Wire in this order for list-first screens:

1. Initial load (no data yet) → `MySkeleton`
2. Fetch failed (no usable stale content) → `MyErrorState` + `onRetry`
3. Success but zero items → `MyEmptyState`
4. Success with items → list content (`MyList` + row UI)

Canonical reference: `todo-list.view.tsx` / `todo-list.container.tsx`.

### `MyList`

- Path: `@/components/ui/my-list`
- FlashList/FlatList wrapper with pull-to-refresh arc + optional scroll-to-hide binding (`useScrollToHideScrollBinding`)
- `PullToRefreshScrollView` — same refresh chrome for non-list `ScrollView` screens
- Playground: `…/playground/my-list`

### `ScrollToHide`

- Path: `@/components/ui/scroll-to-hide`
- Hide header/tab bar on scroll: `ScrollToHideProvider` + `ScrollToHideHeader` / `Footer`
- `useScrollToHideScrollBinding` — lists register without wrapping `ScrollToHideContent`
- `ScrollToHideInset` — animated padding when header/footer is `position: absolute`

### `MySkeleton`

- Path: `@/components/elements/my-skeleton`
- Props: `preset?: 'listRow' \| 'textBlock' \| 'card'` (default `listRow`), `count?` (default `1`), `isLoading?` (default `true`)
- Example: `<MySkeleton preset="listRow" count={6} />`
- Playground: `…/playground/skeleton.tsx`

### `LoadingPlaceholder`

- Path: `@/components/ui/loading-placeholder`
- Thin page/list loading wrap around `MySkeleton` (`preset`, `count`)
- Prefer over repeating skeleton layout in each feature screen

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

### `MyDropdownInput`

- Path: `@/components/elements/my-dropdown-input`
- Single/multi select; searchable list when options are long enough to scroll; Vietnamese-insensitive filter
- `searchable={false}` skips search; `preferSheet` forces a native bottom sheet (~50%); `preferFullscreen` always uses `NativeFullscreenModal` (iOS `pageSheet`, Android full window + status-bar padding) and wins over `preferSheet`
- Optional `imageUrl` on options shows a thumb in the list (`undefined` hides the column; `null` uses placeholder)
- Form adapter: `MyFormDropdown` (`pickerTitle` for sheet heading)
- Playground: `…/playground/dropdown.tsx`

### `MyButton`

- Path: `@/components/elements/my-button`
- `width?: number | 'auto' | 'full'`; `text` optional (icon/content-only); `textColor?` when enabled
- Alert/dialog footers: prefer `width="auto"` so two actions share content width (avoid `width="full"` / `flex:1` in auto-height columns)

### `ExpandableSearch`

- Path: `@/components/ui/expandable-search`
- Collapsed icon → animated expanded `MySearchInput`; controlled `expanded` / `onExpandedChange`
- Playground: `…/playground/expandable-search.tsx`

### `MyFormCheckbox`

- Path: `@/components/form` (or `@/components/form/adapters`)
- Bind via `name` like other `MyForm*` adapters; supports `MyCheckbox` `type` (`checkbox` / `radio`)
- Prefer over wiring `MyCheckbox` + RHF manually in new form screens
- Playground: form demo includes checkbox field (`…/playground/form.tsx`); element-only: `…/playground/checkbox.tsx`

## Keyboard avoiding (form scroll)

### `MyKeyboardAvoiding.ScrollView`

- Path: `@/components/ui/my-keyboard-avoiding`
- Wrap the **form field scroll** on native so the focused `MyTextInput` / `MyFormTextInput` stays above the software keyboard. Kit falls back to `ScrollView` on web.
- Canonical: login (`login-screen.container.tsx`), todo form. Playground: `…/playground/form.tsx`, `…/playground/text-input.tsx`.
- `KeyboardProvider` lives once in `src/app/_layout.tsx` — do not nest another provider in the screen.
- **Do not wrap:** header / chrome search (`ExpandableSearch`), list-toolbar `MySearchInput` at the top of a list (not covered by the keyboard).
- **Bottom sheet:** keep `useBottomSheetTextInput` on `MyTextInput`; do not replace the sheet scroller with `MyKeyboardAvoiding.ScrollView`.
- Sticky form footers stay **outside** the avoiding scroll. Horizontal table scrolls stay RN `ScrollView`.
- `KeyboardToolbar` (prev/next/done) MUST sit flush on the software keyboard. If the screen has a sticky footer, render `MyKeyboardAvoiding.Toolbar` as the **last child of the full-screen root** (sibling of footer) — not inside the field `ScrollView` (`showToolbar` only when that scroll already fills the window, e.g. login). Do **not** portal the toolbar.

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
- `pickImage` (library) / `pickImageFromCamera` (native camera) + `buildImageFormData` for the pick + multipart; `ImagePickerField` for dropzone UI (web drag-drop)
- Native (iOS/Android): tapping the field opens a `MyBottomSheet` to choose Take Photo vs Choose from Library, then routes through the same `onImagePicked`/`onPickError`/`pickOptions` props already used for web drag-drop — no extra wiring needed by feature callers. Web is unchanged (`onPick` opens the browser file picker directly, no camera option)
- `readOnly` — preview only (no pick, drop, or clear)
- `shape?: 'square' | 'circle'` — `square` (default) is a full-width rectangle (e.g. product photo); `circle` is a fixed-size (`AVATAR_PICKER_SIZE`, 140) centered avatar dropzone with an icon-only empty state (no title/hint — not enough room)
- Playground: `…/playground/image-picker.tsx`

### `MediaListRow`

- Path: `@/components/ui/media-list-row`
- Thumb + title + subtitle + optional trailing for list rows
- Playground: `…/playground/media-list-row.tsx`

### `MenuListCard`

- Path: `@/components/ui/menu-list-card`
- One or more icon + label + chevron rows grouped in a single card — settings/profile-style nav lists
- Props: `items: MenuListItem[]` (`key`, `icon`, `label`, `onPress`), optional `title?` (label above the card), `showChevron?` (default `true`)
- Playground: `…/playground/menu-list-card.tsx`

### `FloatingActionButton`

- Path: `@/components/ui/floating-action-button`
- Docked bottom-right `MyButton.Icon`; optional `bottomOffset` above tab bar
- Playground: `…/playground/floating-action-button.tsx`

### `FormFooterBar`

- Path: `@/components/ui/form-footer-bar`
- Sticky footer: actions left, optional amount (`FormFooterAmountBar`) right; mobile overflow via More sheet
- Wizard mode when `onNext` is passed (stacked amount + back/next)
- Playground: `…/playground/form-footer-bar.tsx`

### `OrderFormLineEditor`

- Path: `@/components/ui/order-form-line`
- Shared order line: product dropdown (+ thumb), unit (`searchable={false}` + `preferSheet`), qty, unit price, note, remove
- Bind `items.${index}.*` in `MyForm`; pass generic `products: { id, unit_id? }[]`
- Playground: `…/playground/order-form-line.tsx`

### `TableRowMoreMenu`

- Path: `@/components/ui/table-row-more-menu`
- Ellipsis trigger + `TriggerModal` panel of full-width `MyButton` actions
- Playground: `…/playground/table-row-more-menu.tsx`

### `ProfileMenuButton`

- Path: `@/components/ui/profile-menu-button`
- Avatar (falls back to a placeholder person icon when `avatarUri` is not set) trigger + `TriggerModal` panel of full-width `MyButton` actions — same shape as `TableRowMoreMenu` but sized/styled for a header avatar trigger
- Props: `items: ProfileMenuItem[]` (`key`, `text`, `icon`, `onPress`), `avatarUri?`, `accessibilityLabel`
- Used by `WebsiteHeader`'s `profileMenuItems` prop; can also be used standalone
- Playground: `…/playground/profile-menu-button.tsx`

### `HeroCarousel` / `HeroBackground`

- Path: `@/components/ui/carousel` (barrel), or `@/components/ui/carousel/hero-carousel` / `@/components/ui/carousel/hero-background` directly
- `HeroCarousel`: full-bleed hero content (title, subtitle, prev/next arrows, `CarouselDots`) over 4 feature-chip variants — `badge` (icon + label), `stat` (big number + label), `service` (title + subtitle), `process` (step + label). Props: `slides: HeroSlide[]`, `currentSlide`, `onSlideChange`, `onPrev`, `onNext`, `isMobileSize`. All colors come from `theme.getColor(...)` — no brand props to configure.
- `HeroBackground`: crossfades between `images: ImageSourcePropType[]` on `currentSlide` change using `expo-image`'s `transition` (no manual `Animated` composition). Renders behind `HeroCarousel` as a sibling — give the shared parent `position: 'relative'` and pass `style={StyleSheet.absoluteFill}` to `HeroBackground`.
- **Must mount above `AppInitGate`** if used on a web route that needs to be crawlable/indexed via static export — see `.docs/seo-standard.md`'s AppInitGate gotcha; this component itself has no such restriction, but anything it's composed into for a public marketing page does.
- Playground: `…/playground/hero-landing-kit.tsx`

### `TestimonialsCarousel`

- Path: `@/components/ui/carousel` (barrel), or `@/components/ui/carousel/testimonials-carousel` directly
- Single-card carousel: avatar (`MyImage`, remote URL) + quote + name + company, prev/next arrows, `CarouselDots`
- Props: `testimonials: Testimonial[]`, `title?`, `isMobileSize`. Guards empty arrays and clamps the active index if the list shrinks.
- Playground: `…/playground/hero-landing-kit.tsx`

### `CarouselDots`

- Path: `@/components/ui/carousel` (barrel), or `@/components/ui/carousel/carousel-dots` directly
- Row of pressable dot indicators; each dot owns its own stable `onPress` via `useCallback` (do not inline `onPress={() => onSelect(i)}` per dot elsewhere — that's exactly what this exists to avoid)
- Props: `count`, `activeIndex`, `onSelect`, optional `style` / `dotStyle` / `activeDotStyle` to override the theme-token default look
- Used internally by `HeroCarousel` and `TestimonialsCarousel`; also usable standalone for any other carousel
- Playground: `…/playground/hero-landing-kit.tsx`

### `FloatingContact`

- Path: `@/components/ui/floating-contact`
- Stack of floating action buttons (bottom-right, `position: fixed` on web) for contact channels (call/email/chat/...). One item may set `emphasized: true` for a bigger button with a pulsing ring (native-driver `Animated`, one instance per emphasized item).
- Props: `items: FloatingContactItem[]` (`key`, `icon`, `color`, `accessibilityLabel`, `onPress`, `emphasized?`), optional `style`
- Each item carries its own `onPress` — wire real actions (`Linking.openURL('tel:...')`, `mailto:`, chat deep link) at the call site; this component has no default behavior
- Playground: `…/playground/hero-landing-kit.tsx`

### Shared form hooks

- `useFormWizardSteps` (`src/hooks/use-form-wizard-steps.ts`) — create/edit step index + `trigger` per step
- `useFormEntityImage` (`src/hooks/use-form-entity-image.ts`) — pick / pending / upload / cache-bust display URL
- `useOrderListExport` (`src/hooks/use-order-list-export.ts`) — filtered PDF/Excel export with cap confirm
- `useDebouncedValue` (`src/hooks/commons-hooks.ts`)
- `useClientListPaging` (`src/hooks/use-client-list-paging.ts`) — web pages / mobile load-more over an in-memory list (default page size 10)
- Date/id filter helpers (`src/utils/list-filter.ts`) — month ranges, toggle ids, `toApiDateTimeRange`, `singleDropdownValue`

## Import cheat sheet

```ts
import MyCard from '@/components/elements/my-card'
import MyDivider from '@/components/elements/my-divider'
import MyEmptyState from '@/components/elements/my-empty-state'
import MyErrorState from '@/components/elements/my-error-state'
import MySearchInput from '@/components/elements/my-search-input'
import MySkeleton from '@/components/elements/my-skeleton'
import MyTag from '@/components/elements/my-tag'
import { MyFormCheckbox } from '@/components/form'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { ExpandableSearch } from '@/components/ui/expandable-search'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { ImagePickerField, pickImage, buildImageFormData } from '@/components/ui/image-picker'
import { ImagePreview } from '@/components/ui/image-preview'
import { ImageSlider } from '@/components/ui/image-slider'
import { MediaListRow } from '@/components/ui/media-list-row'
import { Pagination } from '@/components/ui/pagination'
import { Stepper } from '@/components/ui/stepper'
import { WebsiteHeader } from '@/components/ui/website-header'
import { FormFooterBar } from '@/components/ui/form-footer-bar'
import { OrderFormLineEditor } from '@/components/ui/order-form-line'
import { TableRowMoreMenu } from '@/components/ui/table-row-more-menu'
import { NativeFullscreenModal } from '@/components/ui/native-fullscreen-modal'
import DrawerMenu from '@/components/ui/drawer-menu'
import SideBar from '@/components/ui/side-bar'
import MyTabSwitcher from '@/components/ui/my-tab-switcher'
```

## Anti-patterns

- Blank list while loading or when empty
- Feature-local “EmptyView” / “ErrorBox” when these facades already cover the case
- New card StyleSheets for standard padded/elevated/pressable surfaces
- Importing `@expo/ui` from features (use branded facades only)
- Copying playground wrapper noise into production screens
