import { useCallback, useMemo, useState } from 'react'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyDropdownInput from '@/components/elements/my-dropdown-input'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

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
  const [unitValue, setUnitValue] = useState<string | null>(null)
  const [fullscreenValue, setFullscreenValue] = useState<string | null>(null)
  const options = dropdownOptions.map((option) => ({
    label: t(option.labelKey),
    value: option.value,
  }))
  const unitOptions = useMemo(
    () => options.slice(0, 4).map((option) => ({ ...option, imageUrl: null as string | null })),
    [options],
  )

  const handleSingleChange = useCallback((v: string | string[]) => {
    setDropdownValue(Array.isArray(v) ? (v[0] ?? null) : v)
  }, [])
  const handleMultiChange = useCallback((v: string | string[]) => {
    setDropdownMultiValue(Array.isArray(v) ? v : [v])
  }, [])
  const handleUnitChange = useCallback((v: string | string[]) => {
    setUnitValue(Array.isArray(v) ? (v[0] ?? null) : v)
  }, [])
  const handleFullscreenChange = useCallback((v: string | string[]) => {
    setFullscreenValue(Array.isArray(v) ? (v[0] ?? null) : v)
  }, [])
  const handleDisabledChange = useCallback(() => {}, [])

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyDropdownInput
        options={options}
        value={dropdownValue}
        onValueChange={handleSingleChange}
        placeholder={t('playground.dropdownPlaceholderPrimary')}
        title={t('playground.linksDropdown')}
        subTitle={t('playground.dropdownSubTitleMobile')}
        required
      />
      <MyDropdownInput
        options={unitOptions}
        value={unitValue}
        onValueChange={handleUnitChange}
        placeholder={t('components.dropdownSelect')}
        title={t('playground.dropdownSheetTitle')}
        searchable={false}
        preferSheet
      />
      <MyDropdownInput
        options={unitOptions}
        value={fullscreenValue}
        onValueChange={handleFullscreenChange}
        placeholder={t('components.dropdownSelect')}
        title={t('playground.dropdownFullscreenTitle')}
        searchable={false}
        preferFullscreen
      />
      <MyDropdownInput
        options={options}
        value={dropdownValue}
        onValueChange={handleSingleChange}
        placeholder={t('components.dropdownSelect')}
        error={!!dropdownValue && dropdownValue === 'a'}
        errorMessage={t('playground.dropdownErrorWhenA')}
      />
      <MyDropdownInput
        options={options}
        value={dropdownMultiValue}
        onValueChange={handleMultiChange}
        multiSelect
        placeholder={t('playground.dropdownPlaceholderMulti')}
        title={t('playground.dropdownMultiSelectTitle')}
      />
      <MyDropdownInput
        options={options}
        value="b"
        onValueChange={handleDisabledChange}
        placeholder={t('components.dropdownSelect')}
        title={t('common.disabled')}
        disabled
      />
    </ScrollView>
  )
}
