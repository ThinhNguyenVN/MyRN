import { isCardPressable } from './card-utils'

describe('isCardPressable', () => {
  it('is true only when onPress is a function', () => {
    expect(isCardPressable(undefined)).toBe(false)
    expect(isCardPressable(jest.fn())).toBe(true)
  })
})
