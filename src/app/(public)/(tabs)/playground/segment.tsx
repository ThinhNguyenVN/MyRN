import { useMemo, useState } from 'react'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MySegment from '@/components/elements/my-segment'
import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

type BillingId = 'month' | 'year'
type RangeId = 'day' | 'week' | 'month'

export default function SegmentScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [billing, setBilling] = useState<BillingId>('month')
  const [range, setRange] = useState<RangeId>('week')

  const billingOptions = useMemo(
    () => [
      { value: 'month' as const, label: t('playground.segmentBillingMonth') },
      { value: 'year' as const, label: t('playground.segmentBillingYear') },
    ],
    [t],
  )
  const rangeOptions = useMemo(
    () => [
      { value: 'day' as const, label: t('playground.segmentRangeDay') },
      { value: 'week' as const, label: t('playground.segmentRangeWeek') },
      { value: 'month' as const, label: t('playground.segmentRangeMonth') },
    ],
    [t],
  )

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.segmentLabeledTitle')}
      </MyText>
      <MySegment
        options={billingOptions}
        value={billing}
        onChange={setBilling}
        accessibilityLabel={t('playground.segmentLabeledTitle')}
      />

      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.segmentManyTitle')}
      </MyText>
      <MySegment
        options={rangeOptions}
        value={range}
        onChange={setRange}
        size="compact"
        accessibilityLabel={t('playground.segmentManyTitle')}
      />
    </ScrollView>
  )
}
