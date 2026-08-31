import { ViewStyle } from 'react-native'

/**
 * Style được support cho MySurface
 * - Layout cơ bản
 * - Không bao gồm background / shadow
 * - Không có `borderRadius`: dùng prop `radius` (token) — `style.borderRadius` từng được
 *   khai báo ở đây nhưng chưa bao giờ được `splitSurfaceStyle`/`index.tsx` đọc, nên bị bỏ
 *   qua âm thầm.
 */
export type SurfaceStyle = Pick<
  ViewStyle,
  // --- Layout / positioning ---
  | 'margin'
  | 'marginTop'
  | 'marginBottom'
  | 'marginLeft'
  | 'marginRight'
  | 'marginHorizontal'
  | 'marginVertical'
  | 'position'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'zIndex'
  | 'alignSelf'
  | 'backgroundColor'
  | 'gap'
  // --- Size ---
  | 'width'
  | 'height'
  | 'minWidth'
  | 'minHeight'
  | 'maxWidth'
  | 'maxHeight'
  | 'aspectRatio'

  // --- Flex (basic) ---
  | 'flex'
  | 'flexGrow'
  | 'flexShrink'
  | 'flexBasis'

  // --- Content layout (basic) ---
  | 'padding'
  | 'paddingTop'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'paddingRight'
  | 'paddingHorizontal'
  | 'paddingVertical'
  | 'justifyContent'
  | 'alignItems'
  | 'flexDirection'

  // --- Border ---
  | 'borderWidth'
  | 'borderColor'
  | 'borderStyle'

  // --- Misc safe ---
  | 'opacity'
  | 'transform'
  | 'overflow'
>

export const CONTAINER_STYLE_KEYS: (keyof SurfaceStyle)[] = [
  // layout / positioning
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'zIndex',
  'alignSelf',

  // size
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'aspectRatio',

  // flex (outer)
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',

  // misc
  'opacity',
  'transform',
]

export const CONTENT_STYLE_KEYS: (keyof SurfaceStyle)[] = [
  // padding
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingHorizontal',
  'paddingVertical',
  'gap',

  // basic flex layout
  'flexDirection',
  'justifyContent',
  'alignItems',

  // overflow (for content clipping when elevation - keep on inner, not outer)
  'overflow',
]
