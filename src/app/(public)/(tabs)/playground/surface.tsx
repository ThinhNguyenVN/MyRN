import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function SurfacePlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()
  const { t } = useTranslation()
  const surfaceBg = getColor('fill/background/secondary')

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.surfaceIntro')}
      </MyText>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.surfaceSoftSmall')}
      </MyText>
      <MySurface
        elevation="soft/down/small"
        radius="medium"
        backgroundColor={surfaceBg}
        fillParent={false}
        style={styles.surfaceDemoBox}
      >
        <MyView style={styles.surfaceDemoInner}>
          <MyText typography="label">{t('playground.surfaceSoftSmall')}</MyText>
        </MyView>
      </MySurface>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.surfaceSoftMedium')}
      </MyText>
      <MySurface
        elevation="soft/down/medium"
        radius="medium"
        backgroundColor={surfaceBg}
        fillParent={false}
        style={styles.surfaceDemoBox}
      >
        <MyView style={styles.surfaceDemoInner}>
          <MyText typography="label">{t('playground.surfaceSoftMedium')}</MyText>
        </MyView>
      </MySurface>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.surfaceHardLarge')}
      </MyText>
      <MySurface
        elevation="hard/down/large"
        radius="large"
        backgroundColor={surfaceBg}
        fillParent={false}
        style={styles.surfaceDemoBox}
      >
        <MyView style={styles.surfaceDemoInner}>
          <MyText typography="label">{t('playground.surfaceHardLarge')}</MyText>
        </MyView>
      </MySurface>
    </ScrollView>
  )
}
