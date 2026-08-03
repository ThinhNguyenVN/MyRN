import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MySkeleton from '@/components/elements/my-skeleton'
import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function SkeletonPlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.skeletonIntro')}
      </MyText>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.skeletonListRow')}
      </MyText>
      <MySkeleton preset="listRow" count={3} />

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.skeletonTextBlock')}
      </MyText>
      <MySkeleton preset="textBlock" count={2} />

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.skeletonCard')}
      </MyText>
      <MySkeleton preset="card" count={1} />
    </ScrollView>
  )
}
