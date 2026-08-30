import { useCallback } from 'react'

import PrivateStackHeader from './private-stack-header'
import type { UsePrivateStackHeadersParams, UsePrivateStackHeadersResult } from './type'

export function usePrivateStackHeaders({
  fallbackBackHref,
  listFallbackBackHref,
}: UsePrivateStackHeadersParams): UsePrivateStackHeadersResult {
  const renderListHeader = useCallback(
    (props: Parameters<UsePrivateStackHeadersResult['renderListHeader']>[0]) => {
      return (
        <PrivateStackHeader
          {...props}
          hideBackButton={!listFallbackBackHref}
          fallbackBackHref={listFallbackBackHref}
          preferHistoryBack={Boolean(listFallbackBackHref)}
        />
      )
    },
    [listFallbackBackHref],
  )

  const renderChildHeader = useCallback(
    (props: Parameters<UsePrivateStackHeadersResult['renderChildHeader']>[0]) => {
      return <PrivateStackHeader {...props} fallbackBackHref={fallbackBackHref} />
    },
    [fallbackBackHref],
  )

  return { renderListHeader, renderChildHeader }
}
