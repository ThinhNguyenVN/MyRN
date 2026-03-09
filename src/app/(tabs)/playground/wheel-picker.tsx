import { isNil } from 'lodash'
import { useState } from 'react'
import { ScrollView } from 'react-native-gesture-handler'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import {
  MyWheelPicker,
  WheelPickerView,
  type WheelPickerItem,
} from '@/components/elements/my-wheel-picker'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

const SAMPLE_ITEMS: WheelPickerItem[] = [
  { label: 'Option 1', value: 1 },
  { label: 'Option 2', value: 2 },
  { label: 'Option 3', value: 3 },
  { label: 'Option 4', value: 4 },
  { label: 'Option 5', value: 5 },
  { label: 'Option 6', value: 6 },
  { label: 'Option 7', value: 7 },
]

export default function WheelPickerScreen() {
  const styles = useThemedStyles(generateStyles)
  const [selectedIndex, setSelectedIndex] = useState(1)
  const [value, setValue] = useState<number | null>(null)

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        Wheel Picker
      </MyText>
      <MyText typography="body" color="text/active/secondary" style={styles.sectionCaption}>
        Sample 1: WheelPickerView (chỉ wheel, dùng ở bất cứ đâu). Sample 2: MyWheelPicker (trigger +
        sheet/modal).
      </MyText>

      <MyText typography="label" style={styles.sectionTitle}>
        Sample 1 – WheelPickerView only
      </MyText>
      <MyView style={styles.inputContainer}>
        <WheelPickerView
          items={SAMPLE_ITEMS}
          selectedIndex={selectedIndex}
          onSelectIndex={(value) => {
            console.log('onSelectIndex ===> ', value)
            setSelectedIndex(value)
          }}
        />
        <MyText typography="body" style={styles.labelMargin}>
          Đã chọn: {SAMPLE_ITEMS[selectedIndex]?.label ?? '—'}
        </MyText>
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        Sample 2 – MyWheelPicker (trigger + sheet/modal)
      </MyText>
      <MyView style={styles.inputContainer}>
        <MyWheelPicker
          items={SAMPLE_ITEMS}
          value={value}
          onValueChange={setValue}
          title="Chọn option"
          placeholder="Chọn option"
        />
        <MyText typography="body" style={styles.labelMargin}>
          Giá trị:{' '}
          {!isNil(value) ? (SAMPLE_ITEMS.find((i) => i.value === value)?.label ?? value) : '—'}
        </MyText>
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        Disabled
      </MyText>
      <MyView style={styles.inputContainer}>
        <MyWheelPicker
          items={SAMPLE_ITEMS}
          value={2}
          onValueChange={() => {}}
          title="Chọn option"
          placeholder="Chọn option"
          disabled
        />
      </MyView>
    </ScrollView>
  )
}
