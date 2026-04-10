import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { getEnv } from '@/utils/env'
import { Routes } from '@/constants/routes'
import { Confirmation } from '@/components/ui/confirmation'
import ParallaxScrollView from '@/components/ui/parallax-scroll-view'
import { useGetMeQuery } from '@/features/auth/auth-api'
import { selectIsAuthenticated } from '@/features/auth/auth-slice'
import { logoutThunk } from '@/features/auth/auth-thunks'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { generateStyles } from './styles'
import { useThemedStyles } from '@/theme/theme-context'

export default function HomeScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const { data: meData, isFetching: isFetchingMe } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  })

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

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <MyView style={styles.titleContainer}>
        <MyText typography="subtitle" style={styles.sectionTitle}>
          {t('home.welcome')}
        </MyText>

        <MyText typography="body">{authSummary}</MyText>
        <MyText typography="body">
          {t('home.envLabel')}: {getEnv('EXPO_PUBLIC_APP_ENV')}
        </MyText>
      </MyView>
      <MyView style={styles.buttonContainer}>
        {isAuthenticated ? (
          <>
            <MyButton
              text={t('home.goTodo')}
              size="large"
              onPress={() => router.push(Routes.todo)}
              style={styles.introButton}
            />
            <MyButton
              text={t('home.logout')}
              size="large"
              type="tertiary"
              onPress={handleLogout}
              style={styles.introButton}
            />
          </>
        ) : (
          <MyButton
            text={t('home.login')}
            size="large"
            onPress={() => router.push(Routes.login)}
            style={styles.introButton}
          />
        )}
      </MyView>
    </ParallaxScrollView>
  )
}
