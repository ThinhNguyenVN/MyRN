import { useState } from 'react'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyDropdownInput from '@/components/elements/my-dropdown-input'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

const dropdownOptions = [
  { labelKey: 'playground.dropdownOptionA', value: 'a' },
  { labelKey: 'playground.dropdownOptionB', value: 'b' },
  { labelKey: 'playground.dropdownOptionC', value: 'c' },
  { labelKey: 'playground.dropdownOptionD', value: 'd' },
  { labelKey: 'playground.dropdownOptionE', value: 'e' },
  { labelKey: 'playground.dropdownOptionF', value: 'f' },
  { labelKey: 'playground.dropdownOptionG', value: 'g' },
  { labelKey: 'playground.dropdownOptionH', value: 'h' },
  { labelKey: 'playground.dropdownOptionI', value: 'i' },
  { labelKey: 'playground.dropdownOptionJ', value: 'j' },
  { labelKey: 'playground.dropdownOptionK', value: 'k' },
  { labelKey: 'playground.dropdownOptionL', value: 'l' },
  { labelKey: 'playground.dropdownOptionM', value: 'm' },
]

export default function DropdownScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [dropdownValue, setDropdownValue] = useState<string | null>(null)
  const [dropdownMultiValue, setDropdownMultiValue] = useState<string[]>([])
  const options = dropdownOptions.map((option) => ({
    label: t(option.labelKey),
    value: option.value,
  }))

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyDropdownInput
        options={options}
        value={dropdownValue}
        onValueChange={(v) => setDropdownValue(Array.isArray(v) ? (v[0] ?? null) : v)}
        placeholder={t('playground.dropdownPlaceholderPrimary')}
        title={t('playground.linksDropdown')}
        subTitle={t('playground.dropdownSubTitleMobile')}
        required
      />
      <MyDropdownInput
        options={options}
        value={dropdownValue}
        onValueChange={(v) => setDropdownValue(Array.isArray(v) ? (v[0] ?? null) : v)}
        placeholder={t('components.dropdownSelect')}
        error={!!dropdownValue && dropdownValue === 'a'}
        errorMessage={t('playground.dropdownErrorWhenA')}
      />
      <MyDropdownInput
        options={options}
        value={dropdownMultiValue}
        onValueChange={(v) => setDropdownMultiValue(Array.isArray(v) ? v : [v])}
        multiSelect
        placeholder={t('playground.dropdownPlaceholderMulti')}
        title={t('playground.dropdownMultiSelectTitle')}
      />
      <MyDropdownInput
        options={options}
        value="b"
        onValueChange={() => {}}
        placeholder={t('components.dropdownSelect')}
        title={t('common.disabled')}
        disabled
      />
    </ScrollView>
  )
}
