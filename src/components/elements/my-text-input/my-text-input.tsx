import React, { forwardRef, memo, useCallback, useMemo, useState } from 'react'
import { TouchableOpacity, Platform, TextInput, type ViewStyle, type TextStyle } from 'react-native'

import { isNil } from 'lodash'

import { BottomSheetTextInput } from '@gorhom/bottom-sheet'

import MyText from '../my-text'
import MyView from '../my-view'

import { generateStyles } from './styles'
import type { MyTextInputProps, MyTextInputRef } from './type'
import { useThemedStyles } from '@/theme/theme-context'
import { getContainerStyle, omitContainerProps, pickContainerProps } from '@/utils/styles'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'
import FormFieldLabel from '@/components/form/form-field-label'
import FormFieldError from '@/components/form/form-field-error'

const INPUT_FONT_SIZE = 16
const INPUT_HEIGHT = 40

const MyTextInput = memo(
  forwardRef<MyTextInputRef, MyTextInputProps>(function MyTextInput(
    {
      title,
      subTitle,
      startIcon,
      endIcon,
      disabled = false,
      error = false,
      errorMessage,
      editable = true,
      useBottomSheetTextInput = false,
      showCurrentLength,
      maxLength,
      startText,
      endText,
      onStartIconPress,
      onEndIconPress,
      width = 'auto',
      height = INPUT_HEIGHT,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      inputStyle,
      ignoreValue,
      required = false,
      value,
      style: styleProp,
      ...rest
    },
    ref,
  ) {
    const styles = useThemedStyles(generateStyles)
    const isMobileSize = useIsMobileSize()
    const TextInputComponent =
      Platform.OS === 'web' || !isMobileSize
        ? TextInput
        : useBottomSheetTextInput
          ? BottomSheetTextInput
          : TextInput
    const containerStyle = useMemo(
      () =>
        getContainerStyle(
          pickContainerProps(rest as Record<string, unknown>) as Parameters<
            typeof getContainerStyle
          >[0],
        ),
      [rest],
    )
    const hasContainerStyle = Object.keys(containerStyle).length > 0
    const viewProps = omitContainerProps(rest as Record<string, unknown>)
    const [isFocused, setIsFocused] = useState(false)

    const handleFocus = useCallback(
      (e: unknown) => {
        setIsFocused(true)
        onFocusProp?.(e as Parameters<NonNullable<typeof onFocusProp>>[0])
      },
      [onFocusProp],
    )
    const handleBlur = useCallback(
      (e: unknown) => {
        setIsFocused(false)
        onBlurProp?.(e as Parameters<NonNullable<typeof onBlurProp>>[0])
      },
      [onBlurProp],
    )

    const state: 'default' | 'disabled' | 'error' | 'focus' = error
      ? 'error'
      : disabled
        ? 'disabled'
        : isFocused
          ? 'focus'
          : 'default'
    const stateColors = styles.stateColors[state]

    const widthStyle: ViewStyle =
      width === 'auto' ? { width: '100%' as const, alignSelf: 'stretch' as const } : { width }
    const inputRowStyle = useMemo(
      () => ({ borderColor: stateColors.border, height }),
      [stateColors.border, height],
    )
    const inputDynamicStyle = useMemo(
      () => ({
        fontSize: INPUT_FONT_SIZE,
        color: stateColors.value,
        alignItems: height > INPUT_HEIGHT ? 'flex-start' : 'center',
        minHeight: INPUT_HEIGHT,
        height,
      }),
      [stateColors.value, height],
    )
    const webInputStyle = useMemo(
      () =>
        Platform.OS === 'web'
          ? ({ outlineStyle: 'none', outlineWidth: 0 } as unknown as TextStyle)
          : undefined,
      [],
    )

    const rootStyle = hasContainerStyle
      ? [containerStyle, styles.container, widthStyle, styleProp]
      : [styles.container, widthStyle, styleProp]

    return (
      <MyView style={rootStyle} pointerEvents={editable && !disabled ? 'auto' : 'box-none'}>
        <FormFieldLabel
          title={title}
          subTitle={subTitle}
          required={required}
          error={!!error}
          style={styles.title}
        />
        <MyView style={[styles.inputRow, inputRowStyle]}>
          {!!startText && (
            <MyText typography="body" color="text/active/secondary">
              {startText}
            </MyText>
          )}
          {!isNil(startIcon) && (
            <TouchableOpacity
              onPress={onStartIconPress}
              disabled={!onStartIconPress || disabled}
              style={styles.iconWrap}
              hitSlop={8}
            >
              {startIcon}
            </TouchableOpacity>
          )}
          <TextInputComponent
            ref={ref as any}
            {...viewProps}
            value={ignoreValue ? undefined : value}
            editable={!disabled && editable}
            onFocus={handleFocus}
            onBlur={handleBlur}
            textAlignVertical="top"
            style={[
              styles.inputBase,
              inputDynamicStyle as TextStyle,
              height > INPUT_HEIGHT && styles.inputMultilinePadding,
              webInputStyle,
              inputStyle,
            ]}
            placeholderTextColor={stateColors.placeholder}
            maxLength={maxLength}
          />
          {!isNil(endIcon) && (
            <TouchableOpacity
              onPress={onEndIconPress}
              disabled={!onEndIconPress || disabled}
              style={styles.iconWrap}
              hitSlop={8}
            >
              {endIcon}
            </TouchableOpacity>
          )}
          {!!endText && (
            <MyText typography="body" color="text/active/secondary">
              {endText}
            </MyText>
          )}
        </MyView>

        {!isNil(maxLength) && !!showCurrentLength && (
          <MyText typography="caption" color="text/active/tertiary" alignSelf={'flex-end'}>
            {value?.length ?? 0}/{maxLength}
          </MyText>
        )}

        <FormFieldError
          error={error && !!errorMessage ? { message: errorMessage } : undefined}
          style={error && !!errorMessage ? styles.error : undefined}
        />
      </MyView>
    )
  }),
)

MyTextInput.displayName = 'MyTextInput'

export default MyTextInput
