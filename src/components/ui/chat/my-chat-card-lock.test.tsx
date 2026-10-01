import { screen } from '@testing-library/react-native'

import { renderWithTheme } from '@/test/render-with-theme'

import MyChatConfirmationMessage from './my-chat-confirmation-message'
import MyChatOptionsMessage from './my-chat-options-message'
import type { ConfirmationMessage, OptionsMessage } from './types'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const confirmation: ConfirmationMessage = {
  id: 'c1',
  role: 'assistant',
  createdAt: 0,
  status: 'complete',
  kind: 'confirmation',
  prompt: 'Tạo?',
  confirmLabel: 'Tạo',
  cancelLabel: 'Bỏ',
  summary: [
    { label: 'Tên', value: 'Áo' },
    { label: 'Giá', value: '100đ' },
  ],
}

const options: OptionsMessage = {
  id: 'o1',
  role: 'assistant',
  createdAt: 0,
  status: 'complete',
  kind: 'options',
  prompt: 'Chọn',
  options: [{ id: 'a', label: 'Kho A' }],
}

describe('card lock rendering', () => {
  it('removes the confirmation buttons and shows the lock label over a local resolution', () => {
    renderWithTheme(
      <MyChatConfirmationMessage
        message={{ ...confirmation, resolution: 'confirmed', lockState: 'expired' }}
        onConfirm={jest.fn()}
      />,
    )

    expect(screen.queryByText('Tạo')).toBeNull()
    expect(screen.queryByText('Bỏ')).toBeNull()
    expect(screen.getByText('components.chat.cardExpired')).toBeTruthy()
    expect(screen.queryByText('components.chat.confirmed')).toBeNull()
    expect(screen.getByText('Tên')).toBeTruthy()
  })

  it('removes the option chips when the card is superseded', () => {
    renderWithTheme(
      <MyChatOptionsMessage
        message={{ ...options, lockState: 'superseded' }}
        onSelectOption={jest.fn()}
      />,
    )

    expect(screen.queryByText('Kho A')).toBeNull()
    expect(screen.getByText('components.chat.cardSuperseded')).toBeTruthy()
  })

  it('keeps buttons and chips when the card is not locked', () => {
    renderWithTheme(<MyChatConfirmationMessage message={confirmation} onConfirm={jest.fn()} />)
    expect(screen.getByText('Tạo')).toBeTruthy()
  })

  it('renders every summary row, changed or not', () => {
    renderWithTheme(
      <MyChatConfirmationMessage
        message={{ ...confirmation, changedFields: ['Giá', 'Không có'] }}
        onConfirm={jest.fn()}
      />,
    )

    expect(screen.getByText('Giá')).toBeTruthy()
    expect(screen.getByText('100đ')).toBeTruthy()
    expect(screen.getByText('Tên')).toBeTruthy()
  })
})
