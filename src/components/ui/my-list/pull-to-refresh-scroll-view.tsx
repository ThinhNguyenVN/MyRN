import { memo, useCallback, useMemo, useRef } from 'react'
import {
  RefreshControl,
  ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
} from 'react-native'
import Animated from 'react-native-reanimated'

import MyView from '@/components/elements/my-view'
import { isWeb } from '@/constants/dimensions'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'
import { useScrollToHideScrollBinding } from '@/components/ui/scroll-to-hide'
import { useThemedStyles } from '@/theme/theme-context'

import { PULL_TO_REFRESH_OVERSCROLL_THRESHOLD } from './constants'
import { RefreshIndicator } from './refresh-indicator'
import { generateStyles } from './styles'
import { usePullToRefresh } from './use-pull-to-refresh'

export type PullToRefreshScrollViewProps = ScrollViewProps & {
  refreshing?: boolean
  onRefresh?: () => void | Promise<void>
  /** Mobile-only scroll-to-hide for tab bar chrome. Default true. */
  enableScrollToHide?: boolean
}

function PullToRefreshScrollViewInner({
  refreshing,
  onRefresh,
  children,
  refreshControl: refreshControlProp,
  enableScrollToHide = true,
  onScroll: userOnScroll,
  onScrollBeginDrag: userOnScrollBeginDrag,
  onScrollEndDrag: userOnScrollEndDrag,
  scrollEventThrottle = 16,
  ...rest
}: PullToRefreshScrollViewProps) {
  const styles = useThemedStyles(generateStyles)
  const isMobileSize = useIsMobileSize()
  const hasPullToRefresh = Boolean(onRefresh)

  const pullToRefresh = usePullToRefresh({
    onRefresh: hasPullToRefresh ? onRefresh : undefined,
    refreshing: hasPullToRefresh ? refreshing : undefined,
  })

  const pullScrollRef = useRef(pullToRefresh.scrollProps)
  pullScrollRef.current = pullToRefresh.scrollProps

  const chainOnScroll = useCallback(
    (event: unknown) => {
      if (hasPullToRefresh) {
        pullScrollRef.current.onScroll?.(event as NativeSyntheticEvent<NativeScrollEvent>)
      }
      userOnScroll?.(event as Parameters<NonNullable<ScrollViewProps['onScroll']>>[0])
    },
    [hasPullToRefresh, userOnScroll],
  )

  const chainOnScrollBeginDrag = useCallback(
    (event: unknown) => {
      if (hasPullToRefresh) {
        pullScrollRef.current.onScrollBeginDrag?.(event as NativeSyntheticEvent<NativeScrollEvent>)
      }
      userOnScrollBeginDrag?.(
        event as Parameters<NonNullable<ScrollViewProps['onScrollBeginDrag']>>[0],
      )
    },
    [hasPullToRefresh, userOnScrollBeginDrag],
  )

  const chainOnScrollEndDrag = useCallback(
    (event: unknown) => {
      if (hasPullToRefresh) {
        pullScrollRef.current.onScrollEndDrag?.(event as NativeSyntheticEvent<NativeScrollEvent>)
      }
      userOnScrollEndDrag?.(event as Parameters<NonNullable<ScrollViewProps['onScrollEndDrag']>>[0])
    },
    [hasPullToRefresh, userOnScrollEndDrag],
  )

  const listScrollThrottle = hasPullToRefresh
    ? pullScrollRef.current.scrollEventThrottle
    : scrollEventThrottle

  const scrollBinding = useScrollToHideScrollBinding({
    enabled: enableScrollToHide && isMobileSize && !isWeb,
    onScroll: chainOnScroll,
    onScrollBeginDrag: chainOnScrollBeginDrag,
    onScrollEndDrag: chainOnScrollEndDrag,
    scrollEventThrottle: listScrollThrottle,
  })

  const refreshControl = useMemo(() => {
    if (refreshControlProp) {
      return refreshControlProp
    }
    if (!hasPullToRefresh || isWeb) {
      return undefined
    }
    return <RefreshControl {...pullToRefresh.refreshControlProps} />
  }, [hasPullToRefresh, pullToRefresh.refreshControlProps, refreshControlProp])

  const Scroll = scrollBinding.isActive ? Animated.ScrollView : ScrollView

  return (
    <MyView style={styles.flex}>
      <Scroll
        {...rest}
        refreshControl={refreshControl}
        onScroll={scrollBinding.onScroll}
        onScrollBeginDrag={scrollBinding.onScrollBeginDrag}
        onScrollEndDrag={scrollBinding.onScrollEndDrag}
        scrollEventThrottle={scrollBinding.scrollEventThrottle}
      >
        {children}
      </Scroll>
      {hasPullToRefresh ? (
        <RefreshIndicator
          pullDistance={pullToRefresh.pullDistance}
          refreshing={pullToRefresh.refreshing}
          threshold={PULL_TO_REFRESH_OVERSCROLL_THRESHOLD}
          fixedLayoutSlotHeight={
            pullToRefresh.iosListTopInset > 0 ? pullToRefresh.iosListTopInset : undefined
          }
        />
      ) : null}
    </MyView>
  )
}

export const PullToRefreshScrollView = memo(PullToRefreshScrollViewInner)
