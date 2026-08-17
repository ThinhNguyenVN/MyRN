import { useTranslation } from 'react-i18next'

import MyTag from '@/components/elements/my-tag'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function TagScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  return (
    <MyKeyboardAvoiding.ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.tagTones')}
      </MyText>
      <MyView style={styles.chipRow}>
        <MyTag label={t('playground.tagCompleted')} tone="success" />
        <MyTag label={t('playground.tagInProgress')} tone="neutral" />
        <MyTag label={t('playground.tagCancelled')} tone="alert" />
      </MyView>
      <MyView style={styles.chipRow}>
        <MyTag label={t('playground.tagWarning')} tone="warning" />
        <MyTag label={t('playground.tagInfo')} tone="info" />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.tagSizes')}
      </MyText>
      <MyView style={styles.chipRow}>
        <MyTag label={t('playground.tagCompleted')} tone="success" />
        <MyTag label={t('playground.tagCompleted')} tone="success" size="compact" />
      </MyView>
    </MyKeyboardAvoiding.ScrollView>
  )
}
