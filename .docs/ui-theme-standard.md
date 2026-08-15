# UI, component, and theme standard

This file defines how production features should compose UI in this codebase.

## Core rules

- Prefer shared components before creating new ones.
- Use `auth` and `todo` as the production-quality references.
- Use `playground` to learn component behavior, not feature structure.
- Do not hardcode design values in feature code when a theme token already exists.
- If the design does not specify a behavior detail, follow `.docs/default-behavior-rules.md` before inventing a new UI behavior.

## Shared component layers

### `src/components/elements`

Use `elements` for reusable primitives and controls.

Typical examples:

- `MyText`
- `MyView`
- `MyButton`
- `MyIcon`
- `MyTextInput`
- `MySwitch`
- `MyCard`, `MyDivider`, `MySearchInput`
- `MyEmptyState`, `MyErrorState`, `MySkeleton`

Use an existing element before creating a local wrapper in a feature.
For product wiring (when to use which kit piece), see `shared-ui-catalog.md`.

### `src/components/form`

Use `form` for `react-hook-form` integration.

Examples:

- `MyForm`
- `MyFormTextInput`
- `MyFormSwitch`
- `MyFormCheckbox`
- other `MyForm*` adapters

For production forms, prefer `MyForm*` adapters over wiring low-level fields manually.

### `src/components/ui`

Use `ui` for shared composite behavior and cross-feature patterns.

Examples:

- `MyList`
- `NavigationBarHeader`
- `Confirmation`
- `Toast`
- `SwipeableItem`
- `MyKeyboardAvoiding`
- `ScrollToHide`
- `ImageSlider`, `ImagePreview`

If a behavior is likely to be reused across screens or features, it belongs here instead of inside a single feature.

## Brand primitives vs system presentation

This project uses a **hybrid** UI strategy:

| Bucket | Examples | Approach |
|--------|----------|----------|
| Brand primitives | `MyButton`, `MyText`, `MyChip`, `MyPressable`, text-input skin, `MyCard`, `MyDivider`, `MySearchInput`, `MyEmptyState`, `MyErrorState`, `MySkeleton` | Keep token-driven `My*` — do **not** replace with Expo UI / SwiftUI / Compose by default |
| System presentation | Bottom sheet (`MyBottomSheet`); wheel (`MyWheelPicker` on iOS) | Expo UI as the **engine** behind the facade; features never import `@expo/ui` directly. Date pickers stay branded custom calendar. |

Rules:

- Do **not** use Expo UI to replace `MyButton` / `MyText` / other brand primitives in production features.
- Bottom sheet call sites go through `MyBottomSheet` (and re-exported helpers like `BottomSheetView` / `BottomSheetTextInput` from `@/components/elements/my-bottom-sheet`).
- Mobile width uses the Expo UI sheet engine; desktop / wide layout may still use branded RN `Modal` / `TriggerModal` where that is the existing pattern.
- **Date:** branded custom calendar for single + range (shared month/year header + dual-wheel).
- **Wheel:** Expo UI Picker wheel on iOS; Android/web keep `WheelPickerView`.

## What to use by default

### Text

- Use `MyText` for app text.
- Choose typography from the shared scale.
- Choose text color from semantic tokens.

Do not use raw `Text` directly in normal feature code unless there is a very specific technical reason.

### Container and layout

- Use `MyView` when the container needs theme-aware background, radius, elevation, or container props.
- Raw `View` is allowed for very simple local wrappers.

Allowed `View` examples:

- a thin grouping wrapper inside one screen
- a simple row or column with one local style
- layout glue that does not need theme behavior

Prefer `MyView` when any of these are true:

- background color comes from theme
- radius or elevation is needed
- shared spacing or container props make the code clearer

### Buttons and pressables

- Use `MyButton` and `MyButton.Icon` for actions.
- Use `MyPressable` only when you need a custom pressable surface pattern that `MyButton` does not cover.

Do not create ad-hoc button styles in production screens when a shared button variant is already sufficient.

### Lists

- Prefer `MyList` for scrollable production lists.
- Do not use raw `FlatList` or `FlashList` directly in feature screens unless the shared list cannot support the use case.
- List async UI (required defaults when design is silent):
  1. initial load → `MySkeleton` (`preset="listRow"` + `count` as needed)
  2. fetch error without usable stale data → `MyErrorState` + `onRetry`
  3. empty success → `MyEmptyState`
