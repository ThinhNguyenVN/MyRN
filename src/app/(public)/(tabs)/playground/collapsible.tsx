import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import { Collapsible } from '@/components/ui/collapsible'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function CollapsiblePlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.collapsibleIntro')}
      </MyText>

      <Collapsible title={t('playground.collapsibleSectionOne')}>
        <MyText typography="body" color="text/active/secondary">
          {t('playground.collapsibleSectionOneBody')}
        </MyText>
      </Collapsible>

      <Collapsible title={t('playground.collapsibleSectionTwo')}>
        <MyText typography="body" color="text/active/secondary">
          {t('playground.collapsibleSectionTwoBody')}
        </MyText>
      </Collapsible>
    </ScrollView>
  )
}
