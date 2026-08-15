import { memo } from 'react'

import { NavigationBarHeader } from '@/components/ui/navigation-bar'
import { WebsiteHeaderNav } from '@/components/ui/website-header'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'

import type { PrivateStackHeaderProps } from './type'

/**
 * Stack `header` for private feature stacks: mobile nav bar vs desktop website header.
 */
function PrivateStackHeader({
  hideBackButton = false,
  fallbackBackHref,
  ...props
}: PrivateStackHeaderProps) {
  const isMobileSize = useIsMobileSize()

  if (isMobileSize) {
    return (
      <NavigationBarHeader
        {...props}
        hideBackButton={hideBackButton}
        fallbackBackHref={fallbackBackHref}
      />
    )
  }

  return (
    <WebsiteHeaderNav
      {...props}
      hideBackButton={hideBackButton}
      fallbackBackHref={fallbackBackHref}
    />
  )
}

export default memo(PrivateStackHeader)
