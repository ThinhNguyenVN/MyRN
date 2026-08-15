import React, { memo, useCallback } from 'react'

import { router, useSegments } from 'expo-router'
import { useTranslation } from 'react-i18next'

import NavigationBar from './navigation-bar'
import type { NavigationBarHeaderExtraProps, NavigationBarHeaderProps } from './type'

const SEGMENT_TITLE_KEY: Record<string, string> = {
  index: 'tabs.home',
  explore: 'explore',
}

const normalizeTitle = (value: unknown): string => {
  if (Array.isArray(value)) return value.join(' ')
  return typeof value === 'string' ? value : ''
}

/** True when THIS stack has a screen under the current one (ignore parent tab history). */
function canPopWithinStack(navigation?: NavigationBarHeaderProps['navigation']): boolean {
  const state = navigation?.getState?.()
  if (state && typeof state.index === 'number') {
    return state.index > 0
  }
  return false
}

const NavigationBarHeader: React.FC<NavigationBarHeaderProps & NavigationBarHeaderExtraProps> = ({
  navigation,
  options,
  hideBackButton = false,
  fallbackBackHref,
}) => {
  const { t } = useTranslation()
  const segments = useSegments()
  const currentSegment = segments[1]
  const defaultTitleKey =
    typeof currentSegment === 'string' ? (SEGMENT_TITLE_KEY[currentSegment] ?? '') : ''
  const translatedTitle = defaultTitleKey ? normalizeTitle(t(defaultTitleKey)) : ''
  const title = options?.title ?? translatedTitle

  const stackCanGoBack = canPopWithinStack(navigation)
  const canGoBackForSlots = stackCanGoBack || Boolean(fallbackBackHref) || router.canGoBack()

  const handleBack = useCallback(() => {
    // 1) Pop within this nested stack only (avoids jumping to previous tab on web).
    if (stackCanGoBack && navigation) {
      navigation.goBack()
      return
    }
    // 2) Feature fallback (e.g. products list) when stack has no parent screen.
    if (fallbackBackHref) {
      router.navigate(fallbackBackHref)
      return
    }
    // 3) Last resort — root history (may leave the current tab).
    if (router.canGoBack()) {
      router.back()
    }
  }, [fallbackBackHref, navigation, stackCanGoBack])

  const left = options?.headerLeft?.({ canGoBack: canGoBackForSlots })
  const right = options?.headerRight?.({ canGoBack: canGoBackForSlots })
  const showBack = !left && !hideBackButton && canGoBackForSlots

  return (
    <NavigationBar
      title={title}
      left={left}
      showBack={showBack}
      onBackPress={showBack ? handleBack : undefined}
      right={right}
    />
  )
}

export default memo(NavigationBarHeader)
