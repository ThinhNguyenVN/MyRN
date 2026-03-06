import { useState } from 'react'
import { ScrollView } from 'react-native'

import MySwitch from '@/components/elements/my-switch'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

export default function SwitchScreen() {
  const styles = useThemedStyles(generateStyles)
  const [on1, setOn1] = useState(false)
  const [on2, setOn2] = useState(true)

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        Switch
      </MyText>
      <MyText typography="body" color="text/active/secondary" style={styles.sectionCaption}>
        value, onValueChange, disabled, label, isLeftLabel.
      </MyText>

      <MyText typography="label" style={styles.sectionTitle}>
        Basic
      </MyText>
      <MyView style={styles.buttonMargin}>
        <MySwitch value={on1} onValueChange={setOn1} label="Off" style={styles.inputContainer} />
        <MySwitch value={on2} onValueChange={setOn2} label="On" style={styles.inputContainer} />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        Label on right
      </MyText>
      <MyView style={styles.buttonMargin}>
        <MySwitch
          value={on1}
          onValueChange={setOn1}
          label="Label on right"
          isLeftLabel={false}
          style={styles.inputContainer}
        />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        Disabled
      </MyText>
      <MyView style={styles.buttonMargin}>
        <MySwitch value={false} disabled label="Disabled off" style={styles.inputContainer} />
        <MySwitch value={true} disabled label="Disabled on" style={styles.inputContainer} />
      </MyView>
    </ScrollView>
  )
}
