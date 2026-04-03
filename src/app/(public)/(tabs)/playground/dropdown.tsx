import { useState } from 'react'
import { ScrollView } from 'react-native'

import MyDropdownInput from '@/components/elements/my-dropdown-input'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

const dropdownOptions = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c' },
  { label: 'Option D', value: 'd' },
  { label: 'Option E', value: 'e' },
  { label: 'Option F', value: 'f' },
  { label: 'Option G', value: 'g' },
  { label: 'Option H', value: 'h' },
  { label: 'Option I', value: 'i' },
  { label: 'Option J', value: 'j' },
  { label: 'Option K', value: 'k' },
  { label: 'Option L', value: 'l' },
  { label: 'Option M', value: 'm' },
]

export default function DropdownScreen() {
  const styles = useThemedStyles(generateStyles)
  const [dropdownValue, setDropdownValue] = useState<string | null>(null)
  const [dropdownMultiValue, setDropdownMultiValue] = useState<string[]>([])
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        Dropdown Input
      </MyText>
      <MyView style={styles.content}>
        <MyDropdownInput
          options={dropdownOptions}
          value={dropdownValue}
          onValueChange={(v) => setDropdownValue(Array.isArray(v) ? (v[0] ?? null) : v)}
          placeholder="Chọn option..."
          title="Dropdown"
          subTitle="Mobile: bottom sheet + checkbox"
          required
        />
        <MyDropdownInput
          options={dropdownOptions}
          value={dropdownValue}
          onValueChange={(v) => setDropdownValue(Array.isArray(v) ? (v[0] ?? null) : v)}
          placeholder="Chọn..."
          error={!!dropdownValue && dropdownValue === 'a'}
          errorMessage="Demo lỗi khi chọn A"
        />
        <MyDropdownInput
          options={dropdownOptions}
          value={dropdownMultiValue}
          onValueChange={(v) => setDropdownMultiValue(Array.isArray(v) ? v : [v])}
          multiSelect
          placeholder="Chọn nhiều..."
          title="Multi select"
        />
        <MyDropdownInput
          options={dropdownOptions}
          value="b"
          onValueChange={() => {}}
          placeholder="Chọn..."
          title="Disabled"
          disabled
        />
      </MyView>
    </ScrollView>
  )
}
