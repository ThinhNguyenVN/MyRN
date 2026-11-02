import { act, renderHook } from '@testing-library/react-native'

import { formatCountdown, useCountdown } from './use-countdown'

describe('useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-11-01T10:00:00.000Z'))
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('is 0 without a target or with a past target', () => {
    expect(renderHook(() => useCountdown(null)).result.current).toBe(0)
    const past = Date.now() - 1000
    expect(renderHook(() => useCountdown(past)).result.current).toBe(0)
  })

  it('counts down once a second and stops at 0', () => {
    const target = Date.now() + 3000
    const { result } = renderHook(() => useCountdown(target))
    expect(result.current).toBe(3)
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(result.current).toBe(2)
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(result.current).toBe(0)
  })

  it('restarts when the target changes', () => {
    const { result, rerender } = renderHook(({ at }: { at: number | null }) => useCountdown(at), {
      initialProps: { at: null as number | null },
    })
    expect(result.current).toBe(0)
    rerender({ at: Date.now() + 60_000 })
    expect(result.current).toBe(60)
  })
})

describe('formatCountdown', () => {
  it('formats minutes and seconds', () => {
    expect(formatCountdown(0)).toBe('0:00')
    expect(formatCountdown(42)).toBe('0:42')
    expect(formatCountdown(252)).toBe('4:12')
  })
})
