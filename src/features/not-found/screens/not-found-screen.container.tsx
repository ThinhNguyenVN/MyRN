import { usePathname, useRouter } from 'expo-router'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Routes } from '@/constants/routes'
import { selectIsAuthenticated } from '@/features/auth/auth-slice'
import { useAppSelector } from '@/store/hooks'

import { NotFoundScreenView } from './not-found-screen.view'

/**
 * Root `+not-found` route. It must live under `src/app` so unmatched web URLs render inside the
 * root layout; expo-router's built-in fallback renders outside it and breaks hydration (React #418)
 * when Caddy serves `index.html` for an unknown path.
 */
export default function NotFoundScreenContainer() {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const handlePrimaryActionPress = useCallback(() => {
    router.replace(isAuthenticated ? Routes.defaultRoute : Routes.login)
  }, [isAuthenticated, router])

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  return (
    <NotFoundScreenView
      pathname={pathname}
      primaryActionLabel={isAuthenticated ? t('notFound.goHome') : t('notFound.goLogin')}
      onPrimaryActionPress={handlePrimaryActionPress}
      canGoBack={router.canGoBack()}
      onBackPress={handleBackPress}
    />
  )
}
