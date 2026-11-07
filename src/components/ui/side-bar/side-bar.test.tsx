import { act, fireEvent, screen } from '@testing-library/react-native'
import type { StyleProp, ViewStyle } from 'react-native'

import { renderWithTheme } from '@/test/render-with-theme'

import SideBar from './side-bar'
import type { SideBarItem, SideBarSelection } from './type'
import { computeSidebarHighlightY } from './utils'

jest.mock('expo-router', () => ({
  usePathname: () => '/inbound',
}))

jest.mock('@/constants/dimensions', () => ({
  ...jest.requireActual('@/constants/dimensions'),
  isWeb: true,
}))

const data: SideBarItem[] = [
  { label: 'Inbound', href: '/inbound', showChevron: false },
  { label: 'Report', href: '/inventory-report', showChevron: false },
]

const inboundY = computeSidebarHighlightY(data, 0, false)
const reportY = computeSidebarHighlightY(data, 1, false)

function translateY(style: StyleProp<ViewStyle>): number | undefined {
  if (!style) {
    return undefined
  }
  if (Array.isArray(style)) {
    let found: number | undefined
    for (const item of style) {
      const y = translateY(item as StyleProp<ViewStyle>)
      if (y !== undefined) {
        found = y
      }
    }
    return found
  }
  if (typeof style !== 'object' || !('transform' in style) || !Array.isArray(style.transform)) {
    return undefined
  }
  let found: number | undefined
  for (const step of style.transform) {
    if (
      step &&
      typeof step === 'object' &&
      'translateY' in step &&
      typeof step.translateY === 'number'
    ) {
      found = step.translateY
    }
  }
  return found
}

function highlightY(): number | undefined {
  return translateY(screen.getByTestId('sidebar-active-highlight').props.style)
}

describe('SideBar selection highlight', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('keeps the current item active when leaving is cancelled', async () => {
    let resolveSelection: (value: SideBarSelection) => void = () => undefined
    const navigate = jest.fn()
    const onSelected = jest.fn(
      () =>
        new Promise<SideBarSelection>((resolve) => {
          resolveSelection = resolve
        }),
    )

    renderWithTheme(<SideBar data={data} onSelected={onSelected} />)
    expect(highlightY()).toBe(inboundY)

    fireEvent.press(screen.getByLabelText('Report'))
    expect(highlightY()).toBe(inboundY)

    await act(async () => {
      resolveSelection(false)
    })

    expect(highlightY()).toBe(inboundY)
    expect(navigate).not.toHaveBeenCalled()

    await act(async () => {
      jest.advanceTimersByTime(200)
    })
    expect(highlightY()).toBe(inboundY)
  })

  it('moves the highlight before navigating once leaving is accepted', async () => {
    const navigate = jest.fn()
    const onSelected = jest.fn(() => Promise.resolve<SideBarSelection>(navigate))

    renderWithTheme(<SideBar data={data} onSelected={onSelected} />)

    fireEvent.press(screen.getByLabelText('Report'))
    expect(navigate).not.toHaveBeenCalled()

    await act(async () => {
      await Promise.resolve()
    })

    expect(highlightY()).toBe(reportY)
    expect(navigate).not.toHaveBeenCalled()

    await act(async () => {
      jest.advanceTimersByTime(159)
    })
    expect(navigate).not.toHaveBeenCalled()

    await act(async () => {
      jest.advanceTimersByTime(1)
    })
    expect(navigate).toHaveBeenCalledTimes(1)
  })
})
