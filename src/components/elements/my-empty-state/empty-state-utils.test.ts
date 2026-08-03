import { shouldShowEmptyStateAction, shouldShowEmptyStateSubtitle } from './empty-state-utils'

describe('empty-state-utils', () => {
  it('shows subtitle when non-empty', () => {
    expect(shouldShowEmptyStateSubtitle('Hello')).toBe(true)
    expect(shouldShowEmptyStateSubtitle('')).toBe(false)
    expect(shouldShowEmptyStateSubtitle(undefined)).toBe(false)
  })

  it('shows action only when label and handler exist', () => {
    const onPress = jest.fn()
    expect(shouldShowEmptyStateAction('Go', onPress)).toBe(true)
    expect(shouldShowEmptyStateAction('Go', undefined)).toBe(false)
    expect(shouldShowEmptyStateAction(undefined, onPress)).toBe(false)
  })
})
