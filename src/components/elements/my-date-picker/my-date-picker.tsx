import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import MyBottomSheet, { type MyBottomSheetRef } from '@/components/elements/my-bottom-sheet'
import Calendar from '@/components/elements/my-date-picker/calendar'
import MyIcon from '@/components/elements/my-icon'
import MyTextInput from '@/components/elements/my-text-input'
import MyView from '@/components/elements/my-view'
import { TriggerModal } from '@/components/ui/trigger-modal'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { MyDatePickerProps } from './type'
import MyPressable from '../my-pressable'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

const MyDatePicker = memo(function MyDatePicker({
  value,
  onValueChange,
  placeholder = 'Chọn ngày',
  disabled = false,
  minDate,
  maxDate,
  title,
  error = false,
  errorMessage,
  required = false,
  footer,
  style,
}: MyDatePickerProps) {
  const styles = useThemedStyles(generateStyles)
  const isMobile = useIsMobileSize()
  const sheetRef = useRef<MyBottomSheetRef>(null)
  const triggerRef = useRef<View>(null)
  const [open, setOpen] = useState(false)
  const [triggerLayout, setTriggerLayout] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

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
    setTriggerLayout(null)
  }, [isMobile])

  const handleSelectDay = useCallback(
    (date: Date) => {
      onValueChange?.(date)
      const timer = setTimeout(() => {
        closePicker()
      }, 300)
      return () => clearTimeout(timer)
    },
    [onValueChange, closePicker],
  )

  const displayText = value ? formatDate(value) : ''

  const trigger = (
    <View ref={triggerRef} collapsable={false} style={styles.triggerWrap}>
      <MyPressable onPress={openPicker} disabled={disabled} haptic={false} animatedType="opacity">
        <MyTextInput
          title={title}
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
          pointerEvents={'box-none'}
        />
      </MyPressable>
    </View>
  )

  const calendarContent = (
    <View style={styles.sheetCalendarContent}>
      <Calendar value={value} minDate={minDate} maxDate={maxDate} onSelectDay={handleSelectDay} />
    </View>
  )

  return (
    <MyView style={[styles.container, style]}>
      <MyView style={styles.relativeWrap}>
        {trigger}

        {isMobile ? (
          <MyBottomSheet
            ref={sheetRef}
            title={title ?? 'Chọn ngày'}
            showClose
            onClosed={closePicker}
            pressBackdropToClose
            footer={footer}
          >
            {calendarContent}
          </MyBottomSheet>
        ) : (
          <TriggerModal
            visible={open}
            onClose={closePicker}
            triggerLayout={triggerLayout}
            footer={footer}
            panelMinWidth={280}
            estimatedPanelHeight={380}
            contentContainerStyle={styles.sheetCalendarContent}
            footerContainerStyle={styles.sheetFooter}
          >
            <Calendar
              value={value}
              minDate={minDate}
              maxDate={maxDate}
              onSelectDay={handleSelectDay}
            />
          </TriggerModal>
        )}
      </MyView>
    </MyView>
  )
})

MyDatePicker.displayName = 'MyDatePicker'

export default MyDatePicker
