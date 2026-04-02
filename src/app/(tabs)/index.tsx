import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useMemo } from 'react'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { Routes } from '@/constants/routes'
import ParallaxScrollView from '@/components/ui/parallax-scroll-view'
import { useGetMeQuery } from '@/features/auth/auth-api'
import { selectIsAuthenticated } from '@/features/auth/auth-slice'
import { useAppSelector } from '@/store/hooks'
import { generateStyles } from './styles'
import { useThemedStyles } from '@/theme/theme-context'

export default function HomeScreen() {
  const styles = useThemedStyles(generateStyles)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const { data: meData, isFetching: isFetchingMe } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  })

  const authSummary = useMemo(() => {
    if (!isAuthenticated) {
      return 'Bạn chưa đăng nhập.'
    }
    if (isFetchingMe && !meData) {
      return 'Đang tải thông tin user...'
    }
    if (!meData) {
      return 'Đã đăng nhập, chưa lấy được thông tin user.'
    }
    return `${meData.firstName} ${meData.lastName} · @${meData.username}`
  }, [isAuthenticated, isFetchingMe, meData])

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
          MyRN
        </MyText>
        <MyText typography="body" color="text/active/secondary" style={styles.introText}>
          React Native app với bộ component dùng chung (MyView, MyText, MyButton, MyTextInput,
          MyDropdownInput, MyCheckbox, MyCounter, Toast, Bottom Sheet, Confirmation, Alert, Image…).
          Theme, spacing và elevation thống nhất.
        </MyText>
        <MyText typography="caption" color="text/active/tertiary">
          {authSummary}
        </MyText>
        <MyButton
          width={'full'}
          text="Xem Component Playground"
          size={'large'}
          type="primary"
          onPress={() => router.push('/(tabs)/playground')}
          style={styles.introButton}
        />
        {isAuthenticated ? (
          <MyButton
            width="full"
            text="Vào Todo"
            size="large"
            type="secondary"
            onPress={() => router.push(Routes.todo)}
          />
        ) : (
          <MyButton
            width="full"
            text="Login"
            size="large"
            type="secondary"
            onPress={() => router.push(Routes.login)}
          />
        )}
      </MyView>
    </ParallaxScrollView>
  )
}
