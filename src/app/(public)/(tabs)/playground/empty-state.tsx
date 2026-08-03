import { useCallback } from 'react'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyEmptyState from '@/components/elements/my-empty-state'
import MyText from '@/components/elements/my-text'
import { Toast } from '@/components/ui/toast'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function EmptyStatePlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const handleActionPress = useCallback(() => {
    Toast.show({ text: t('playground.emptyStateActionToast'), type: 'success' })
  }, [t])

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.emptyStateIntro')}
      </MyText>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.emptyStateTitleOnly')}
      </MyText>
      <MyEmptyState title={t('playground.emptyStateNoItems')} />

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.emptyStateWithAction')}
      </MyText>
      <MyEmptyState
        title={t('playground.emptyStateNoResults')}
        subtitle={t('playground.emptyStateNoResultsSubtitle')}
        actionLabel={t('playground.emptyStateClearFilters')}
        onActionPress={handleActionPress}
      />
    </ScrollView>
  )
}
