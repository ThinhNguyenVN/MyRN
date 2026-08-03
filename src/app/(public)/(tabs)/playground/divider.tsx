import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyDivider from '@/components/elements/my-divider'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function DividerPlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.dividerIntro')}
      </MyText>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.dividerHorizontal')}
      </MyText>
      <MyText typography="body">{t('playground.dividerAbove')}</MyText>
      <MyDivider marginVertical={12} />
      <MyText typography="body">{t('playground.dividerBelow')}</MyText>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.dividerVertical')}
      </MyText>
      <MyView style={styles.dividerVerticalRow}>
        <MyText typography="body">{t('playground.dividerLeft')}</MyText>
        <MyDivider orientation="vertical" marginHorizontal={12} />
        <MyText typography="body">{t('playground.dividerRight')}</MyText>
      </MyView>
    </ScrollView>
  )
}
