import type { ViewStyle } from 'react-native'

import { STEP_CIRCLE_RADIUS, STEP_NODE_SIZE, STEP_TRACK_HEIGHT } from './constants'

export function connectorFrame(
  rowWidth: number,
  stepCount: number,
  segmentIndex: number,
): ViewStyle | null {
  if (rowWidth <= 0 || stepCount < 2) {
    return null
  }
  const columnWidth = rowWidth / stepCount
  const left = columnWidth * segmentIndex + columnWidth / 2 + STEP_CIRCLE_RADIUS
  const width = columnWidth - STEP_CIRCLE_RADIUS * 2
  if (width <= 0) {
    return null
  }
  return {
    left,
    width,
    top: (STEP_NODE_SIZE - STEP_TRACK_HEIGHT) / 2,
  }
}
