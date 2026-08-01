import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function ButtonsDetailScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  return (
    <MyView style={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.buttonsDetailTitle')}
      </MyText>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.buttonsDetailDescription')}
      </MyText>
      <MyButton
        width={'full'}
        text={t('playground.buttonsBack')}
        type="primary"
        onPress={() => router.back()}
      />
    </MyView>
  )
}
