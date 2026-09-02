import { Image } from 'expo-image'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import templateConfig from '@root/template.config.json'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { getEnv } from '@/utils/env'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '../styles'
import type { HomeScreenViewProps } from './types'

export function HomeScreenView({
  isAuthenticated,
  authSummary,
  onGoTodo,
  onLogout,
  onLogin,
}: HomeScreenViewProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  return (
    <ScrollView>
      <MyView style={styles.homeHeader}>
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      </MyView>
      <MyView style={styles.titleContainer}>
        <MyText typography="subtitle" style={styles.sectionTitle}>
          {t('home.welcome', { appName: templateConfig.appName })}
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
              onPress={onGoTodo}
              style={styles.introButton}
            />
            <MyButton
              text={t('home.logout')}
              size="large"
              type="tertiary"
              onPress={onLogout}
              style={styles.introButton}
            />
          </>
        ) : (
          <MyButton
            text={t('home.login')}
            size="large"
            onPress={onLogin}
            style={styles.introButton}
          />
        )}
      </MyView>
    </ScrollView>
  )
}
