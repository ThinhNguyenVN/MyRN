import React, { memo, useCallback } from 'react'
import { router } from 'expo-router'

import WebsiteHeader from './website-header'
import type { WebsiteHeaderNavExtraProps, WebsiteHeaderNavProps } from './type'

/** True when THIS stack has a screen under the current one (ignore parent tab history). */
function canPopWithinStack(navigation?: WebsiteHeaderNavProps['navigation']): boolean {
  const state = navigation?.getState?.()
  if (state && typeof state.index === 'number') {
    return state.index > 0
  }
  return false
}

/**
 * Stack `header` adapter for desktop private pages.
 * Renders {@link WebsiteHeader} with title/back from React Navigation options.
 */
const WebsiteHeaderNav: React.FC<WebsiteHeaderNavProps & WebsiteHeaderNavExtraProps> = ({
  navigation,
  options,
  hideBackButton = false,
  fallbackBackHref,
}) => {
  const title = typeof options?.title === 'string' ? options.title : ''
  const stackCanGoBack = canPopWithinStack(navigation)
  const canGoBack = stackCanGoBack || Boolean(fallbackBackHref) || router.canGoBack()
  const showBack = !hideBackButton && canGoBack

  const handleBack = useCallback(() => {
    if (stackCanGoBack && navigation) {
      navigation.goBack()
      return
    }
    if (router.canGoBack()) {
      router.back()
      return
    }
    if (fallbackBackHref) {
      router.navigate(fallbackBackHref)
    }
  }, [fallbackBackHref, navigation, stackCanGoBack])

  const right = options?.headerRight?.({ canGoBack })

  return (
    <WebsiteHeader
      title={title}
      showBack={showBack}
      onBackPress={showBack ? handleBack : undefined}
      right={right}
    />
  )
}

export default memo(WebsiteHeaderNav)
