import { memo, useCallback } from 'react'
import { Pressable, View } from 'react-native'

import MyIcon from '@/components/elements/my-icon'
import MyImage from '@/components/elements/my-image'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { DropdownOptionRowProps } from './type'

const OptionThumbPlaceholder = memo(function OptionThumbPlaceholder() {
  const styles = useThemedStyles(generateStyles)
  return (
    <MyView style={styles.optionThumbPlaceholder} fillParent={false}>
      <MyIcon name="cube-outline" size={18} color="icon/inactive/primary" />
    </MyView>
  )
})

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
  const showThumb = option.imageUrl !== undefined

  return (
    <Pressable
      onPress={handleSelect}
      accessibilityRole={multiSelect ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected }}
      style={styles.optionRowMobile}
    >
      <ConditionRenderer when={showThumb} fallback={null}>
        <ConditionRenderer when={Boolean(option.imageUrl)} fallback={<OptionThumbPlaceholder />}>
          <MyImage
            key={option.imageUrl ?? option.value}
            url={option.imageUrl ?? undefined}
            style={styles.optionThumb}
            contentFit="cover"
            showMessage={false}
            lockAspectRatio={false}
            emptyContent={<OptionThumbPlaceholder />}
            errorContent={<OptionThumbPlaceholder />}
          />
        </ConditionRenderer>
      </ConditionRenderer>
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
