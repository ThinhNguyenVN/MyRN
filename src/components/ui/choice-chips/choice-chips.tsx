import { memo, useCallback } from 'react'

import MyChip from '@/components/elements/my-chip'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { ChoiceChipsProps, ChoiceOption } from './type'

type ChoiceChipProps = {
  option: ChoiceOption
  selected: boolean
  disabled: boolean
  onChange: (value: string) => void
}

const ChoiceChip = memo(function ChoiceChip({
  option,
  selected,
  disabled,
  onChange,
}: ChoiceChipProps) {
  const handlePress = useCallback(() => {
    onChange(option.value)
  }, [onChange, option.value])

  return (
    <MyChip
      label={option.label}
      selected={selected}
      disabled={disabled}
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
    />
  )
})

/** Single-choice pills (used instead of a nested dropdown inside a dialog). */
function ChoiceChips({ options, value, disabled = false, onChange }: ChoiceChipsProps) {
  const styles = useThemedStyles(generateStyles)
  return (
    <MyView style={styles.chipRow}>
      {options.map((option) => (
        <ChoiceChip
          key={`choice-${option.value}`}
          option={option}
          selected={option.value === value}
          disabled={disabled}
          onChange={onChange}
        />
      ))}
    </MyView>
  )
}

export default memo(ChoiceChips)
