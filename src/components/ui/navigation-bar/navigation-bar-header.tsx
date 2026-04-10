import React, { memo } from 'react'

import type { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { router, useSegments } from 'expo-router'
import { useTranslation } from 'react-i18next'

import NavigationBar from './navigation-bar'

const SEGMENT_TITLE_KEY: Record<string, string> = {
  index: 'tabs.home',
  explore: 'explore',
}

export interface NavigationBarHeaderExtraProps {
  hideBackButton?: boolean
}

const NavigationBarHeader: React.FC<NativeStackHeaderProps & NavigationBarHeaderExtraProps> = ({
  navigation,
  options,
  hideBackButton = false,
}) => {
  const { t } = useTranslation()
  const segments = useSegments()
  const nav = navigation ?? { canGoBack: () => router.canGoBack(), goBack: () => router.back() }
  const defaultTitleKey = segments.length >= 2 ? SEGMENT_TITLE_KEY[segments[1] as string] : ''
  const title = options?.title ?? (defaultTitleKey ? t(defaultTitleKey) : '')
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
