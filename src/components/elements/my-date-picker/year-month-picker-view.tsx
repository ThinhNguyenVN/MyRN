import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import { WheelPickerView } from '@/components/elements/my-wheel-picker'
import { useThemedStyles } from '@/theme/theme-context'

import { getMonthWheelItems, getYearRange, getYearWheelItems } from './calendar-utils'
import { generateStyles } from './styles'
import type { YearMonthPickerViewProps, YearMonthValue } from './type'

const YearMonthPickerView = memo(function YearMonthPickerView({
  value,
  onValueChange,
  minDate,
  maxDate,
}: YearMonthPickerViewProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [internal, setInternal] = useState<YearMonthValue>(() => ({
    year: value.year,
    month: value.month,
  }))
  useEffect(() => {
    setInternal({ year: value.year, month: value.month })
  }, [value.year, value.month])

  const monthItems = useMemo(() => getMonthWheelItems(), [])

  const yearItems = useMemo(() => getYearWheelItems(minDate, maxDate), [minDate, maxDate])
  const { minYear } = useMemo(() => getYearRange(minDate, maxDate), [minDate, maxDate])

  const monthIndex = useMemo(
    () => Math.max(0, Math.min(internal.month, monthItems.length - 1)),
    [internal.month, monthItems.length],
  )
  const yearIndex = useMemo(() => {
    const idx = internal.year - minYear
    return Math.max(0, Math.min(idx, yearItems.length - 1))
  }, [internal.year, minYear, yearItems.length])

  const onMonthIndexChange = useCallback(
    (index: number) => {
      const month = monthItems[index]?.value ?? internal.month
      setInternal((prev) => ({ ...prev, month }))
    },
    [monthItems, internal.month],
  )
  const onYearIndexChange = useCallback(
    (index: number) => {
      const year = yearItems[index]?.value ?? internal.year
      setInternal((prev) => ({ ...prev, year }))
    },
    [yearItems, internal.year],
  )

  const handleConfirm = useCallback(() => {
    onValueChange(internal)
  }, [internal, onValueChange])

  const handleCancel = useCallback(() => {
    onValueChange(value)
  }, [value, onValueChange])

  return (
    <View>
      <View style={styles.yearMonthPickerRow}>
        <View style={styles.yearMonthWheel}>
          <WheelPickerView
            items={monthItems}
            selectedIndex={monthIndex}
            onSelectIndex={onMonthIndexChange}
          />
        </View>
        <View style={styles.yearMonthWheel}>
          <WheelPickerView
            items={yearItems}
            selectedIndex={yearIndex}
            onSelectIndex={onYearIndexChange}
          />
        </View>
      </View>
      <View style={styles.yearMonthPickerFooter}>
        <MyButton
          type="tertiary"
          text={t('common.cancel')}
          width="full"
          onPress={handleCancel}
          elevation="none"
        />
        <MyButton
          type="primary"
          text={t('common.confirm')}
          width="full"
          onPress={handleConfirm}
          elevation="none"
        />
      </View>
    </View>
  )
})

YearMonthPickerView.displayName = 'YearMonthPickerView'

export default YearMonthPickerView
