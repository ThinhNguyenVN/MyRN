import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { AccessibilityInfo, Animated, Platform, Pressable, TextInput, View } from 'react-native'

import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { OtpCodeInputProps } from './type'

export const DEFAULT_OTP_LENGTH = 6

const useNativeDriver = Platform.OS !== 'web'

/**
 * One-time code field: one hidden `TextInput` under `length` display cells, so typing, paste
 * ("123 456" too) and SMS autofill (iOS `oneTimeCode`, Android `sms-otp`, web `one-time-code`)
 * all land in the same field. Controlled: the parent owns `value`. Use the `ref` handle to
 * `focus()` / `shake()` (e.g. after a wrong code).
 */
export function OtpCodeInput({
  value,
  onChangeText,
  onComplete,
  length = DEFAULT_OTP_LENGTH,
  error = false,
  disabled = false,
  autoFocus = true,
  accessibilityLabel,
  ref,
}: OtpCodeInputProps) {
  const styles = useThemedStyles(generateStyles)
  const inputRef = useRef<TextInput>(null)
  const shakeX = useRef(new Animated.Value(0)).current
  const [focused, setFocused] = useState(false)
  const indexes = useMemo(() => Array.from({ length }, (_, i) => i), [length])

  const focus = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const shake = useCallback(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce) return
      shakeX.setValue(0)
      Animated.sequence(
        [-8, 8, -6, 6, 0].map((toValue) =>
          Animated.timing(shakeX, { toValue, duration: 50, useNativeDriver }),
        ),
      ).start()
    })
  }, [shakeX])

  useImperativeHandle(ref, () => ({ focus, shake }), [focus, shake])

  useEffect(() => {
    if (disabled || !autoFocus) return undefined
    const id = setTimeout(focus, 50)
    return () => clearTimeout(id)
  }, [autoFocus, disabled, focus])

  const handleChangeText = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, '').slice(0, length)
      onChangeText(digits)
      if (digits.length === length) {
        onComplete(digits)
      }
    },
    [length, onChangeText, onComplete],
  )

  const handleFocus = useCallback(() => setFocused(true), [])
  const handleBlur = useCallback(() => setFocused(false), [])

  const activeIndex = Math.min(value.length, length - 1)

  return (
    <Pressable onPress={focus} disabled={disabled} accessible={false}>
      <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
        {indexes.map((index) => {
          const digit = value[index] ?? ''
          return (
            <View
              key={index}
              style={[
                styles.cell,
                digit !== '' && styles.cellFilled,
                focused && !disabled && index === activeIndex && styles.cellActive,
                error && styles.cellError,
                disabled && styles.cellDisabled,
              ]}
            >
              <MyText
                typography="h3"
                color={disabled ? 'text/inactive/primary' : 'text/active/primary'}
                style={styles.digit}
              >
                {digit}
              </MyText>
            </View>
          )
        })}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          maxLength={length}
          keyboardType="number-pad"
          inputMode="numeric"
          textContentType="oneTimeCode"
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
          caretHidden
          contextMenuHidden={false}
          selectionColor="transparent"
          accessibilityLabel={accessibilityLabel}
          style={styles.hiddenInput}
        />
      </Animated.View>
    </Pressable>
  )
}
