import React, { memo, useCallback, useMemo } from 'react'
import { Picker } from '@expo/ui/community/picker'
import { isNil } from 'lodash'

import { resolveIndexFromPickerSelection } from '@/components/elements/picker-engine'
import { useTheme } from '@/theme/theme-context'

import type { ExpoWheelPickerFieldProps } from './type'

/** Native wheel engine for MyWheelPicker (iOS). Item label color from brand token. */
const ExpoWheelPickerField = memo(function ExpoWheelPickerField({
  items,
  selectedIndex,
  onSelectIndex,
  enabled = true,
}: ExpoWheelPickerFieldProps) {
  const { getColor } = useTheme()
  const labelColor = getColor('text/active/primary')
  // SwiftUI Picker tags values as strings — keep selection type aligned.
  const selectedValue = useMemo(() => {
    const raw = items[selectedIndex]?.value ?? items[0]?.value
    return isNil(raw) ? undefined : String(raw)
  }, [items, selectedIndex])

  const handleValueChange = useCallback(
    (itemValue: unknown, itemIndex: number) => {
      const nextIndex = resolveIndexFromPickerSelection(itemValue, itemIndex, items)
      if (nextIndex >= 0) onSelectIndex(nextIndex)
    },
    [items, onSelectIndex],
  )

  return (
    <Picker selectedValue={selectedValue} enabled={enabled} onValueChange={handleValueChange}>
      {items.map((item) => (
        <Picker.Item
          key={String(item.value)}
          label={item.label}
          value={String(item.value)}
          color={labelColor}
        />
      ))}
    </Picker>
  )
})

ExpoWheelPickerField.displayName = 'ExpoWheelPickerField'

export default ExpoWheelPickerField
