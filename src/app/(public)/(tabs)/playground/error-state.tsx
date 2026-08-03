import { useCallback } from 'react'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyErrorState from '@/components/elements/my-error-state'
import MyText from '@/components/elements/my-text'
import { Toast } from '@/components/ui/toast'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function ErrorStatePlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const handleRetry = useCallback(() => {
    Toast.show({ text: t('playground.errorStateRetryToast'), type: 'info' })
  }, [t])

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.errorStateIntro')}
      </MyText>

      <MyErrorState
        title={t('playground.errorStateTitle')}
        message={t('playground.errorStateMessage')}
        retryLabel={t('playground.errorStateRetry')}
        onRetry={handleRetry}
      />
    </ScrollView>
  )
}
