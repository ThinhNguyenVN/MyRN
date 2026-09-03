import { router } from 'expo-router'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Confirmation } from '@/components/ui/confirmation'
import { Routes } from '@/constants/routes'
import { logoutThunk } from '@/features/auth/auth-thunks'
import { useAppDispatch } from '@/store/hooks'

import { HomeScreenView } from './home-screen.view'
import { useHomeScreen } from './use-home-screen'

export default function HomeScreenContainer() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { isAuthenticated, authSummary } = useHomeScreen()

  const handleLogout = useCallback(async () => {
    const ok = await Confirmation.confirm({
      message: t('home.confirmLogoutMessage'),
      description: t('home.confirmLogoutDescription'),
      type: 'warning',

      icon: 'log-out-outline',
      cancelText: t('common.cancel'),
      confirmText: t('home.confirmLogoutAction'),
    })
    if (!ok) return
    await dispatch(logoutThunk())
  }, [dispatch, t])

  const handleGoTodo = useCallback(() => router.push(Routes.todo), [])
  const handleLogin = useCallback(() => router.push(Routes.login), [])

  return (
    <HomeScreenView
      isAuthenticated={isAuthenticated}
      authSummary={authSummary}
      onGoTodo={handleGoTodo}
      onLogout={handleLogout}
      onLogin={handleLogin}
    />
  )
}
