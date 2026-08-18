import type { NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import { isNil } from 'lodash'

import {
  PULL_TO_REFRESH_ARC_EASE_EXPONENT,
  PULL_TO_REFRESH_ARC_MAX,
  PULL_TO_REFRESH_MAX_PULL_VISUAL_PX,
} from './constants'

export type UsePullToRefreshOptions = {
  onRefresh?: () => void | Promise<void>
  refreshing?: boolean
}

export type PullToRefreshScrollProps = {
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
  onScrollBeginDrag: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
  onScrollEndDrag: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
  scrollEventThrottle: number
}

export type PullToRefreshControlPropsBundle = Pick<
  RefreshControlProps,
  'refreshing' | 'onRefresh'
> &
  Partial<
    Pick<
      RefreshControlProps,
      'tintColor' | 'colors' | 'progressBackgroundColor' | 'progressViewOffset'
    >
  >

export type UsePullToRefreshResult = {
  refreshing: boolean
  refreshingForPullIndicator: boolean
  progress: SharedValue<number>
  pullDistance: SharedValue<number>
  scrollProps: PullToRefreshScrollProps
  refreshControlProps: PullToRefreshControlPropsBundle
  iosListTopInset: number
}

export function getPullRefreshArcPhase(
  pullDistance: number,
  triggerThreshold: number,
  maxVisualPull: number = PULL_TO_REFRESH_MAX_PULL_VISUAL_PX,
  easeExponent: number = PULL_TO_REFRESH_ARC_EASE_EXPONENT,
): number {
  const visualThreshold = Math.max(triggerThreshold, maxVisualPull)
  const rawPhase = Math.min(1, Math.max(0, pullDistance / visualThreshold))
  return rawPhase ** easeExponent
}

export function getPullRefreshArcProgress(
  pullDistance: number,
  triggerThreshold: number,
  maxVisualPull: number = PULL_TO_REFRESH_MAX_PULL_VISUAL_PX,
): number {
  return (
    getPullRefreshArcPhase(pullDistance, triggerThreshold, maxVisualPull) * PULL_TO_REFRESH_ARC_MAX
  )
}

export function getScrollOffsetY(e: unknown): number | undefined {
  if (isNil(e) || typeof e !== 'object') return undefined
  const ev = e as Record<string, unknown>
  const native = ev.nativeEvent as Record<string, unknown> | undefined
  const nested = native?.contentOffset as { y?: unknown } | undefined
  const yNested = nested?.y
  if (typeof yNested === 'number' && !Number.isNaN(yNested)) return yNested
  const flat = ev.contentOffset as { y?: unknown } | undefined
  const yFlat = flat?.y
  if (typeof yFlat === 'number' && !Number.isNaN(yFlat)) return yFlat
  return undefined
}
