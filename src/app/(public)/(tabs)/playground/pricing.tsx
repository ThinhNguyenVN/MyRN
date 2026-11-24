import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import MySegment from '@/components/elements/my-segment'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import {
  FeatureHighlights,
  PlanComparisonTable,
  PricingPlanCard,
  StatusSummaryCard,
  TransferDetails,
  UsageMeter,
} from '@/components/ui/pricing'
import type { ThemeType } from '@/theme/theme-context'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

type Period = 'month' | 'quarter' | 'year'
type PlanId = 'starter' | 'pro'

/** A sample QR (any image works; a real app passes its VietQR / payment link). */
const SAMPLE_QR = 'https://img.vietqr.io/image/970436-0011001234567-compact.png'

export default function PricingScreen() {
  const styles = useThemedStyles(generateStyles)
  const local = useThemedStyles(generateLocalStyles)
  const { t } = useTranslation()
  const [period, setPeriod] = useState<Period>('year')
  const [selected, setSelected] = useState<PlanId>('pro')

  const periodOptions = useMemo(
    () => [
      { value: 'month' as const, label: t('playground.pricingMonth') },
      { value: 'quarter' as const, label: t('playground.pricingQuarter'), badge: '-5%' },
      { value: 'year' as const, label: t('playground.pricingYear'), badge: '-17%' },
    ],
    [t],
  )
  const yearly = period === 'year'

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="label" style={styles.sectionTitle}>
        StatusSummaryCard + UsageMeter
      </MyText>
      <StatusSummaryCard
        tone="ok"
        label={t('playground.pricingStatusLabel')}
        title={t('playground.pricingStatusTitle')}
        statusLabel={t('playground.pricingStatusPill')}
        caption={t('playground.pricingStatusCaption')}
        bigValue={t('playground.pricingStatusBig')}
        bigCaption={t('playground.pricingStatusBigCaption')}
      >
        <UsageMeter
          label={t('playground.pricingUsageLabel')}
          used={250}
          limit={300}
          valueText="250 / 300"
          style={local.meterInCard}
        />
      </StatusSummaryCard>
      <UsageMeter
        label={t('playground.pricingUsageLabel')}
        used={300}
        limit={300}
        valueText="300 / 300"
        exhaustedText={t('playground.pricingUsageExhausted')}
      />

      <MyText typography="label" style={styles.sectionTitle}>
        MySegment (badge)
      </MyText>
      <MySegment
        options={periodOptions}
        value={period}
        onChange={setPeriod}
        accessibilityLabel={t('playground.linksPricing')}
      />

      <MyText typography="label" style={styles.sectionTitle}>
        PricingPlanCard
      </MyText>
      <MyView style={local.plans}>
        <PricingPlanCard
          name={t('playground.pricingStarter')}
          tagline={t('playground.pricingStarterTagline')}
          price={yearly ? '1.990.000đ' : '199.000đ'}
          pricePeriod={t(yearly ? 'playground.pricingPerYear' : 'playground.pricingPerMonth')}
          strikePrice={yearly ? '2.388.000đ' : undefined}
          saving={yearly ? t('playground.pricingSaving') : undefined}
          currentLabel={t('playground.pricingCurrent')}
          featuresTitle={t('playground.pricingIncludes')}
          features={[
            t('playground.pricingFeatureBranches', { count: 1 }),
            t('playground.pricingFeatureMembers', { count: 3 }),
            t('playground.pricingFeatureAiCount', { count: 300 }),
            t('playground.pricingFeatureAll'),
          ]}
          ctaLabel={t('playground.pricingRenew')}
          onPress={() => setSelected('starter')}
          selected={selected === 'starter'}
        />
        <PricingPlanCard
          featured
          name={t('playground.pricingPro')}
          tagline={t('playground.pricingProTagline')}
          price={yearly ? '3.990.000đ' : '399.000đ'}
          pricePeriod={t(yearly ? 'playground.pricingPerYear' : 'playground.pricingPerMonth')}
          strikePrice={yearly ? '4.788.000đ' : undefined}
          saving={yearly ? t('playground.pricingSaving') : undefined}
          ribbon={t('playground.pricingRibbon')}
          featuresTitle={t('playground.pricingIncludes')}
          features={[
            t('playground.pricingFeatureBranches', { count: 5 }),
            t('playground.pricingFeatureMembers', { count: 15 }),
            t('playground.pricingFeatureAi'),
            t('playground.pricingFeatureAll'),
          ]}
          ctaLabel={t('playground.pricingUpgrade')}
          onPress={() => setSelected('pro')}
          selected={selected === 'pro'}
        />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        PlanComparisonTable
      </MyText>
      <PlanComparisonTable
        featureLabel={t('playground.pricingCompareFeature')}
        columns={[
          { key: 'starter', title: t('playground.pricingStarter') },
          { key: 'pro', title: t('playground.pricingPro'), highlighted: true },
        ]}
        rows={[
          { key: 'branches', label: t('playground.pricingCompareBranches'), values: ['1', '5'] },
          { key: 'members', label: t('playground.pricingCompareMembers'), values: ['3', '15'] },
          { key: 'reports', label: t('playground.pricingCompareReports'), values: [true, true] },
        ]}
      />

      <MyText typography="label" style={styles.sectionTitle}>
        FeatureHighlights
      </MyText>
      <FeatureHighlights
        items={[
          {
            key: 'pay',
            icon: 'shield-checkmark-outline',
            title: t('playground.pricingHighlightPay'),
            body: t('playground.pricingHighlightPayBody'),
          },
          {
            key: 'data',
            icon: 'server-outline',
            title: t('playground.pricingHighlightData'),
            body: t('playground.pricingHighlightDataBody'),
          },
          {
            key: 'support',
            icon: 'headset-outline',
            title: t('playground.pricingHighlightSupport'),
            body: t('playground.pricingHighlightSupportBody'),
          },
        ]}
      />

      <MyText typography="label" style={styles.sectionTitle}>
        TransferDetails
      </MyText>
      <TransferDetails
        steps={[
          {
            key: 'scan',
            icon: 'qr-code-outline',
            title: t('playground.pricingStepScan'),
            body: t('playground.pricingStepScanBody'),
          },
          {
            key: 'keep',
            icon: 'create-outline',
            title: t('playground.pricingStepKeep'),
            body: t('playground.pricingStepKeepBody'),
          },
          {
            key: 'wait',
            icon: 'checkmark-done-outline',
            title: t('playground.pricingStepWait'),
            body: t('playground.pricingStepWaitBody'),
          },
        ]}
        qrUrl={SAMPLE_QR}
        qrHint={t('playground.pricingQrHint')}
        rows={[
          { key: 'bank', label: t('playground.pricingBank'), value: 'Vietcombank' },
          {
            key: 'account',
            label: t('playground.pricingAccount'),
            value: '0011001234567',
            copyable: true,
          },
          {
            key: 'amount',
            label: t('playground.pricingAmount'),
            value: '3.990.000đ',
            copyValue: '3990000',
            copyable: true,
            emphasis: true,
          },
          {
            key: 'content',
            label: t('playground.pricingContentKeep'),
            value: 'MYSTORE DEMO',
            copyable: true,
            highlight: true,
            hint: t('playground.pricingContentHint'),
          },
        ]}
        onCopy={() => undefined}
        copyLabel={t('playground.pricingCopy')}
        note={t('playground.pricingNote')}
      />
    </ScrollView>
  )
}

function generateLocalStyles(theme: ThemeType) {
  const { getSpacing, isMobileSize } = theme
  return StyleSheet.create({
    meterInCard: {
      marginTop: getSpacing('x2'),
    },
    plans: {
      flexDirection: isMobileSize ? 'column' : 'row',
      gap: getSpacing('x5'),
    },
  })
}
