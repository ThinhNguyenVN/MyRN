import { useCallback } from 'react'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyCard from '@/components/elements/my-card'
import MyText from '@/components/elements/my-text'
import { Toast } from '@/components/ui/toast'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function CardPlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const handleCardPress = useCallback(() => {
    Toast.show({ text: t('playground.cardPressedToast'), type: 'info' })
  }, [t])

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.cardIntro')}
      </MyText>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.cardStatic')}
      </MyText>
      <MyCard elevation="none">
        <MyText typography="subtitle">{t('playground.cardStaticTitle')}</MyText>
        <MyText typography="body" color="text/active/secondary">
          {t('playground.cardStaticBody')}
        </MyText>
      </MyCard>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.cardElevationSoft')}
      </MyText>
      <MyCard elevation="soft/down/small">
        <MyText typography="subtitle">{t('playground.cardElevationSoft')}</MyText>
        <MyText typography="body" color="text/active/secondary">
          {t('playground.cardElevationSoftBody')}
        </MyText>
      </MyCard>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.cardElevationMedium')}
      </MyText>
      <MyCard elevation="soft/down/medium">
        <MyText typography="subtitle">{t('playground.cardElevationMedium')}</MyText>
        <MyText typography="body" color="text/active/secondary">
          {t('playground.cardElevationMediumBody')}
        </MyText>
      </MyCard>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.cardElevationHard')}
      </MyText>
      <MyCard elevation="hard/down/large">
        <MyText typography="subtitle">{t('playground.cardElevationHard')}</MyText>
        <MyText typography="body" color="text/active/secondary">
          {t('playground.cardElevationHardBody')}
        </MyText>
      </MyCard>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.cardPressable')}
      </MyText>
      <MyCard elevation="soft/down/small" onPress={handleCardPress}>
        <MyText typography="subtitle">{t('playground.cardPressableTitle')}</MyText>
        <MyText typography="body" color="text/active/secondary">
          {t('playground.cardPressableBody')}
        </MyText>
      </MyCard>
    </ScrollView>
  )
}
