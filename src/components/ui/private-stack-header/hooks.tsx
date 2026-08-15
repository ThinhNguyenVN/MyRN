import { useCallback } from 'react'
import { isNil } from 'lodash'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import { useOpenDrawer } from '@/components/ui/drawer-menu'
import type { NavigationBarHeaderProps } from '@/components/ui/navigation-bar/type'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'

import PrivateStackHeader from './private-stack-header'
import type { UsePrivateStackHeadersParams, UsePrivateStackHeadersResult } from './type'

export function usePrivateStackHeaders({
  fallbackBackHref,
}: UsePrivateStackHeadersParams): UsePrivateStackHeadersResult {
  const { t } = useTranslation()
  const openDrawer = useOpenDrawer()
  const isMobileSize = useIsMobileSize()

  const renderListMenu = useCallback(() => {
    if (!isMobileSize || isNil(openDrawer)) {
      return null
    }
    return (
      <MyButton.Icon
        icon="menu"
        type="light"
        size="small"
        onPress={openDrawer}
        accessibilityLabel={t('components.drawerOpen')}
      />
    )
  }, [isMobileSize, openDrawer, t])

  const renderListHeader = useCallback((props: NavigationBarHeaderProps) => {
    return <PrivateStackHeader {...props} hideBackButton />
  }, [])

  const renderChildHeader = useCallback(
    (props: NavigationBarHeaderProps) => {
      return <PrivateStackHeader {...props} fallbackBackHref={fallbackBackHref} />
    },
    [fallbackBackHref],
  )

  return { renderListMenu, renderListHeader, renderChildHeader }
}
