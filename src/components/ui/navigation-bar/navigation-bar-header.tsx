import React, { memo } from 'react'

import type { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { router, useSegments } from 'expo-router'

import NavigationBar from './navigation-bar'

const SEGMENT_TITLE: Record<string, string> = {
  index: 'Home',
  explore: 'Explore',
}

export interface NavigationBarHeaderExtraProps {
  hideBackButton?: boolean
}

const NavigationBarHeader: React.FC<NativeStackHeaderProps & NavigationBarHeaderExtraProps> = ({
  navigation,
  options,
  hideBackButton = false,
}) => {
  const segments = useSegments()
  const nav = navigation ?? { canGoBack: () => router.canGoBack(), goBack: () => router.back() }
  const title = options?.title ?? (segments.length >= 2 ? SEGMENT_TITLE[segments[1] as string] : '')
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
