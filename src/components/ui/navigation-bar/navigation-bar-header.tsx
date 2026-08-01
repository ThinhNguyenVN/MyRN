import React, { memo } from 'react'

import { router, useSegments } from 'expo-router'
import { useTranslation } from 'react-i18next'

import NavigationBar from './navigation-bar'
import type { NavigationBarHeaderProps } from './type'

const SEGMENT_TITLE_KEY: Record<string, string> = {
  index: 'tabs.home',
  explore: 'explore',
}

const normalizeTitle = (value: unknown): string => {
  if (Array.isArray(value)) return value.join(' ')
  return typeof value === 'string' ? value : ''
}

export interface NavigationBarHeaderExtraProps {
  hideBackButton?: boolean
}

const NavigationBarHeader: React.FC<NavigationBarHeaderProps & NavigationBarHeaderExtraProps> = ({
  navigation,
  options,
  hideBackButton = false,
}) => {
  const { t } = useTranslation()
  const segments = useSegments()
  const nav = navigation ?? { canGoBack: () => router.canGoBack(), goBack: () => router.back() }
  const currentSegment = segments[1]
  const defaultTitleKey =
    typeof currentSegment === 'string' ? (SEGMENT_TITLE_KEY[currentSegment] ?? '') : ''
  const translatedTitle = defaultTitleKey ? normalizeTitle(t(defaultTitleKey)) : ''
  const title = options?.title ?? translatedTitle
  const right = options?.headerRight?.({ canGoBack: nav.canGoBack() })
  const showBack = !hideBackButton && nav.canGoBack()

  return (
    <NavigationBar
      title={title}
      showBack={showBack}
      onBackPress={showBack ? nav.goBack : undefined}
      right={right}
    />
  )
}

export default memo(NavigationBarHeader)
