import { useState } from 'react'
import { ScrollView } from 'react-native'

import MyCounter from '@/components/elements/my-counter'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

export default function CounterScreen() {
  const styles = useThemedStyles(generateStyles)
  const [counterValue, setCounterValue] = useState(0)
  const [counterValue2, setCounterValue2] = useState(0)
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyView paddingTop={50} gap={16}>
        <MyCounter value={counterValue} onValueChange={setCounterValue} min={0} max={99} step={1} />
        <MyCounter
          value={counterValue2}
          onValueChange={setCounterValue2}
          min={-10}
          max={10}
          step={2}
        />
        <MyCounter value={5} onValueChange={() => {}} min={0} max={10} disabled />
      </MyView>
    </ScrollView>
  )
}
