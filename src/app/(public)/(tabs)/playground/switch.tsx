import { useState } from 'react'
import { ScrollView } from 'react-native'

import MySwitch from '@/components/elements/my-switch'
import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

export default function SwitchScreen() {
  const styles = useThemedStyles(generateStyles)
  const [on1, setOn1] = useState(false)
  const [on2, setOn2] = useState(true)

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="label" style={styles.sectionTitle}>
        Basic
      </MyText>

      <MySwitch value={on1} onValueChange={setOn1} label="Off" />
      <MySwitch value={on2} onValueChange={setOn2} label="On" />

      <MyText typography="label" style={styles.sectionTitle}>
        Label on right
      </MyText>
      <MySwitch value={on1} onValueChange={setOn1} label="Label on right" isLeftLabel={false} />

      <MyText typography="label" style={styles.sectionTitle}>
        Disabled
      </MyText>
      <MySwitch value={false} disabled label="Disabled off" />
      <MySwitch value={true} disabled label="Disabled on" />
    </ScrollView>
  )
}