- Prefer `MyCard` for list/settings row surfaces instead of one-off card StyleSheets.
- Use `MyDivider` for section separators and `MySearchInput` for search fields.
- Forms: use `MyFormCheckbox` for checkbox/radio fields bound to `MyForm` (alongside other `MyForm*` adapters).
- Form field scroll on native: `MyKeyboardAvoiding.ScrollView`. Do not wrap header search. Sheet inputs: `useBottomSheetTextInput`.
- Full props, playground routes, and import paths: `shared-ui-catalog.md`.
- Canonical list wiring: `src/features/todo/screens/todo-list.view.tsx`.

### Media

- Carousel: `ImageSlider`.
- Fullscreen gallery: `ImagePreview` (pager slide + zoom). Do not use `MyImage` inside fullscreen preview — it forces square aspect; preview uses `expo-image` contain.

### Header and global feedback

- Use `NavigationBarHeader` for stack headers.
- Use `Confirmation` and `Toast` for shared feedback flows.

Do not create feature-local confirm modals or duplicate toast systems.

## Theme and token rules

### Color

Use semantic tokens through theme helpers and shared components.

Examples:

- `text/active/primary`
- `text/active/secondary`
- `fill/background/primary`
- `fill/background/secondary`

Rules:

- Do not hardcode colors in production features.
- Brand and semantic meaning should come from theme tokens, not raw hex values.
- If a needed semantic token does not exist, add it in the theme layer instead of hardcoding in a screen.

### Spacing

Use the spacing scale:

- `x1`
- `x2`
- `x3`
- `x4`
- `x6`
- `x8`
- `x10`

Rules:

- Prefer `getSpacing(...)` inside `generateStyles(theme)`.
- Do not invent arbitrary spacing values in feature styles unless the use case is exceptional.

### Typography

Use the shared typography presets:

- `h1` to `h6`
- `subtitle`
- `body`
- `label`
- `caption`
- `button`

Rules:

- Prefer typography presets over custom font size and line height in screen code.
- If a new text style is needed broadly, add it to the shared typography scale instead of redefining it per screen.

### Radius and elevation

- Use shared radius tokens.
- Use shared elevation tokens when a surface needs shadow treatment.

Do not create one-off shadow recipes in feature code when the theme already has elevation support.

## Styling pattern

Production screens should follow this pattern:

- create `generateStyles(theme)`
- consume with `useThemedStyles(generateStyles)`
- keep most styling in `styles.ts`

Rules:

- Inline style is allowed only for tiny, non-reused adjustments.
- Repeated style objects should move to `styles.ts`.
- Theme-derived styles should not be scattered across the screen body.

## Large visual redesign rule

When a new design is visually very different from the current app, keep the architecture stable but allow the visual system to change.

Core principle:

- architecture is stable
- the visual system is replaceable

Rules:

- Do not force a radically new design into old shared UI shapes if that would produce obviously incorrect UI.
- Do not solve a broad redesign by stacking screen-local overrides on top of outdated shared components.
- If the same visual change appears across multiple screens, prefer updating shared tokens, shared elements, or shared composite UI instead of patching each screen separately.
- If the difference is isolated to one screen or one domain-specific block, a local override is acceptable.
- If the redesign affects app shell patterns such as headers, tabs, filters, sheets, or common cards/inputs/buttons, treat it as a shared-layer change first.
- For a large redesign, start with a scope-lock pass before implementation so the work is split into shell changes, shared UI/theme changes, and feature-specific changes.

Practical decision rule:

- repeated change across many screens -> refactor shared layer
- isolated change in one flow -> keep it local unless reuse becomes clear
- shell-level visual change -> update shell/shared UI, not just feature styles

During redesign work:

- preserve project architecture first
- preserve required behavior second
- create a new consistent shared visual language third
- match final visual fidelity fourth

## `playground` policy

`playground` remains part of this codebase because it helps developers and AI discover how shared components behave.

However:

- do not treat `playground` folder structure as a production reference
- do not copy its use of extra wrappers or loose style patterns into new features
- use it only to learn available props, behaviors, and visual patterns

## Review checklist

- Did the screen use shared components before adding new wrappers?
- Is `MyText` used for app text?
- Is raw `View` only used for simple local layout?
- Are lists built with `MyList` by default?
- Did list/async screens use `MySkeleton` / `MyEmptyState` / `MyErrorState` instead of ad-hoc blanks?
- Did row/settings surfaces prefer `MyCard` / `MyDivider` / `MySearchInput` where they fit?
- Are colors, spacing, typography, radius, and elevation coming from shared theme/tokens?
- Is `playground` treated only as a component catalog, not as a production structure reference?
- Was `shared-ui-catalog.md` consulted before inventing a new empty/error/card/search pattern?
