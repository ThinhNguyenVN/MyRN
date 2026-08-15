import { memo, useCallback } from 'react'
import { Pressable, View } from 'react-native'

import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { DropdownOptionRowProps } from './type'

function DropdownOptionRowComponent({
  option,
  selected,
  multiSelect,
  onSelect,
}: DropdownOptionRowProps) {
  const styles = useThemedStyles(generateStyles)
  const handleSelect = useCallback(() => {
    onSelect(option.value)
  }, [onSelect, option.value])

  return (
    <Pressable
      onPress={handleSelect}
      accessibilityRole={multiSelect ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected }}
      style={styles.optionRowMobile}
    >
      <MyText typography="body" style={styles.optionLabelMobile} numberOfLines={1}>
        {option.label}
      </MyText>
      <View
        style={[
          styles.optionMark,
          multiSelect ? styles.optionMarkCheckbox : styles.optionMarkRadio,
          selected && styles.optionMarkSelected,
        ]}
      >
        {selected ? (
          multiSelect ? (
            <MyIcon name="checkmark" size={16} color="icon/active/tertiary" />
          ) : (
            <View style={styles.optionMarkDot} />
          )
        ) : null}
      </View>
    </Pressable>
  )
}

export const DropdownOptionRow = memo(DropdownOptionRowComponent)
