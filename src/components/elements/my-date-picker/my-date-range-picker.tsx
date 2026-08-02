import React, { memo, useCallback, useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'

import { CalendarRange } from './calendar'
import DatePickerShell from '@/components/elements/my-date-picker/date-picker-shell'
import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyTextInput from '@/components/elements/my-text-input'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type {
  DatePickerContentOpts,
  DatePickerTriggerProps,
  DatePickerTriggerRenderProps,
  MyDateRangePickerProps,
  RangeCalendarContentProps,
  RangeFooterProps,
} from './type'
import { toDateOnly, formatDate } from './calendar-utils'

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

const RangeCalendarContent = memo(function RangeCalendarContent({
  startDate,
  endDate,
  minDate,
  maxDate,
  onSelectDay,
  setYearMonthMode,
}: RangeCalendarContentProps) {
  return (
    <CalendarRange
      startDate={startDate}
      endDate={endDate}
      minDate={minDate}
      maxDate={maxDate}
      onSelectDay={onSelectDay}
      onYearMonthModeChange={setYearMonthMode}
    />
  )
})

const RangeFooter = memo(function RangeFooter({
  onClear,
  onConfirm,
  clearLabel,
  confirmLabel,
  rowStyle,
}: RangeFooterProps) {
  return (
    <View style={rowStyle}>
      <MyButton type="tertiary" text={clearLabel} width="full" onPress={onClear} elevation="none" />
      <MyButton
        type="primary"
        text={confirmLabel}
        width="full"
        onPress={onConfirm}
        elevation="none"
      />
    </View>
  )
})

const MyDateRangePicker = memo(function MyDateRangePicker({
  value,
  onValueChange,
  placeholder,
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
  const { t } = useTranslation()
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

  const resolvedPlaceholder = placeholder ?? t('components.datePickRange')
  const resolvedTitle = title ?? t('components.datePickRange')
  const clearLabel = t('common.clear')
  const confirmLabel = t('common.confirm')

  const renderTrigger = useCallback(
    ({ openPicker, disabled: triggerDisabled, open }: DatePickerTriggerRenderProps) => (
      <DateRangePickerTrigger
        open={open}
        openPicker={openPicker}
        disabled={triggerDisabled}
        displayText={displayText}
        placeholder={resolvedPlaceholder}
        title={resolvedTitle}
        error={error}
        errorMessage={errorMessage}
        required={required}
        triggerInputStyle={styles.triggerInput}
      />
    ),
    [
      displayText,
      resolvedPlaceholder,
      resolvedTitle,
      error,
      errorMessage,
      required,
      styles.triggerInput,
    ],
  )

  const renderContent = useCallback(
    (_closePicker: () => void, contentOpts: DatePickerContentOpts) => (
      <RangeCalendarContent
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        maxDate={maxDate}
        onSelectDay={handleSelectDay}
        setYearMonthMode={contentOpts.setYearMonthMode}
      />
    ),
    [startDate, endDate, minDate, maxDate, handleSelectDay],
  )

  const renderFooter = useCallback(
    (closePicker: () => void) => (
      <RangeFooter
        onClear={handleClear}
        onConfirm={closePicker}
        clearLabel={clearLabel}
        confirmLabel={confirmLabel}
        rowStyle={styles.footerButtonRow}
      />
    ),
    [handleClear, clearLabel, confirmLabel, styles.footerButtonRow],
  )

  return (
    <DatePickerShell
      title={resolvedTitle}
      disabled={disabled}
      panelMinWidth={280}
      estimatedPanelHeight={380}
      style={style}
      renderTrigger={renderTrigger}
      renderContent={renderContent}
      renderFooter={renderFooter}
    />
  )
})

MyDateRangePicker.displayName = 'MyDateRangePicker'

export default MyDateRangePicker
