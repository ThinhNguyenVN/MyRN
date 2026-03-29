import { FadeInRight, FadeOutLeft } from 'react-native-reanimated'

import { BUTTON_SMALL_HEIGHT } from '@/components/elements/my-button/styles'

/** Cell list enter / exit + snap timing (ms). */
export const SWIPEABLE_ITEM_ROW_ENTER_MS = 260
export const SWIPEABLE_ITEM_ROW_EXIT_MS = 200
export const SWIPEABLE_ITEM_ROW_ENTERING = FadeInRight.duration(SWIPEABLE_ITEM_ROW_ENTER_MS)
export const SWIPEABLE_ITEM_ROW_EXITING = FadeOutLeft.duration(SWIPEABLE_ITEM_ROW_EXIT_MS)

/** Khoảng cách giữa các nút action dưới nền. */
export const ACTION_GAP = 8

/** Padding ngang strip (khớp stagger scale). */
export const UNDERLAY_PADDING_X = 10

export const COMMIT_EXTRA = 52
export const PREVIEW_FRAC = 0.42
/** Snap open/đóng sau thả tay — khớp tốc độ enter row. */
export const SETTLE_DURATION_MS = SWIPEABLE_ITEM_ROW_ENTER_MS

/** Bay khỏi màn khi commit xóa. */
export const DELETE_SLIDE_MS = 340
export const DELETE_UNDERLAY_FADE_MS = 120
export const VEL_DELETE = 720
export const MIN_QUICK = 40

/** Vuốt nhanh vẫn xóa được khi đã mở menu một phần (tránh chỉ snap về -rsw). */
export const VELOCITY_MENU_LEEWAY_FRAC = 0.35

export const OPEN_FRACTION = 0.4
export const SCALE_MIN = 0.38
export const SCALE_RANGE = 0.62

/** Một “ô” icon: nút + khoảng cách tới nút kế. */
export const SLOT_STEP = BUTTON_SMALL_HEIGHT + ACTION_GAP
