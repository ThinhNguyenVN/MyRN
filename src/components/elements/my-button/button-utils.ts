import type { ViewStyle } from 'react-native'

import type { ButtonType, ButtonWidth } from './type'

export function isButtonInteractionLocked(disabled: boolean, loading: boolean): boolean {
  return disabled || loading
}

export function shouldRenderButtonLabel(text: string | undefined, loading: boolean): boolean {
  return !loading && Boolean(text)
}

export function usesOnPrimaryButtonText(type: ButtonType, disabled: boolean): boolean {
  return type === 'primary' || type === 'dark' || type === 'tertiary' || disabled
}

export function getButtonWidthStyle(width: ButtonWidth): ViewStyle | null {
  switch (width) {
    case 'full':
      return { width: '100%', alignSelf: 'stretch', flexShrink: 1 }
    case 'auto':
      // `flex: 0` must override `touchable.flex: 1`. Leaving `flex: 1` collapses
      // auto-width buttons to padding-only (label clipped by overflow: hidden).
      return {
        flex: 0,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: 'auto',
      }
    default:
      return {
        width,
        flex: 0,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: 'auto',
      }
  }
}
