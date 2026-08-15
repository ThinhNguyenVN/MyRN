import {
  getButtonWidthStyle,
  isButtonInteractionLocked,
  shouldRenderButtonLabel,
  usesOnPrimaryButtonText,
} from './button-utils'

describe('button-utils', () => {
  it('locks press when disabled or loading', () => {
    expect(isButtonInteractionLocked(false, false)).toBe(false)
    expect(isButtonInteractionLocked(true, false)).toBe(true)
    expect(isButtonInteractionLocked(false, true)).toBe(true)
  })

  it('hides the label while loading or when text is empty', () => {
    expect(shouldRenderButtonLabel('Save', false)).toBe(true)
    expect(shouldRenderButtonLabel('Save', true)).toBe(false)
    expect(shouldRenderButtonLabel(undefined, false)).toBe(false)
    expect(shouldRenderButtonLabel('', false)).toBe(false)
  })

  it('uses on-primary text for filled and disabled types', () => {
    expect(usesOnPrimaryButtonText('primary', false)).toBe(true)
    expect(usesOnPrimaryButtonText('dark', false)).toBe(true)
    expect(usesOnPrimaryButtonText('tertiary', false)).toBe(true)
    expect(usesOnPrimaryButtonText('secondary', true)).toBe(true)
    expect(usesOnPrimaryButtonText('secondary', false)).toBe(false)
    expect(usesOnPrimaryButtonText('light', false)).toBe(false)
  })

  it('resolves full, auto, and numeric width styles', () => {
    expect(getButtonWidthStyle('full')).toEqual({
      width: '100%',
      alignSelf: 'stretch',
      flexShrink: 1,
    })
    expect(getButtonWidthStyle('auto')).toEqual({
      flex: 0,
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: 'auto',
    })
    expect(getButtonWidthStyle(160)).toMatchObject({ width: 160, flex: 0 })
  })
})
