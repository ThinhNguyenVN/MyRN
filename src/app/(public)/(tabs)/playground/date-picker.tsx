import { useState } from 'react'
import { ScrollView } from 'react-native'

import MyButton from '@/components/elements/my-button'
import MyDatePicker, {
  MyDateRangePicker,
  type DateRange,
} from '@/components/elements/my-date-picker'
import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

export default function DatePickerScreen() {
  const styles = useThemedStyles(generateStyles)
  const [date1, setDate1] = useState<Date | null>(null)
  const [date2, setDate2] = useState<Date | null>(new Date())
  const [dateWithFooter, setDateWithFooter] = useState<Date | null>(new Date(2026, 2, 7))
  const [range, setRange] = useState<DateRange | null>(null)
  const minDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const maxDate = new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0)

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        Date Picker
      </MyText>

      <MyDatePicker value={date1} onValueChange={setDate1} placeholder="Chọn ngày" title="Ngày" />

      <MyDatePicker value={date2} onValueChange={setDate2} title="Ngày đã chọn" />

      <MyDatePicker value={null} disabled placeholder="Disabled" title="Ngày" />

      <MyDatePicker
        value={date1}
        onValueChange={setDate1}
        minDate={minDate}
        maxDate={maxDate}
        placeholder="Chọn trong 2 tháng tới"
        title="Khoảng ngày"
      />

      <MyDatePicker
        value={dateWithFooter}
        onValueChange={setDateWithFooter}
        title="Ngày đã chọn"
        footer={
          <MyButton
            type="tertiary"
            text="Xóa"
            width="full"
            onPress={() => setDateWithFooter(null)}
            elevation={'none'}
          />
        }
      />

      <MyDateRangePicker
        value={range}
        onValueChange={setRange}
        placeholder="Chọn khoảng ngày"
        title="Khoảng ngày"
        footer={<MyButton type="tertiary" text="Xóa" width="full" onPress={() => setRange(null)} />}
      />
    </ScrollView>
  )
}
