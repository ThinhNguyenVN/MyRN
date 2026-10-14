import { screen } from '@testing-library/react-native'
import type { ResultMessage, TextMessage } from '@thinhnguyenvn/chat-core'

import { renderWithTheme } from '@/test/render-with-theme'

import MyChatResultMessage from './my-chat-result-message'
import MyChatTextMessage from './my-chat-text-message'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key} ${JSON.stringify(vars)}` : key,
  }),
}))

jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }))

const rows = (count: number) =>
  Array.from({ length: count }, (_, at) => ({ label: `Đơn ${at + 1}`, value: '1đ' }))

const result = (count: number): ResultMessage => ({
  id: 'r1',
  role: 'assistant',
  createdAt: 0,
  status: 'complete',
  kind: 'result',
  title: 'Đơn bán',
  summary: rows(count),
})

describe('MyChat E1 fixes', () => {
  it('renders the assistant words as markdown, without the ** marks', () => {
    const message: TextMessage = {
      id: 't1',
      role: 'assistant',
      createdAt: 0,
      status: 'complete',
      kind: 'text',
      text: 'Tồn **B** âm:\n\n- TEST CN\n- Kho chính',
    }
    renderWithTheme(<MyChatTextMessage message={message} />)
    expect(screen.getByText('B')).toBeTruthy()
    expect(screen.getByText('TEST CN')).toBeTruthy()
    expect(screen.queryByText(/\*\*/)).toBeNull()
  })

  it('cuts a long result card and says how many rows show', () => {
    renderWithTheme(<MyChatResultMessage message={result(12)} onAction={() => undefined} />)
    expect(screen.queryByText('Đơn 11')).toBeNull()
    expect(screen.getByText(/components\.chat\.rowsShown/)).toBeTruthy()
  })

  it('shows a short result card whole, with no count line', () => {
    renderWithTheme(<MyChatResultMessage message={result(3)} onAction={() => undefined} />)
    expect(screen.getByText('Đơn 3')).toBeTruthy()
    expect(screen.queryByText(/rowsShown/)).toBeNull()
  })
})
