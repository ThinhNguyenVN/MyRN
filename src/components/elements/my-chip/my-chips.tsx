import React, { memo, useCallback, useState } from 'react'
import { TextInput, View } from 'react-native'

import MyChip from '@/components/elements/my-chip'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { CHIP_MEDIUM_HEIGHT, CHIP_SMALL_HEIGHT, generateStyles } from './styles'
import type { MyChipsProps } from './type'

const MyChips: React.FC<MyChipsProps> = ({
  data,
  multiSelect = false,
  selected,
  onChanged,
  canRemove = false,
  canAdd = false,
  disabled = false,
  onRemove,
  onAdd,
  chipProps = {},
  style,
}) => {
  const { getColor } = useTheme()
  const styles = useThemedStyles(generateStyles)
  const [isAdding, setIsAdding] = useState(false)
  const [addValue, setAddValue] = useState('')

  const handleChipPress = useCallback(
    (item: string) => {
      const isSelected = selected.includes(item)
      const newSelected = multiSelect
        ? isSelected
          ? selected.filter((x) => x !== item)
          : [...selected, item]
        : isSelected
          ? []
          : [item]
      onChanged(newSelected)
    },
    [multiSelect, selected, onChanged],
  )

  const handleAddSubmit = useCallback(() => {
    const trimmed = addValue.trim()
    if (!trimmed) {
      setIsAdding(false)
      setAddValue('')
      return
    }
    const isDuplicate = data.some((d) => d.trim().toLowerCase() === trimmed.toLowerCase())
    if (isDuplicate || !onAdd) {
      setAddValue('')
      setIsAdding(false)
      return
    }
    onAdd(trimmed)
    setAddValue('')
    setIsAdding(false)
  }, [addValue, onAdd, data])

  const handleAddBlur = useCallback(() => {
    handleAddSubmit()
  }, [handleAddSubmit])

  const addChipSize = chipProps.size ?? 'medium'
  const chipHeight = addChipSize === 'small' ? CHIP_SMALL_HEIGHT : CHIP_MEDIUM_HEIGHT
  const chipType = chipProps.type ?? 'filled'
  const addIconColor =
    chipType === 'primary'
      ? '#ffffff'
      : (getColor('icon/active/primary') as Parameters<typeof MyIcon>[0]['color'])

  return (
    <MyView style={[styles.chipsRow, style]} flexDirection="row" flexWrap="wrap">
      {data.map((item) => (
        <MyChip
          key={item}
          label={item}
          {...chipProps}
          disabled={disabled || chipProps.disabled}
          selected={selected.includes(item)}
          onPress={() => handleChipPress(item)}
          showClose={canRemove}
          onClose={disabled ? undefined : onRemove ? () => onRemove(item) : undefined}
        />
      ))}
      {canAdd &&
        (isAdding ? (
          <View style={[styles.addInputWrap, { height: chipHeight }]}>
            <TextInput
              value={addValue}
              onChangeText={setAddValue}
              onSubmitEditing={handleAddSubmit}
              onBlur={handleAddBlur}
              placeholder="Add..."
              placeholderTextColor={getColor('text/inactive/primary')}
              style={[
                styles.addInput,
                {
                  height: chipHeight,
                },
              ]}
              editable={!disabled}
              autoFocus
              returnKeyType="done"
            />
          </View>
        ) : (
          <MyPressable
            disabled={disabled}
            onPress={() => setIsAdding(true)}
            animatedType="scale"
            scaleValue={0.92}
            scaleBySize={false}
          >
            <MyView
              radius="full"
              style={[
                styles[chipType],
                addChipSize === 'small' ? styles.sizeSmall : styles.sizeMedium,
                styles.addButtonIconOnly,
                addChipSize === 'small' && styles.addButtonIconOnlySmall,
                disabled && styles.disabled,
              ]}
            >
              <MyIcon name="add" size={addChipSize === 'small' ? 16 : 20} color={addIconColor} />
            </MyView>
          </MyPressable>
        ))}
    </MyView>
  )
}

export default memo(MyChips)
