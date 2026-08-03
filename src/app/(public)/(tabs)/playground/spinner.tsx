import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MySpinner from '@/components/elements/my-spinner'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function SpinnerPlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.spinnerIntro')}
      </MyText>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.spinnerSizes')}
      </MyText>
      <MyView style={styles.spinnerRow}>
        <MySpinner size="xsmall" color="primary" />
        <MySpinner size="small" color="primary" />
        <MySpinner size="default" color="primary" />
      </MyView>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.spinnerColors')}
      </MyText>
      <MyView style={styles.spinnerRow}>
        <MySpinner color="dark" />
        <MySpinner color="primary" />
        <MySpinner color="alert" />
        <MySpinner color="warning" />
      </MyView>
    </ScrollView>
  )
}
