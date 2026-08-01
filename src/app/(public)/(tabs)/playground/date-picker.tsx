import { useState } from 'react'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyDatePicker, {
  MyDateRangePicker,
  type DateRange,
} from '@/components/elements/my-date-picker'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function DatePickerScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [date1, setDate1] = useState<Date | null>(null)
  const [date2, setDate2] = useState<Date | null>(new Date())
  const [dateWithFooter, setDateWithFooter] = useState<Date | null>(new Date(2026, 2, 7))
  const [range, setRange] = useState<DateRange | null>(null)
  const minDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const maxDate = new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0)

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyDatePicker
        value={date1}
        onValueChange={setDate1}
        placeholder={t('playground.datePickerPickDate')}
        title={t('playground.datePickerDateLabel')}
      />

      <MyDatePicker
        value={date2}
        onValueChange={setDate2}
        title={t('playground.datePickerSelectedDate')}
      />

      <MyDatePicker
        value={null}
        disabled
        placeholder={t('common.disabled')}
        title={t('playground.datePickerDateLabel')}
      />

      <MyDatePicker
        value={date1}
        onValueChange={setDate1}
        minDate={minDate}
        maxDate={maxDate}
        placeholder={t('playground.datePickerWithinTwoMonths')}
        title={t('playground.datePickerRange')}
      />

      <MyDatePicker
        value={dateWithFooter}
        onValueChange={setDateWithFooter}
        title={t('playground.datePickerSelectedDate')}
        footer={
          <MyButton
            type="tertiary"
            text={t('common.clear')}
            width="full"
            onPress={() => setDateWithFooter(null)}
            elevation={'none'}
          />
        }
      />

      <MyDateRangePicker
        value={range}
        onValueChange={setRange}
        placeholder={t('playground.datePickerRange')}
        title={t('playground.datePickerRange')}
        footer={
          <MyButton
            type="tertiary"
            text={t('common.clear')}
            width="full"
            onPress={() => setRange(null)}
          />
        }
      />
    </ScrollView>
  )
}
