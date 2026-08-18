import React, { cloneElement, isValidElement } from 'react'

import type { ScrollToHideContentProps } from './types'
import { useScrollToHideScrollBinding } from './hooks'
import { ScrollToHideInset } from './scroll-to-hide-inset'

export function ScrollToHideContent({
  children,
  scrollEventThrottle = 16,
}: ScrollToHideContentProps) {
  const childOnScroll = isValidElement(children)
    ? (children as React.ReactElement<{ onScroll?: (event: unknown) => void }>).props?.onScroll
    : undefined

  const scrollBinding = useScrollToHideScrollBinding({
    enabled: true,
    onScroll: childOnScroll,
    scrollEventThrottle,
  })

  if (!scrollBinding.isActive || !isValidElement(children)) {
    return <>{children}</>
  }

  return (
    <ScrollToHideInset>
      {cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        onScroll: scrollBinding.onScroll,
        scrollEventThrottle: scrollBinding.scrollEventThrottle,
      })}
    </ScrollToHideInset>
  )
}
