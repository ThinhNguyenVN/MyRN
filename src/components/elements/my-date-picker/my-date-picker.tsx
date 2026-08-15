import React, { memo, useCallback, useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'

import Calendar from '@/components/elements/my-date-picker/calendar'
import DatePickerShell from '@/components/elements/my-date-picker/date-picker-shell'
import { formatDate } from '@/components/elements/my-date-picker/calendar-utils'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyTextInput from '@/components/elements/my-text-input'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type {
  CalendarContentProps,
  DatePickerContentOpts,
  DatePickerTriggerProps,
  DatePickerTriggerRenderProps,
  MyDatePickerProps,
} from './type'

const DatePickerTrigger = memo(function DatePickerTrigger({
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
}: DatePickerTriggerProps) {
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

const CalendarContent = memo(function CalendarContent({
  value,
  minDate,
  maxDate,
  closePicker,
  setYearMonthMode,
  onSelectDay,
}: CalendarContentProps) {
  const handleSelectDay = useCallback(
    (date: Date) => {
      onSelectDay(date, closePicker)
    },
    [onSelectDay, closePicker],
  )

  return (
    <Calendar
      value={value}
      minDate={minDate}
      maxDate={maxDate}
      onSelectDay={handleSelectDay}
      onYearMonthModeChange={setYearMonthMode}
    />
  )
})

const MyDatePicker = memo(function MyDatePicker({
  value,
  onValueChange,
  placeholder,
  disabled = false,
  minDate,
  maxDate,
  title,
  hideTitle = false,
  error = false,
  errorMessage,
  required = false,
  footer,
  style,
}: MyDatePickerProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const handleSelectDay = useCallback(
    (date: Date, closePicker: () => void) => {
      onValueChange?.(date)
      setTimeout(closePicker, 300)
    },
    [onValueChange],
  )

  const displayText = value ? formatDate(value) : ''
  const resolvedPlaceholder = placeholder ?? t('components.datePickOne')
  const resolvedTitle = title ?? t('components.datePickOne')
  const triggerTitle = hideTitle ? undefined : resolvedTitle

  const renderTrigger = useCallback(
    ({ openPicker, disabled: triggerDisabled, open }: DatePickerTriggerRenderProps) => (
      <DatePickerTrigger
        open={open}
        openPicker={openPicker}
        disabled={triggerDisabled}
        displayText={displayText}
        placeholder={resolvedPlaceholder}
        title={triggerTitle}
        error={error}
        errorMessage={errorMessage}
        required={required}
        triggerInputStyle={styles.triggerInput}
      />
    ),
    [
      displayText,
      resolvedPlaceholder,
      triggerTitle,
      error,
      errorMessage,
      required,
      styles.triggerInput,
    ],
  )

  const renderContent = useCallback(
    (closePicker: () => void, contentOpts: DatePickerContentOpts) => (
      <CalendarContent
        value={value}
        minDate={minDate}
        maxDate={maxDate}
        closePicker={closePicker}
        setYearMonthMode={contentOpts.setYearMonthMode}
        onSelectDay={handleSelectDay}
      />
    ),
    [value, minDate, maxDate, handleSelectDay],
  )

  return (
    <DatePickerShell
      title={resolvedTitle}
      disabled={disabled}
      footer={footer}
      panelMinWidth={280}
      estimatedPanelHeight={380}
      style={style}
      renderTrigger={renderTrigger}
      renderContent={renderContent}
    />
  )
})

MyDatePicker.displayName = 'MyDatePicker'

export default MyDatePicker
