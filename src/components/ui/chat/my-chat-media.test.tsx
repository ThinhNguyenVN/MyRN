import React from 'react'
import { fireEvent, screen } from '@testing-library/react-native'
import type { ConfirmationMessage, MediaChoiceMessage } from '@thinhnguyenvn/chat-core'

import { renderWithTheme } from '@/test/render-with-theme'

import MyChatConfirmationMessage from './my-chat-confirmation-message'
import MyChatMediaChoiceMessage from './my-chat-media-choice-message'
import { MyChatMediaProvider } from './my-chat-media-context'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
  }),
}))
jest.mock('@/components/elements/my-image', () => {
  const { Text } = jest.requireActual('react-native')
  function MockImage({ url, headers }: { url: string; headers?: Record<string, string> }) {
    return <Text>{`img:${url}${headers ? ` ${JSON.stringify(headers)}` : ''}`}</Text>
  }
  return MockImage
})

const confirmation: ConfirmationMessage = {
  id: 'c1',
  role: 'assistant',
  createdAt: 0,
  status: 'complete',
  kind: 'confirmation',
  prompt: 'Tạo?',
  media: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
}

const choice: MediaChoiceMessage = {
  id: 'mc1',
  role: 'assistant',
  createdAt: 0,
  status: 'complete',
  kind: 'media_choice',
  prompt: 'Chọn ảnh',
  media: ['m1', 'm2', 'm3'],
  min: 1,
  max: 2,
}

const localUris = new Map([
  ['m1', 'file:///m1.jpg'],
  ['m2', 'file:///m2.jpg'],
  ['m3', 'file:///m3.jpg'],
])

describe('confirmation thumbnails', () => {
  it('shows 4 thumbnails and +N for the rest', () => {
    renderWithTheme(
      <MyChatMediaProvider value={{ localUris }}>
        <MyChatConfirmationMessage message={confirmation} onConfirm={jest.fn()} />
      </MyChatMediaProvider>,
    )

    expect(screen.getByText('img:file:///m1.jpg')).toBeTruthy()
    expect(screen.getByText('+3')).toBeTruthy()
    expect(screen.queryByText('img:file:///m5.jpg')).toBeNull()
  })

  it('loads ids with no local URI from the adapter source, with its headers', async () => {
    const mediaSource = jest.fn(async (id: string) => ({
      uri: `http://x/media/${id}`,
      headers: { 'X-Chat-Session': 's1' },
    }))
    renderWithTheme(
      <MyChatMediaProvider value={{ localUris: new Map(), mediaSource }}>
        <MyChatConfirmationMessage
          message={{ ...confirmation, media: ['m9'] }}
          onConfirm={jest.fn()}
        />
      </MyChatMediaProvider>,
    )

    expect(await screen.findByText('img:http://x/media/m9 {"X-Chat-Session":"s1"}')).toBeTruthy()
  })
})

describe('media_choice card', () => {
  it('enables submit only within min..max and sends the ids in card order', () => {
    const onSelectMedia = jest.fn()
    renderWithTheme(
      <MyChatMediaProvider value={{ localUris }}>
        <MyChatMediaChoiceMessage message={choice} onSelectMedia={onSelectMedia} />
      </MyChatMediaProvider>,
    )
    const cells = screen.getAllByRole('checkbox')
    const submit = () => fireEvent.press(screen.getByText(/components\.chat\.mediaSubmit/))

    submit()
    expect(onSelectMedia).not.toHaveBeenCalled()

    fireEvent.press(cells[2]!)
    fireEvent.press(cells[0]!)
    expect(screen.getByText('components.chat.mediaSelectedCount {"count":2,"max":2}')).toBeTruthy()

    fireEvent.press(cells[1]!)
    submit()
    expect(onSelectMedia).toHaveBeenCalledWith('mc1', ['m1', 'm3'])
  })

  it('shows the pick instead of the grid once answered', () => {
    renderWithTheme(
      <MyChatMediaProvider value={{ localUris }}>
        <MyChatMediaChoiceMessage
          message={{ ...choice, selectedMediaIds: ['m2'] }}
          onSelectMedia={jest.fn()}
        />
      </MyChatMediaProvider>,
    )

    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
    expect(screen.getByText('img:file:///m2.jpg')).toBeTruthy()
    expect(screen.getByText('components.chat.mediaSelected {"count":1}')).toBeTruthy()
  })
})
