import { screen } from '@testing-library/react-native'
import type { ResultMessage } from '@thinhnguyenvn/chat-core'

import { renderWithTheme } from '@/test/render-with-theme'

import MyChatResultMessage from './my-chat-result-message'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }))

const base: Omit<ResultMessage, 'summary'> = {
  id: 'r1',
  role: 'assistant',
  createdAt: 0,
  status: 'complete',
  kind: 'result',
  title: 'Bán hàng tháng này',
}

describe('MyChatResultMessage', () => {
  it('shows every row of a card without styling, as before', () => {
    renderWithTheme(
      <MyChatResultMessage
        message={{ ...base, summary: [{ label: 'Doanh thu', value: '1.000 đ' }] }}
        onAction={jest.fn()}
      />,
    )

    expect(screen.getByText('Bán hàng tháng này')).toBeTruthy()
    expect(screen.getByText('Doanh thu')).toBeTruthy()
    expect(screen.getByText('1.000 đ')).toBeTruthy()
  })

  it('draws the hero with its trend, the tiles, the section heading and the badge', () => {
    renderWithTheme(
      <MyChatResultMessage
        message={{
          ...base,
          subtitle: '01/10 – 27/10',
          icon: 'chart',
          summary: [
            {
              label: 'Doanh thu',
              value: '48.250.000 đ',
              style: 'hero',
              trend: { direction: 'up', text: '12%', tone: 'positive', note: 'so với kỳ trước' },
            },
            { label: 'Lãi gộp', value: '11.430.000 đ', style: 'kpi' },
            { label: 'Xuất nhiều nhất', value: '', style: 'section' },
            { label: 'Dầu ăn', value: 'Tồn 0', badge: { text: 'Hết hàng', tone: 'warning' } },
          ],
          actions: [{ type: 'navigate', label: 'Xem tổng quan', href: '/dashboard' }],
        }}
        onAction={jest.fn()}
      />,
    )

    expect(screen.getByText('01/10 – 27/10')).toBeTruthy()
    expect(screen.getByText('↑ 12%')).toBeTruthy()
    expect(screen.getByText('so với kỳ trước')).toBeTruthy()
    expect(screen.getByText('11.430.000 đ')).toBeTruthy()
    expect(screen.getByText('Xuất nhiều nhất')).toBeTruthy()
    expect(screen.getByText('Hết hàng')).toBeTruthy()
    expect(screen.getByText('Xem tổng quan')).toBeTruthy()
  })
})
