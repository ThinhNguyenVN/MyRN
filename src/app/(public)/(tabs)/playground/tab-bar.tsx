import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { TabBarCenterButton } from '@/components/ui/tabbar'
import { Toast } from '@/components/ui/toast'
import { generateStyles } from '@/features/playground/styles'
import { useThemedStyles } from '@/theme/theme-context'

export default function TabBarPlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const handleCenterPress = useCallback(() => {
    Toast.show({ text: t('playground.tabBarCenterPressed'), type: 'info' })
  }, [t])

  return (
    <MyView fillParent>
      <MyKeyboardAvoiding.ScrollView showToolbar contentContainerStyle={styles.screenContent}>
        <MyText typography="body" color="text/active/secondary" style={styles.introText}>
          {t('playground.tabBarIntro')}
        </MyText>
      </MyKeyboardAvoiding.ScrollView>
      <MyView style={styles.tabBarDemoBar}>
        <TabBarCenterButton
          label={t('playground.tabBarCenterLabel')}
          icon="sparkles-outline"
          onPress={handleCenterPress}
          accessibilityLabel={t('playground.tabBarCenterLabel')}
          badge={t('playground.chatNewBadge')}
        />
      </MyView>
    </MyView>
  )
}
