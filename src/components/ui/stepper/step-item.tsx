import { memo, useCallback } from 'react'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { StepItemProps } from './type'

function StepItemInner({ index, active, completed, reachable, title, onPress }: StepItemProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()

  const handlePress = useCallback(() => {
    if (reachable) {
      onPress(index)
    }
  }, [index, onPress, reachable])

  const wrapStyle = [styles.circleWrap, active ? styles.circleHalo : null]
  const circleStyle = [styles.circle, active || completed ? styles.circleActive : styles.circleIdle]
  const labelStyle = [styles.label, active || completed ? styles.labelActive : styles.labelIdle]
  const numberStyle = [styles.circleText, active || completed ? styles.circleTextOnActive : null]

  return (
    <MyPressable
      style={styles.item}
      onPress={handlePress}
      disabled={!reachable}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled: !reachable }}
      accessibilityLabel={title}
    >
      <MyView style={wrapStyle}>
        <MyView style={circleStyle}>
          <ConditionRenderer
            when={completed}
            fallback={
              <MyText typography="caption" style={numberStyle}>
                {index + 1}
              </MyText>
            }
          >
            <MyIcon name="checkmark" size={14} color={getColor('brand/white')} />
          </ConditionRenderer>
        </MyView>
      </MyView>
      <MyText typography="caption" style={labelStyle}>
        {title}
      </MyText>
    </MyPressable>
  )
}

export const StepItem = memo(StepItemInner)
