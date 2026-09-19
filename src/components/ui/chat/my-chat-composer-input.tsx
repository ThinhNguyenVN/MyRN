import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputProps,
  type TextInputSubmitEditingEventData,
  type TextStyle,
} from 'react-native'

import { isWeb } from '@/constants/dimensions'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { COMPOSER_INPUT_LINE_HEIGHT } from './constants'
import { generateStyles } from './styles'

type WebTextArea = {
  scrollHeight: number
  style: { height: string }
  addEventListener?: (type: string, listener: (event: KeyboardEvent) => void) => void
  removeEventListener?: (type: string, listener: (event: KeyboardEvent) => void) => void
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
  /**
   * Enter / Return sends. Newline via Ctrl/Cmd+Enter or Shift+Enter (web / hardware keyboards).
   * Native soft keyboard: Return sends (multiline still grows from pasted / modifier newlines).
   */
  onEnterSend?: () => void
}

function MyChatComposerInput({
  lockHeight,
  minHeight,
  contentHeight,
  lockedHeight,
  multiline = true,
  scrollEnabled,
  onMeasuredHeight,
  onEnterSend,
  ...inputProps
}: MyChatComposerInputProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()
  const inputRef = useRef<TextInput>(null)
  const onEnterSendRef = useRef(onEnterSend)
  const grownHeight = Math.max(minHeight, Math.min(contentHeight, lockedHeight))
  const isEmpty = (inputProps.value ?? '').length === 0

  useEffect(() => {
    onEnterSendRef.current = onEnterSend
  }, [onEnterSend])

  // RN Web's TextInput overwrites `onKeyDown` with its own submit handler, so a prop
  // never runs. Attach to the DOM node instead. Keep `blurOnSubmit={false}` on web so
  // RN Web does not also treat Enter as submit (Ctrl/Cmd/Shift+Enter must stay newline).
  useEffect(() => {
    if (!isWeb || !onEnterSend) {
      return
    }
    const node = inputRef.current as unknown as WebTextArea | null
    const addListener = node?.addEventListener
    const removeListener = node?.removeEventListener
    if (!addListener || !removeListener) {
      return
    }

    const handleDomKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') {
        return
      }
      if (event.isComposing || event.keyCode === 229) {
        return
      }
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      onEnterSendRef.current?.()
    }

    addListener.call(node, 'keydown', handleDomKeyDown)
    return () => {
      removeListener.call(node, 'keydown', handleDomKeyDown)
    }
  }, [onEnterSend])

  const handleSubmitEditing = useCallback(
    (_event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
      onEnterSend?.()
    },
    [onEnterSend],
  )

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
        // Web: blurOnSubmit false — RN Web overwrites onKeyDown; DOM listener owns Enter/send.
        // Native: submitBehavior submit — Return sends without dismissing the keyboard.
        blurOnSubmit={false}
        submitBehavior={isWeb || !onEnterSend ? undefined : 'submit'}
        onSubmitEditing={!isWeb && onEnterSend ? handleSubmitEditing : undefined}
        returnKeyType="send"
        enterKeyHint="send"
        scrollEnabled={scrollEnabled}
        placeholderTextColor={getColor('text/inactive/primary')}
        underlineColorAndroid="transparent"
        style={inputStyle}
      />
    </View>
  )
}

export default memo(MyChatComposerInput)
