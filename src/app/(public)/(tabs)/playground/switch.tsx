import { useState } from 'react'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MySwitch from '@/components/elements/my-switch'
import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function SwitchScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [on1, setOn1] = useState(false)
  const [on2, setOn2] = useState(true)

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.switchBasic')}
      </MyText>

      <MySwitch value={on1} onValueChange={setOn1} label={t('playground.switchOff')} />
      <MySwitch value={on2} onValueChange={setOn2} label={t('playground.switchOn')} />

      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.switchLabelOnRightTitle')}
      </MyText>
      <MySwitch
        value={on1}
        onValueChange={setOn1}
        label={t('playground.switchLabelOnRight')}
        isLeftLabel={false}
      />

      <MyText typography="label" style={styles.sectionTitle}>
        {t('common.disabled')}
      </MyText>
      <MySwitch value={false} disabled label={t('playground.switchDisabledOff')} />
      <MySwitch value={true} disabled label={t('playground.switchDisabledOn')} />
    </ScrollView>
  )
}
