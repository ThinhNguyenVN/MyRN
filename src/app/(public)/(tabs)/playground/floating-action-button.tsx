import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { Toast } from '@/components/ui/toast'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function FloatingActionButtonScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const handlePress = useCallback(() => {
    Toast.show({ text: t('playground.fabPressed'), type: 'success' })
  }, [t])

  return (
    <MyView fillParent>
      <MyKeyboardAvoiding.ScrollView showToolbar contentContainerStyle={styles.screenContent}>
        <MyText typography="body" color="text/active/secondary" style={styles.introText}>
          {t('playground.fabIntro')}
        </MyText>
      </MyKeyboardAvoiding.ScrollView>
      <FloatingActionButton
        icon="add"
        onPress={handlePress}
        accessibilityLabel={t('playground.linksFab')}
      />
    </MyView>
  )
}
