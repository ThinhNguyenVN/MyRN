import { fireEvent } from '@testing-library/react-native'

import { renderWithTheme } from '@/test/render-with-theme'

import { PlanComparisonTable } from './plan-comparison-table'
import { PricingPlanCard } from './pricing-plan-card'
import { StatusSummaryCard } from './status-summary-card'
import { TransferDetails } from './transfer-details'
import { UsageMeter } from './usage-meter'

jest.mock('expo-linear-gradient', () => ({ LinearGradient: () => null }))
jest.mock('@/components/elements/my-image', () => ({ __esModule: true, default: () => null }))

describe('PricingPlanCard', () => {
  const base = {
    name: 'Pro',
    price: '399.000đ',
    pricePeriod: '/ tháng',
    features: ['5 chi nhánh', 'Không giới hạn tin nhắn AI'],
  }

  it('shows price, saving, ribbon and features, and presses through its call to action', () => {
    const onPress = jest.fn()
    const view = renderWithTheme(
      <PricingPlanCard
        {...base}
        featured
        strikePrice="4.788.000đ"
        saving="Tiết kiệm 17%"
        ribbon="Khuyên dùng"
        ctaLabel="Nâng cấp lên Pro"
        onPress={onPress}
        testID="plan-pro"
      />,
    )
    for (const text of ['399.000đ', '/ tháng', '4.788.000đ', 'Tiết kiệm 17%', 'Khuyên dùng']) {
      expect(view.getByText(text)).toBeTruthy()
    }
    expect(view.getByText('Không giới hạn tin nhắn AI')).toBeTruthy()
    fireEvent.press(view.getByTestId('plan-pro'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('has no button and does not press without a call to action', () => {
    const onPress = jest.fn()
    const view = renderWithTheme(<PricingPlanCard {...base} onPress={onPress} testID="plan" />)
    expect(view.queryByTestId('plan-cta')).toBeNull()
    // The card is not a button; `fireEvent.press` would reach the test's own prop, so check
    // what the card exposes instead.
    expect(view.getByTestId('plan').props.accessibilityRole).toBeUndefined()
    expect(view.getByTestId('plan').props.onPress).toBeUndefined()
  })
})

describe('UsageMeter', () => {
  it('says when the limit is reached', () => {
    const view = renderWithTheme(
      <UsageMeter label="AI" used={300} limit={300} valueText="300 / 300" exhaustedText="Hết" />,
    )
    expect(view.getByText('300 / 300')).toBeTruthy()
    expect(view.getByText('Hết')).toBeTruthy()
  })

  it('has no bar and no notice without a limit', () => {
    const view = renderWithTheme(
      <UsageMeter label="AI" used={42} limit={null} valueText="42" exhaustedText="Hết" />,
    )
    expect(view.queryByRole('progressbar')).toBeNull()
    expect(view.queryByText('Hết')).toBeNull()
  })
})

describe('PlanComparisonTable', () => {
  it('renders text values and checks per column', () => {
    const view = renderWithTheme(
      <PlanComparisonTable
        featureLabel="Tính năng"
        columns={[
          { key: 'a', title: 'Cơ bản' },
          { key: 'b', title: 'Pro', highlighted: true },
        ]}
        rows={[
          { key: 'branches', label: 'Chi nhánh', values: ['1', '5'] },
          { key: 'reports', label: 'Báo cáo', values: [false, true] },
        ]}
      />,
    )
    for (const text of ['Tính năng', 'Cơ bản', 'Pro', 'Chi nhánh', '1', '5', 'Báo cáo']) {
      expect(view.getByText(text)).toBeTruthy()
    }
  })
})

describe('StatusSummaryCard', () => {
  it('shows the title, status pill, big figure and its children', () => {
    const view = renderWithTheme(
      <StatusSummaryCard tone="alert" title="Cơ bản" statusLabel="Hết hạn" bigValue="Đã hết hạn">
        <UsageMeter label="AI" used={1} limit={2} valueText="1 / 2" />
      </StatusSummaryCard>,
    )
    for (const text of ['Cơ bản', 'Hết hạn', 'Đã hết hạn', '1 / 2']) {
      expect(view.getByText(text)).toBeTruthy()
    }
  })
})

describe('TransferDetails', () => {
  it('copies the copy value of copyable rows only', () => {
    const onCopy = jest.fn()
    const view = renderWithTheme(
      <TransferDetails
        qrUrl="https://example.com/qr.png"
        rows={[
          { key: 'bank', label: 'Ngân hàng', value: 'Vietcombank' },
          {
            key: 'amount',
            label: 'Số tiền',
            value: '399.000đ',
            copyValue: '399000',
            copyable: true,
          },
        ]}
        onCopy={onCopy}
        copyLabel="Copy"
      />,
    )
    expect(view.getAllByText('Copy')).toHaveLength(1)
    fireEvent.press(view.getByLabelText('Copy Số tiền'))
    expect(onCopy).toHaveBeenCalledWith('399000')
  })
})
