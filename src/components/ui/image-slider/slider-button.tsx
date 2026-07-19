import { memo } from 'react'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

type SliderButtonProps = {
  direction: 'previous' | 'next'
  disabled: boolean
  onPress: () => void
}

export const SliderButton = memo(function SliderButton({
  direction,
  disabled,
  onPress,
}: SliderButtonProps) {
  const styles = useThemedStyles(generateStyles)
  const isPrevious = direction === 'previous'

  return (
    <MyPressable
      animatedType="opacity"
      disabled={disabled}
      style={[
        styles.button,
        isPrevious ? styles.buttonPrevious : styles.buttonNext,
        disabled && styles.buttonDisabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${isPrevious ? 'Previous' : 'Next'} image`}
      onPress={onPress}
    >
      <MyIcon
        name={isPrevious ? 'chevron-back' : 'chevron-forward'}
        size={20}
        color="icon/active/primary"
      />
    </MyPressable>
  )
})
