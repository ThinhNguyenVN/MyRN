import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { Toast } from '@/components/ui/toast'
import { WebsiteHeader } from '@/components/ui/website-header'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function WebsiteHeaderScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const handleBack = useCallback(() => {
    Toast.show({ text: t('common.back'), type: 'info' })
  }, [t])

  const handleNotifications = useCallback(() => {
    Toast.show({ text: t('components.websiteHeader.notifications'), type: 'info' })
  }, [t])

  const handleProfile = useCallback(() => {
    Toast.show({ text: t('components.websiteHeader.profile'), type: 'info' })
  }, [t])

  return (
    <MyKeyboardAvoiding.ScrollView showToolbar contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.websiteHeaderIntro')}
      </MyText>
      <MyView style={styles.content}>
        <WebsiteHeader
          title={t('playground.websiteHeaderTitle')}
          showBack
          onBackPress={handleBack}
          onNotificationsPress={handleNotifications}
          onProfilePress={handleProfile}
        />
      </MyView>
    </MyKeyboardAvoiding.ScrollView>
  )
}
