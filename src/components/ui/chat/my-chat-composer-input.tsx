import React, { memo, useLayoutEffect, useMemo, useRef } from 'react'
import { TextInput, View, type TextInputProps, type TextStyle } from 'react-native'

import { isWeb } from '@/constants/dimensions'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { COMPOSER_INPUT_LINE_HEIGHT } from './constants'
import { generateStyles } from './styles'

type WebTextArea = {
  scrollHeight: number
  style: { height: string }
}

export type MyChatComposerInputProps = Pick<
  TextInputProps,
  | 'value'
  | 'onChangeText'
  | 'onContentSizeChange'
  | 'onScroll'
  | 'scrollEnabled'
  | 'multiline'
  | 'placeholder'
  | 'blurOnSubmit'
  | 'onFocus'
  | 'onBlur'
> & {
  /** Web only: pin the textarea height so it scrolls instead of growing past the ceiling. */
  lockHeight: boolean
  minHeight: number
  /** Web only: measured content height of the textarea. */
  contentHeight: number
  /** Ceiling: the field stops growing here and scrolls internally instead. */
  lockedHeight: number
  onMeasuredHeight?: (height: number) => void
}

function MyChatComposerInput({
  lockHeight,
  minHeight,
  contentHeight,
  lockedHeight,
  multiline = true,
  blurOnSubmit,
  scrollEnabled,
  onMeasuredHeight,
  ...inputProps
}: MyChatComposerInputProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()
  const inputRef = useRef<TextInput>(null)
  const grownHeight = Math.max(minHeight, Math.min(contentHeight, lockedHeight))
  const isEmpty = (inputProps.value ?? '').length === 0
  const wrapSizeStyle = useMemo(() => {
    if (!isWeb) {
      // Native: a multiline TextInput grows on its own while `scrollEnabled` is false,
      // so nothing here sets a height — we only state the floor and the ceiling. That
      // is what keeps typing visible even if a measurement is late or never arrives.
      return { minHeight, maxHeight: lockedHeight }
    }
    if (lockHeight) {
      return { height: lockedHeight, maxHeight: lockedHeight }
    }
    if (isEmpty) {
      return { height: minHeight, maxHeight: minHeight }
    }
    return { minHeight: grownHeight, maxHeight: lockedHeight }
  }, [grownHeight, isEmpty, lockHeight, lockedHeight, minHeight])
  const wrapStyle = useMemo(
    () => [styles.composerInputWrap, wrapSizeStyle],
    [styles.composerInputWrap, wrapSizeStyle],
  )
  const inputStyle = useMemo(() => {
    if (!isWeb) {
      return styles.composerInput as TextStyle
    }
    if (lockHeight) {
      return [styles.composerInput, { height: lockedHeight }] as TextStyle[]
    }
    if (isEmpty) {
      return [styles.composerInput, { height: COMPOSER_INPUT_LINE_HEIGHT }] as TextStyle[]
    }
    return [styles.composerInput, { height: grownHeight }] as TextStyle[]
  }, [grownHeight, isEmpty, lockHeight, lockedHeight, styles.composerInput])

  useLayoutEffect(() => {
    if (!isWeb || lockHeight || isEmpty || !onMeasuredHeight) {
      return
    }
    const node = inputRef.current as unknown as WebTextArea | null
    if (!node || typeof node.scrollHeight !== 'number') {
      return
    }
    node.style.height = '0px'
    const measured = Math.ceil(node.scrollHeight)
    node.style.height = `${Math.min(measured, lockedHeight)}px`
    if (measured !== contentHeight) {
      onMeasuredHeight(measured)
    }
  }, [contentHeight, inputProps.value, isEmpty, lockHeight, lockedHeight, onMeasuredHeight])

  return (
    <View style={wrapStyle}>
      <TextInput
        ref={inputRef}
        {...inputProps}
        multiline={multiline}
        blurOnSubmit={blurOnSubmit ?? !multiline}
        scrollEnabled={scrollEnabled}
        placeholderTextColor={getColor('text/inactive/primary')}
        underlineColorAndroid="transparent"
        style={inputStyle}
      />
    </View>
  )
}

export default memo(MyChatComposerInput)
