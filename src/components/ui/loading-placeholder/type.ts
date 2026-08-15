import type { StyleProp, ViewStyle } from 'react-native'

import type { MySkeletonPreset } from '@/components/elements/my-skeleton'

export type LoadingPlaceholderProps = {
  /** @default 3 */
  count?: number
  /** @default 'listRow' */
  preset?: MySkeletonPreset
  style?: StyleProp<ViewStyle>
}
