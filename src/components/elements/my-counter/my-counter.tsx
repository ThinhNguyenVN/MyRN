import React, { memo, useCallback, useRef, useState, useEffect } from 'react'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'
import { getContainerStyle, omitContainerProps, pickContainerProps } from '@/utils/styles'

import type { MyCounterProps } from './type'
import { generateStyles } from './styles'
import { isNil } from 'lodash'

const LONG_PRESS_DELAY_MS = 400
const REPEAT_INTERVAL_MS = 80

const MyCounter = memo(function MyCounter({
  value,
  onValueChange,
  min = 0,
  max = 99,
  step = 1,
  disabled = false,
  style,
  ...rest
}: MyCounterProps) {
  const styles = useThemedStyles(generateStyles)
  const containerStyle = getContainerStyle(
    pickContainerProps(rest as Record<string, unknown>) as Parameters<typeof getContainerStyle>[0],
  )
  const restProps = omitContainerProps(rest as Record<string, unknown>)
  const [currentValue, setCurrentValue] = useState(value)
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clamp = useCallback((n: number) => Math.min(max, Math.max(min, n)), [min, max])

  const updateValue = useCallback(
    (delta: number) => {
      const nextRef = { current: 0 }
      setCurrentValue((prev) => {
        const next = clamp(prev + delta)
        nextRef.current = next
        return next
      })
      queueMicrotask(() => onValueChange(nextRef.current))
    },
    [clamp, onValueChange],
  )

  const clearTimers = useCallback(() => {
    if (!isNil(delayRef.current)) {
      clearTimeout(delayRef.current)
      delayRef.current = null
    }
    if (!isNil(intervalRef.current)) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  const onMinus = useCallback(() => {
    if (disabled) return
    updateValue(-step)
  }, [disabled, updateValue, step])

  const onPlus = useCallback(() => {
    if (disabled) return
    updateValue(step)
  }, [disabled, updateValue, step])

  const onMinusPressIn = useCallback(() => {
    if (disabled) return
    delayRef.current = setTimeout(() => {
      delayRef.current = null

      intervalRef.current = setInterval(() => updateValue(-step), REPEAT_INTERVAL_MS)
    }, LONG_PRESS_DELAY_MS)
  }, [disabled, updateValue, step])

  const onPlusPressIn = useCallback(() => {
    if (disabled) return
    delayRef.current = setTimeout(() => {
      delayRef.current = null

      intervalRef.current = setInterval(() => updateValue(step), REPEAT_INTERVAL_MS)
    }, LONG_PRESS_DELAY_MS)
  }, [disabled, updateValue, step])

  return (
    <MyView style={[containerStyle, styles.row, style]} {...restProps}>
      <MyButton.Icon
        icon="remove"
        type="primary"
        size="small"
        onPress={onMinus}
        onPressIn={onMinusPressIn}
        onPressOut={clearTimers}
        disabled={disabled}
      />
      <MyView style={styles.numberWrap}>
        <MyText typography="body">{currentValue}</MyText>
      </MyView>
      <MyButton.Icon
        icon="add"
        type="primary"
        size="small"
        onPress={onPlus}
        onPressIn={onPlusPressIn}
        onPressOut={clearTimers}
        disabled={disabled}
      />
    </MyView>
  )
})

MyCounter.displayName = 'MyCounter'

export default MyCounter
