import { screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import type { ConfirmationMessage } from '@thinhnguyenvn/chat-core'

import { renderWithTheme } from '@/test/render-with-theme'
import { ColorPaletteLight } from '@/theme/colors'

import MyChatConfirmationMessage from './my-chat-confirmation-message'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
// The confirmation card's thumbnail row loads expo-image, which this Jest env cannot.
jest.mock('@/components/elements/my-image', () => () => null)

/** The light theme's danger colour: the fill of a destructive confirm button. */
const DANGER = ColorPaletteLight.danger

const order = {
  id: 'c1',
  role: 'assistant',
  createdAt: 0,
  status: 'complete',
  kind: 'confirmation',
  prompt: 'Tạo đơn bán (nháp) này?',
  subtitle: 'Nguyễn Văn A · Kho chính',
  icon: 'cart',
  confirmLabel: 'Tạo đơn bán',
  cancelLabel: 'Hủy',
  summary: [
    { label: 'Tổng tiền', value: '85.000đ', style: 'hero' },
    { label: 'Sản phẩm', value: '', style: 'section' },
    {
      label: 'Bia Tiger lon',
      value: '4 Lon × 18.000đ',
      badge: { text: 'Thiếu hàng', tone: 'warning' },
    },
    { label: 'Chi phí', value: '', style: 'section' },
    { label: 'Tạm tính', value: '72.000đ' },
    { label: 'Giảm giá', value: '-2.000đ' },
    { label: 'Phí giao hàng', value: '15.000đ' },
    { label: 'Thanh toán', value: 'Chuyển khoản' },
  ],
} as ConfirmationMessage

const backgroundOf = (text: string) => {
  let node = screen.getByText(text).parent
  while (node) {
    const color = StyleSheet.flatten(node.props.style)?.backgroundColor
    if (color) return color
    node = node.parent
  }
  return undefined
}

describe('MyChatConfirmationMessage (styled)', () => {
  it('draws the header, the hero total, the sections and every row with its badge', () => {
    renderWithTheme(<MyChatConfirmationMessage message={order} onConfirm={jest.fn()} />)

    expect(screen.getByText('Tạo đơn bán (nháp) này?')).toBeTruthy()
    expect(screen.getByText('Nguyễn Văn A · Kho chính')).toBeTruthy()
    expect(screen.getByText('85.000đ')).toBeTruthy()
    expect(screen.getByText('Sản phẩm')).toBeTruthy()
    expect(screen.getByText('Thiếu hàng')).toBeTruthy()
    for (const label of ['Bia Tiger lon', 'Tạm tính', 'Giảm giá', 'Phí giao hàng', 'Thanh toán']) {
      expect(screen.getByText(label)).toBeTruthy()
    }
  })

  it('marks a changed hero and a changed plain row with the info dot', () => {
    const { toJSON } = renderWithTheme(
      <MyChatConfirmationMessage
        message={{ ...order, changedFields: ['Tổng tiền', 'Giảm giá'] }}
        onConfirm={jest.fn()}
      />,
    )
    const dots = JSON.stringify(toJSON()).match(/"width":6,"height":6,"borderRadius":3/g) ?? []

    expect(dots).toHaveLength(2)
  })

  it('draws the confirm button as dangerous only on a destructive card', () => {
    const plain = renderWithTheme(
      <MyChatConfirmationMessage message={order} onConfirm={jest.fn()} />,
    )
    expect(backgroundOf('Tạo đơn bán')).not.toBe(DANGER)
    plain.unmount()

    renderWithTheme(
      <MyChatConfirmationMessage
        message={{ ...order, destructive: true, confirmLabel: 'Hủy đơn', cancelLabel: 'Không' }}
        onConfirm={jest.fn()}
      />,
    )
    expect(backgroundOf('Hủy đơn')).toBe(DANGER)
  })

  it('shows every row even past the result card limit', () => {
    const many = Array.from({ length: 14 }, (_, index) => ({
      label: `Hàng ${index + 1}`,
      value: '1 cái × 1.000đ',
    }))
    renderWithTheme(
      <MyChatConfirmationMessage message={{ ...order, summary: many }} onConfirm={jest.fn()} />,
    )

    expect(screen.getByText('Hàng 14')).toBeTruthy()
    expect(screen.queryByText('components.chat.rowsShown')).toBeNull()
  })
})
