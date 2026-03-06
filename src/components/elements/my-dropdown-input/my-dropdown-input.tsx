import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Modal, Pressable, ScrollView, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import MyBottomSheet, { type MyBottomSheetRef } from '@/components/elements/my-bottom-sheet'
import MyCheckbox from '@/components/elements/my-checkbox'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyTextInput from '@/components/elements/my-text-input'
import MyView from '@/components/elements/my-view'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import type { MyDropdownInputProps } from './type'
import { generateStyles } from './styles'
import { isNil } from 'lodash'

const MyDropdownInput = memo(function MyDropdownInput({
  options,
  value,
  onValueChange,
  placeholder = 'Chọn...',
  disabled = false,
  multiSelect = false,
  title,
  subTitle,
  error = false,
  errorMessage,
  required = false,
  style,
}: MyDropdownInputProps) {
  const styles = useThemedStyles(generateStyles)
  const isMobile = useIsMobileSize()
  const sheetRef = useRef<MyBottomSheetRef>(null)
  const { getSpacing } = useTheme()
  const [open, setOpen] = useState(false)
  const [triggerLayout, setTriggerLayout] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const selectedValues = useMemo<string[]>(
    () =>
      multiSelect
        ? Array.isArray(value)
          ? value
          : value
            ? [value]
            : []
        : !isNil(value) && value !== ''
          ? []
          : [value as unknown as string],
    [multiSelect, value],
  )

  const selectedOption = !multiSelect ? options.find((o) => o.value === value) : null
  const displayText = multiSelect
    ? selectedValues
        .map((v) => options.find((o) => o.value === v)?.label)
        .filter(Boolean)
        .join(', ') || placeholder
    : (selectedOption?.label ?? placeholder)

  const triggerRef = useRef<View>(null)
  const chevronRotation = useSharedValue(0)

  useEffect(() => {
    chevronRotation.value = withTiming(open ? -90 : 0)
  }, [open, chevronRotation])

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }))

  const openPicker = useCallback(() => {
    if (disabled) return
    if (isMobile) {
      setOpen(true)
      sheetRef.current?.open()
    } else {
      triggerRef.current?.measureInWindow((x, y, width, height) => {
        setTriggerLayout({ x, y, width, height })
        setOpen(true)
      })
    }
  }, [disabled, isMobile])

  const closePicker = useCallback(() => {
    if (isMobile) {
      sheetRef.current?.close()
    }
    setOpen(false)
  }, [isMobile])

  const toggleOrSelect = useCallback(
    (optionValue: string) => {
      if (multiSelect) {
        const next = selectedValues.includes(optionValue)
          ? selectedValues.filter((v) => v !== optionValue)
          : [...selectedValues, optionValue]
        onValueChange?.(next)
      } else {
        onValueChange?.(optionValue)
        closePicker()
      }
    },
    [multiSelect, selectedValues, onValueChange, closePicker],
  )

  const optionListMobile = (
    <>
      {options.map((opt) => {
        const isSelected = selectedValues.includes(opt.value)
        return (
          <MyCheckbox
            key={opt.value}
            type={multiSelect ? 'checkbox' : 'radio'}
            checked={isSelected}
            onValueChange={() => toggleOrSelect(opt.value)}
            label={opt.label}
            labelStyle={styles.optionLabelMobile}
            isLeftLabel={true}
            elevation="none"
            style={styles.optionRowMobile}
          />
        )
      })}
    </>
  )

  const optionListDesktop = (
    <>
      {options.map((opt) => {
        const isSelected = selectedValues.includes(opt.value)
        return (
          <MyPressable
            key={opt.value}
            onPress={() => toggleOrSelect(opt.value)}
            style={[styles.optionRow, isSelected && styles.optionRowSelected]}
          >
            <MyText
              typography="body"
              style={[styles.optionText, isSelected && styles.optionTextSelected]}
              numberOfLines={1}
            >
              {opt.label}
            </MyText>
          </MyPressable>
        )
      })}
    </>
  )

  const trigger = (
    <View ref={triggerRef} collapsable={false} style={styles.triggerWrap}>
      <MyPressable onPress={openPicker} disabled={disabled} haptic={false} animatedType={'opacity'}>
        <MyTextInput
          title={title}
          subTitle={subTitle}
          value={displayText}
          placeholder={placeholder}
          editable={false}
          disabled={disabled}
          error={error}
          errorMessage={errorMessage}
          required={required}
          endIcon={
            <Animated.View style={chevronAnimatedStyle}>
              <MyIcon name="chevron-down" size={20} color="icon/active/primary" />
            </Animated.View>
          }
          style={styles.triggerInput}
        />
      </MyPressable>
    </View>
  )

  return (
    <MyView style={[styles.container, style]}>
      <MyView style={styles.relativeWrap}>
        {trigger}

        {isMobile ? (
          <MyBottomSheet
            ref={sheetRef}
            title={title ?? 'Chọn'}
            showClose
            onClosed={closePicker}
            pressBackdropToClose
          >
            <ScrollView contentContainerStyle={styles.sheetListContent}>
              {optionListMobile}
            </ScrollView>
          </MyBottomSheet>
        ) : (
          <>
            {open && (
              <Modal visible transparent animationType="fade">
                <Pressable style={styles.modalBackdrop} onPress={closePicker}>
                  {!!triggerLayout && (
                    <View
                      style={[
                        styles.dropdownPanel,
                        {
                          left: triggerLayout.x,
                          top: triggerLayout.y + triggerLayout.height + getSpacing('x1'),
                          width: triggerLayout.width,
                        },
                      ]}
                      onStartShouldSetResponder={() => true}
                    >
                      <ScrollView
                        style={styles.dropdownScrollView}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                      >
                        {optionListDesktop}
                      </ScrollView>
                    </View>
                  )}
                </Pressable>
              </Modal>
            )}
          </>
        )}
      </MyView>
    </MyView>
  )
})

MyDropdownInput.displayName = 'MyDropdownInput'

export default memo(MyDropdownInput)
