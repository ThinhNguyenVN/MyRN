import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useGetMeQuery } from '@/features/auth/auth-api'
import { selectIsAuthenticated } from '@/features/auth/auth-slice'
import { useAppSelector } from '@/store/hooks'

export function useHomeScreen() {
  const { t } = useTranslation()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const { data: meData, isFetching: isFetchingMe } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  })

  const authSummary = useMemo(() => {
    if (!isAuthenticated) {
      return t('home.authNotLoggedIn')
    }
    if (isFetchingMe && !meData) {
      return t('home.authLoadingUser')
    }
    if (!meData) {
      return t('home.authMissingUser')
    }
    return `${meData.firstName} ${meData.lastName} · @${meData.username}`
  }, [isAuthenticated, isFetchingMe, meData, t])

  return { isAuthenticated, authSummary }
}
