import { useMemo } from 'react'
import type { ViewStyle } from 'react-native'
import { useAnimatedStyle, type SharedValue } from 'react-native-reanimated'
import { isNil } from 'lodash'

import { isAndroid, isIos, isWeb } from '@/constants/dimensions'
import { getElevation, type ElevationToken } from '@/theme/elevation'
import { Radius } from '@/theme/radius'
import { useTheme } from '@/theme/theme-context'

/** Corner radius shared by `clip` (styles.ts) and both card-shell layers — keep all three in
 *  sync, since the shell's shadow/border must trace the exact same rounded rect `clip` clips
 *  content to. */
export const CARD_SHELL_RADIUS = Radius.large

const ANDROID_ELEVATION_MIN = 2
/** Matches MySurface's own placeholder-elevation fallback (`ANDROID_PLACEHOLDER_ELEVATION_DIVISOR`
 *  in my-surface.tsx) — keep these two in sync if that value ever changes. */
const ANDROID_ELEVATION_DIVISOR = 4

/**
 * Card shadow/border are two separate layers, both animated with the same `translateX` as the
 * content so they slide together with it instead of staying fixed while the row opens underneath
 * — and both are *siblings* of the clip container instead of descendants, since a shadow/border
 * set on something inside `clip` gets cut by its `overflow: hidden` (needed to hide the reveal
 * strips), no matter how much it would otherwise bleed.
 *
 * The caller renders them on opposite sides of `clip` in its JSX, because they have conflicting
 * requirements:
 * - The shadow layer needs an *opaque* background for iOS to derive a crisp, radius-aware
 *   shadowPath from it (a fully transparent shadow-casting view renders a soft, ill-defined
 *   shadow on iOS, regardless of how small the blur value is) — so it has to render *behind*
 *   `clip`, where that opaque fill is always hidden under `clip`'s own content.
 * - The border layer has to render *after* `clip` (on top of it) so it isn't hidden behind a
 *   revealed action strip's own opaque background the moment it slides under where the border
 *   would show — which means it must stay fully transparent itself, or it would hide `children`
 *   every time it's on top of them.
 */
export function useCardShell(
  elevation: ElevationToken | 'none' | undefined,
  translateX: SharedValue<number>,
) {
  const { getColor } = useTheme()
  const hasElevation = !isNil(elevation) && elevation !== 'none'

  const shadowLayerStyle = useMemo((): ViewStyle => {
    if (!hasElevation) return {}
    const { blur, opacity, dx, dy } = getElevation(elevation as ElevationToken)
    const base: ViewStyle = {
      borderRadius: CARD_SHELL_RADIUS,
      backgroundColor: getColor('fill/background/tertiary'),
      // A view with an opaque backgroundColor + borderRadius clips its own shadow by default
      // (RN/iOS treats it like `masksToBounds`) unless overflow is explicitly 'visible' — see
      // MySurface, which relies on the same override for its own shadow.
      overflow: 'visible',
    }
    if (isIos || isWeb) {
      base.shadowColor = getColor('brand/black')
      base.shadowOffset = { width: dx, height: dy }
      base.shadowOpacity = opacity
      base.shadowRadius = blur
    }
    if (isAndroid) {
      // Approximate — the precise SVG-based shadow MySurface otherwise draws can't be driven by
      // a worklet transform.
      base.elevation = Math.max(ANDROID_ELEVATION_MIN, Math.round(blur / ANDROID_ELEVATION_DIVISOR))
    }
    return base
  }, [hasElevation, elevation, getColor])

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return { hasElevation, shadowLayerStyle, cardAnimatedStyle }
}
