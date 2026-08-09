# drawer-menu

Edge drawer panel (slide + backdrop) for hamburger / secondary nav.

## Requirements

### Requirement: DrawerMenu slides from a configurable edge
`DrawerMenu` MUST support `side?: 'left' | 'right'` (default `left`). Open MUST slide the panel in from that edge; close MUST slide out to the same edge with backdrop fade.

#### Scenario: Open from left
- **WHEN** `visible` becomes true with `side="left"` (or default)
- **THEN** panel MUST appear anchored to the left and animate in from off-screen left

#### Scenario: Open from right
- **WHEN** `visible` becomes true with `side="right"`
- **THEN** panel MUST appear anchored to the right and animate in from off-screen right

### Requirement: DrawerMenu accepts data-driven items
`DrawerMenu` MUST render `data: { id, label, icon? }[]` and MUST call `onSelected(item, index)` when an item is pressed.

#### Scenario: Select item
- **WHEN** user presses a row
- **THEN** `onSelected` MUST fire with that item

### Requirement: Playground demo covers left and right
Playground MUST expose demos that open the drawer from both left and right.

#### Scenario: Playground open buttons
- **WHEN** user opens Playground → Drawer Menu and taps open left / open right
- **THEN** the matching edge drawer MUST open and close via backdrop, close button, or item select
