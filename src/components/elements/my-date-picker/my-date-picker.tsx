import React, { memo, useCallback, useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'

import Calendar from '@/components/elements/my-date-picker/calendar'
import DatePickerShell from '@/components/elements/my-date-picker/date-picker-shell'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyTextInput from '@/components/elements/my-text-input'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { MyDatePickerProps } from './type'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

interface DatePickerTriggerProps {
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

const MyDatePicker = memo(function MyDatePicker({
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
  footer,
  style,
}: MyDatePickerProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const handleSelectDay = useCallback(
    (date: Date, closePicker: () => void) => {
      onValueChange?.(date)
      const timer = setTimeout(closePicker, 300)
      return () => clearTimeout(timer)
    },
    [onValueChange],
  )

  const displayText = value ? formatDate(value) : ''

  const resolvedPlaceholder = placeholder ?? t('components.datePickOne')
  const resolvedTitle = title ?? t('components.datePickOne')

  return (
    <DatePickerShell
      title={resolvedTitle}
      disabled={disabled}
      footer={footer}
      panelMinWidth={280}
      estimatedPanelHeight={380}
      style={style}
      renderTrigger={({ openPicker, disabled: d, open }) => (
        <DatePickerTrigger
          open={open}
          openPicker={openPicker}
          disabled={d}
          displayText={displayText}
          placeholder={resolvedPlaceholder}
          title={resolvedTitle}
          error={error}
          errorMessage={errorMessage}
          required={required}
          triggerInputStyle={styles.triggerInput}
        />
      )}
      renderContent={(closePicker, contentOpts) => (
        <Calendar
          value={value}
          minDate={minDate}
          maxDate={maxDate}
          onSelectDay={(date) => handleSelectDay(date, closePicker)}
          onYearMonthModeChange={contentOpts.setYearMonthMode}
        />
      )}
    />
  )
})

MyDatePicker.displayName = 'MyDatePicker'

export default MyDatePicker
