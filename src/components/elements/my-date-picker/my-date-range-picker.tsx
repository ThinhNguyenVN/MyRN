import React, { memo, useCallback, useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { CalendarRange } from './calendar'
import DatePickerShell from '@/components/elements/my-date-picker/date-picker-shell'
import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyTextInput from '@/components/elements/my-text-input'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { MyDateRangePickerProps } from './type'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function toDateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

interface DateRangePickerTriggerProps {
  open: boolean
  openPicker: () => void
  disabled: boolean
  displayText: string
  placeholder: string
  title?: string
  error?: boolean
  errorMessage?: string
  required?: boolean
  triggerInputStyle: ReturnType<typeof generateStyles>['triggerInput']
}

const DateRangePickerTrigger = memo(function DateRangePickerTrigger({
  open,
  openPicker,
  disabled,
  displayText,
  placeholder,
  title,
  error,
  errorMessage,
  required,
  triggerInputStyle,
}: DateRangePickerTriggerProps) {
  const chevronRotation = useSharedValue(0)
  useEffect(() => {
    chevronRotation.value = withTiming(open ? -90 : 0)
  }, [open, chevronRotation])
  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }))

  return (
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
        style={triggerInputStyle}
        pointerEvents="box-none"
      />
    </MyPressable>
  )
})

const MyDateRangePicker = memo(function MyDateRangePicker({
  value,
  onValueChange,
  placeholder = 'Chọn khoảng ngày',
  disabled = false,
  minDate,
  maxDate,
  title,
  error = false,
  errorMessage,
  required = false,
  style,
}: MyDateRangePickerProps) {
  const styles = useThemedStyles(generateStyles)
  const startDate = value?.startDate ?? null
  const endDate = value?.endDate ?? null

  const handleSelectDay = useCallback(
    (date: Date) => {
      const dateOnly = toDateOnly(date)
      if (startDate === null || (startDate !== null && endDate !== null)) {
        onValueChange?.({ startDate: dateOnly, endDate: null })
      } else {
        const startOnly = toDateOnly(startDate)
        if (dateOnly.getTime() < startOnly.getTime()) {
          onValueChange?.({ startDate: dateOnly, endDate: startOnly })
        } else {
          onValueChange?.({ startDate: startOnly, endDate: dateOnly })
        }
      }
    },
    [startDate, endDate, onValueChange],
  )

  const handleClear = useCallback(() => {
    onValueChange?.({ startDate: null, endDate: null })
  }, [onValueChange])

  let displayText = ''
  if (startDate && endDate) {
    displayText = `${formatDate(startDate)} - ${formatDate(endDate)}`
  } else if (startDate) {
    displayText = formatDate(startDate)
  }

  return (
    <DatePickerShell
      title={title ?? 'Chọn khoảng ngày'}
      disabled={disabled}
      panelMinWidth={280}
      estimatedPanelHeight={380}
      style={style}
      renderTrigger={({ openPicker, disabled: d, open }) => (
        <DateRangePickerTrigger
          open={open}
          openPicker={openPicker}
          disabled={d}
          displayText={displayText}
          placeholder={placeholder}
          title={title}
          error={error}
          errorMessage={errorMessage}
          required={required}
          triggerInputStyle={styles.triggerInput}
        />
      )}
      renderContent={(closePicker) => (
        <>
          <CalendarRange
            startDate={startDate}
            endDate={endDate}
            minDate={minDate}
            maxDate={maxDate}
            onSelectDay={handleSelectDay}
          />
          <View style={styles.footerButtonRow}>
            <MyButton
              type="primary"
              text="Xác nhận"
              width="full"
              onPress={closePicker}
              elevation={'none'}
            />
            <MyButton
              type="tertiary"
              text="Xóa"
              width="full"
              onPress={handleClear}
              elevation={'none'}
            />
          </View>
        </>
      )}
    />
  )
})

MyDateRangePicker.displayName = 'MyDateRangePicker'

export default MyDateRangePicker
