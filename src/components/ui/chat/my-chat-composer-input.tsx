import React, { memo, useMemo } from 'react'
import { TextInput, View, type TextInputProps, type TextStyle } from 'react-native'

import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

export type MyChatComposerInputProps = Pick<
  TextInputProps,
  | 'value'
  | 'onChangeText'
  | 'onContentSizeChange'
  | 'onScroll'
  | 'scrollEnabled'
  | 'multiline'
  | 'editable'
  | 'placeholder'
  | 'blurOnSubmit'
  | 'returnKeyType'
  | 'autoCorrect'
  | 'autoCapitalize'
> & {
  /** When true, pin height so the field scrolls instead of growing (expanded / past max). */
  lockHeight: boolean
  minHeight: number
  contentHeight: number
  lockedHeight: number
}

function MyChatComposerInput({
  lockHeight,
  minHeight,
  contentHeight,
  lockedHeight,
  multiline = true,
  blurOnSubmit,
  scrollEnabled,
  ...inputProps
}: MyChatComposerInputProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()
  const sizeStyle = useMemo(() => {
    if (lockHeight) {
      return { height: lockedHeight }
    }
    return { minHeight: Math.max(minHeight, Math.min(contentHeight, lockedHeight)) }
  }, [contentHeight, lockHeight, lockedHeight, minHeight])
  const wrapStyle = useMemo(
    () => [styles.composerInputWrap, sizeStyle, { maxHeight: lockedHeight }],
    [lockedHeight, sizeStyle, styles.composerInputWrap],
  )
  const inputStyle = useMemo(
    () => [styles.composerInput, sizeStyle] as TextStyle[],
    [sizeStyle, styles.composerInput],
  )

  return (
    <View style={wrapStyle}>
      <TextInput
        {...inputProps}
        multiline={multiline}
        blurOnSubmit={blurOnSubmit ?? !multiline}
        scrollEnabled={scrollEnabled}
        placeholderTextColor={getColor('text/inactive/primary')}
        textAlignVertical="top"
        underlineColorAndroid="transparent"
        style={inputStyle}
      />
    </View>
  )
}

export default memo(MyChatComposerInput)
