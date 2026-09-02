import React, { memo, useCallback, useMemo } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'

import MyPressable from '@/components/elements/my-pressable'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { CarouselDotsProps } from './type'

interface DotProps {
  readonly index: number
  readonly active: boolean
  readonly onSelect: (index: number) => void
  readonly dotStyle: StyleProp<ViewStyle>
  readonly activeDotStyle: StyleProp<ViewStyle>
}

const DotInner: React.FC<DotProps> = ({ index, active, onSelect, dotStyle, activeDotStyle }) => {
  const handlePress = useCallback(() => onSelect(index), [onSelect, index])

  return (
    <MyPressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Go to slide ${index + 1}`}
      accessibilityState={{ selected: active }}
      hitSlop={8}
    >
      <View style={[dotStyle, active && activeDotStyle]} />
    </MyPressable>
  )
}

const Dot = memo(DotInner)

const CarouselDotsInner: React.FC<CarouselDotsProps> = ({
  count,
  activeIndex,
  onSelect,
  style,
  dotStyle,
  activeDotStyle,
}) => {
  const styles = useThemedStyles(generateStyles)
  const mergedDotStyle = useMemo(() => [styles.dot, dotStyle], [styles.dot, dotStyle])

  return (
    <View style={[styles.row, style]}>
      {Array.from({ length: count }, (_, index) => (
        <Dot
          key={`dot-${index}`}
          index={index}
          active={index === activeIndex}
          onSelect={onSelect}
          dotStyle={mergedDotStyle}
          activeDotStyle={activeDotStyle ?? styles.dotActive}
        />
      ))}
    </View>
  )
}

export const CarouselDots = memo(CarouselDotsInner)
