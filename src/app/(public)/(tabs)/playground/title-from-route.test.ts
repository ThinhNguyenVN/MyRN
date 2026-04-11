import { titleFromRoute } from './title-from-route'

describe('titleFromRoute', () => {
  it('removes nested index suffix and keeps localized key for my-list route', () => {
    expect(titleFromRoute('my-list/index')).toBe('playground.linksMyList')
  })

  it('keeps existing explicit key mappings', () => {
    expect(titleFromRoute('swipeable-item')).toBe('playground.swipeableItem')
    expect(titleFromRoute('toast')).toBe('playground.toastAndConfirmation')
  })

  it('formats fallback route labels', () => {
    expect(titleFromRoute('wheel-picker')).toBe('Wheel Picker')
  })
})
