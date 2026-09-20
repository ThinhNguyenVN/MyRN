import { fireEvent, screen } from '@testing-library/react-native'
import * as WebBrowser from 'expo-web-browser'

import { renderWithTheme } from '@/test/render-with-theme'

import MyChatActionRow from './my-chat-action-row'
import type { MessageAction } from './types'

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(() => Promise.resolve()),
}))

describe('MyChatActionRow', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('opens the browser for external_link and does not call onAction', () => {
    const onAction = jest.fn()
    const actions: MessageAction[] = [
      { type: 'external_link', label: 'Docs', url: 'https://example.com' },
    ]

    renderWithTheme(<MyChatActionRow actions={actions} onAction={onAction} />)
    fireEvent.press(screen.getByText('Docs'))

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('https://example.com')
    expect(onAction).not.toHaveBeenCalled()
  })

  it('forwards navigate and custom actions to onAction without opening a browser', () => {
    const onAction = jest.fn()
    const actions: MessageAction[] = [
      { type: 'navigate', label: 'Go', href: '/playground' },
      { type: 'custom', label: 'Do', id: 'x', payload: { a: 1 } },
    ]

    renderWithTheme(<MyChatActionRow actions={actions} onAction={onAction} />)
    fireEvent.press(screen.getByText('Go'))
    fireEvent.press(screen.getByText('Do'))

    expect(onAction).toHaveBeenCalledWith(actions[0])
    expect(onAction).toHaveBeenCalledWith(actions[1])
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled()
  })
})
