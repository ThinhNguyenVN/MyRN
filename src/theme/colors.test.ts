import { TokensDark, TokensLight, getColor } from './colors'

describe('colors token: text/icon contrast', () => {
  it('text/contrast resolves to gray900 (light) / white (dark) per theme', () => {
    expect(getColor('text/contrast/light', TokensLight)).toBe(TokensLight.text.contrast.light)
    expect(getColor('text/contrast/dark', TokensLight)).toBe(TokensLight.text.contrast.dark)
    expect(getColor('text/contrast/light', TokensDark)).toBe(TokensDark.text.contrast.light)
    expect(getColor('text/contrast/dark', TokensDark)).toBe(TokensDark.text.contrast.dark)
  })

  it('icon/contrast resolves the same way as text/contrast', () => {
    expect(getColor('icon/contrast/light', TokensLight)).toBe(TokensLight.icon.contrast.light)
    expect(getColor('icon/contrast/dark', TokensLight)).toBe(TokensLight.icon.contrast.dark)
  })
})

describe('colors token: icon.active ladder stays monotonic', () => {
  it('icon.active.tertiary no longer breaks the ladder with white', () => {
    expect(TokensLight.icon.active.tertiary).toBe(TokensLight.text.active.tertiary)
    expect(TokensLight.icon.active.tertiary).not.toBe(TokensLight.icon.contrast.dark)
  })
})
