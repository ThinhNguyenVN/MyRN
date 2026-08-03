# Platform capability specs (OpenSpec)

These folders under `openspec/specs/` are **shipped platform constraints** for this template. They are **not** a product backlog and **not** a list of features to rebuild when starting a new product.

For product work, prefer:

1. `.docs/product-kickoff.md`
2. `.docs/` conventions (`shared-ui-catalog.md`, `screen-standard.md`, `data-state-standard.md`, …)
3. Product scope files under `specs/<name>.spec.md`

Only open a capability here when you are **changing that capability** (e.g. editing bottom sheet engine, date picker, or kit APIs).

## Index

| Capability | Meaning for product AI |
|------------|------------------------|
| `expo-sdk-57-runtime` | App targets Expo SDK 57 — do not downgrade casually |
| `expo-router-navigation-imports` | Navigation import conventions for Expo Router |
| `expo-ui-system-presentation` | Hybrid UI: brand `My*` stay custom; Expo UI only behind sheet/wheel facades |
| `my-bottom-sheet-expo-ui` | Use `MyBottomSheet` facade; features must not import `@expo/ui` |
| `branded-date-picker` | Date = branded calendar (not Expo DateTimePicker) |
| `expo-ui-wheel-picker-engine` | Wheel = Expo UI on iOS behind facade; Android/web keep existing wheel |
| `layout-surface-primitives` | `MyDivider` / `MyCard` exist — see `.docs/shared-ui-catalog.md` |
| `list-async-ui-states` | `MySkeleton` / `MyEmptyState` / `MyErrorState` — see catalog + todo list |
| `my-search-input` | `MySearchInput` preset |
| `my-form-checkbox` | `MyFormCheckbox` adapter |
| `product-ui-kit-test-coverage` | Kit QA expectations (tests/smoke) — process, not a product screen |
| `picker-facade-test-coverage` | Picker helper test/smoke expectations — process, not a product screen |

Active work lives in `openspec/changes/<name>/`. Completed work is under `openspec/changes/archive/`.
