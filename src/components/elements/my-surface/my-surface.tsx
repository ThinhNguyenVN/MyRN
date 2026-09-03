import React, { memo, useCallback, useId, useMemo, useRef, useState } from 'react'
import { View, type ViewStyle, LayoutChangeEvent, StyleSheet } from 'react-native'
import Svg, { Defs, FeGaussianBlur, Filter, Rect } from 'react-native-svg'

import { isAndroid, isIos, isWeb } from '@/constants/dimensions'
import { type ElevationToken, getElevation } from '@/theme/elevation'
import { Radius } from '@/theme/radius'

import type { MySurfaceProps } from './type'
import { splitSurfaceStyle } from './utils'

/** Android SVG shadow: giảm đậm, tăng blur (tránh shadow quá đậm/sắc) */
const ANDROID_OPACITY_FACTOR = 0.5
const ANDROID_BLUR_FACTOR = 2
/** Native `elevation` (dp) shown on Android for the one render before layout is measured and
 *  the real SVG shadow can be sized — rough, since it's only ever visible for a frame. */
const ANDROID_PLACEHOLDER_ELEVATION_DIVISOR = 4
const ANDROID_PLACEHOLDER_ELEVATION_MIN = 2

const MIN_INSET = 16
/** Gaussian blur extends ~3× stdDeviation; inset cần đủ để shadow không bị cắt */
const BLUR_EXTENT_FACTOR = 3

const MySurface: React.FC<MySurfaceProps> = ({
  elevation = 'soft',
  radius = 'none',
  backgroundColor,
  style,
  children,
  fillParent = false,
  ...rest
}) => {
  // useId() never changes for the component's lifetime — memoize so the regex only runs once.
  const rawId = useId()
  const filterId = useMemo(() => rawId.replace(/:/g, ''), [rawId])
  const fs = useMemo(() => {
    if (!style) return {}
    return StyleSheet.flatten(style)
  }, [style])

  const hasStaticSize = typeof fs.width === 'number' && typeof fs.height === 'number'

  const sizeRef = useRef<{ w: number; h: number }>({
    w: hasStaticSize ? (fs.width as number) : 0,
    h: hasStaticSize ? (fs.height as number) : 0,
  })
  const [, forceUpdate] = useState(0)

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (hasStaticSize) return
      const { width, height } = e.nativeEvent.layout
      const s = sizeRef.current
      if (s.w !== width || s.h !== height) {
        sizeRef.current = { w: width, h: height }
        forceUpdate((x) => x + 1)
      }
    },
    [hasStaticSize],
  )

  /** Khi có width/height (số) trong style thì dùng luôn; không thì dùng size từ onLayout */
  const w = hasStaticSize ? (fs.width as number) : sizeRef.current.w
  const h = hasStaticSize ? (fs.height as number) : sizeRef.current.h

  const { resolvedBackgroundColor, styleWithoutBg } = useMemo(() => {
    const bgColor = backgroundColor ?? fs.backgroundColor ?? 'transparent'
    const { backgroundColor: _bg, ...rest } = fs
    return { resolvedBackgroundColor: bgColor, styleWithoutBg: rest }
  }, [backgroundColor, fs])

  const { containerStyle, contentStyle } = useMemo(() => {
    const split = splitSurfaceStyle(styleWithoutBg)
    const contentBase = fillParent ? { flex: 1, ...split.contentStyle } : { ...split.contentStyle }
    return {
      containerStyle: split.containerStyle,
      contentStyle: contentBase,
    }
  }, [styleWithoutBg, fillParent])

  // Khi có elevation: outer PHẢI overflow visible để shadow không bị cắt
  // overflow: 'hidden' từ user → chuyển xuống inner content để clip children
  const hasUserOverflowHidden = fs.overflow === 'hidden'

  const elevationConfig = useMemo(() => getElevation(elevation as ElevationToken), [elevation])
  const { dx, dy, blur, opacity } = elevationConfig
  const r = Radius[radius]
  /** Android: giảm đậm, tăng blur — SVG shadow render đậm hơn iOS/Web */
  const shadowBlur = isAndroid ? blur * ANDROID_BLUR_FACTOR : blur
  const shadowOpacity = isAndroid ? opacity * ANDROID_OPACITY_FACTOR : opacity

  const borderWidth = typeof fs.borderWidth === 'number' ? fs.borderWidth : 0
  const borderColor = typeof fs.borderColor === 'string' ? fs.borderColor : undefined
  const borderStyle = fs.borderStyle

  // Inset đủ để shadow (blur + offset) không bị cắt
  const blurExtent = Math.ceil(shadowBlur * BLUR_EXTENT_FACTOR)
  const insetTop = Math.max(MIN_INSET, blurExtent + Math.max(0, -dy))
  const insetBottom = Math.max(MIN_INSET, blurExtent + Math.max(0, dy))
  const insetLeft = Math.max(MIN_INSET, blurExtent + Math.max(0, -dx))
  const insetRight = Math.max(MIN_INSET, blurExtent + Math.max(0, dx))

  const svgWidth = w + insetLeft + insetRight
  const svgHeight = h + insetTop + insetBottom
  const fillX = insetLeft
  const fillY = insetTop
  const shadowX = insetLeft + dx
  const shadowY = insetTop + dy
  const svgStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      left: -insetLeft,
      top: -insetTop,
    }),
    [insetLeft, insetTop],
  )

  // SVG shadow needs a measured size first — before that (one render, right after mount),
  // fall back to Android's native `elevation` shadow so the surface isn't shadowless.
  const needsSvgShadow = isAndroid && elevation && elevation !== 'none' && w > 0 && h > 0
  const androidPlaceholderElevation = Math.max(
    ANDROID_PLACEHOLDER_ELEVATION_MIN,
    Math.round(blur / ANDROID_PLACEHOLDER_ELEVATION_DIVISOR),
  )

  const finalContainerStyle = useMemo(() => {
    const base: Record<string, unknown> = { ...containerStyle }
    // Outer container owns the shadow; inner content can safely clip children.
    if (elevation && elevation !== 'none') {
      base.overflow = 'visible'

      if (isIos) {
        base.backgroundColor = resolvedBackgroundColor
        base.borderRadius = r
        base.shadowColor = '#000'
        base.shadowOffset = { width: dx, height: dy }
        base.shadowOpacity = opacity
        base.shadowRadius = blur
      }

      // Web: CSS boxShadow must live on the outer (overflow: visible) container — if it were on
      // the inner content, a caller's `overflow: 'hidden'` (for rounded-corner clipping) would
      // clip the shadow itself, since box-shadow is clipped by its own element's overflow.
      if (isWeb) {
        base.borderRadius = r
        base.boxShadow = `${dx}px ${dy}px ${blur * 2}px rgba(0,0,0,${opacity})`
      }
    }
    return base as ViewStyle
  }, [containerStyle, elevation, resolvedBackgroundColor, r, dx, dy, opacity, blur])

  // Inner content: clip, border, background. iOS/Web shadow lives on the outer container
  // (above); Android: SVG (+ a native-elevation stand-in for the render before that SVG has a
  // measured size).
  const finalContentStyle = useMemo(() => {
    const base: ViewStyle = { ...contentStyle }
    if (!(elevation && elevation !== 'none')) return base

    base.backgroundColor = resolvedBackgroundColor as string
    base.borderRadius = r
    if (borderWidth > 0) {
      base.borderWidth = borderWidth
      base.borderColor = borderColor
      if (borderStyle) base.borderStyle = borderStyle
    }
    if (hasUserOverflowHidden) base.overflow = 'hidden'

    if (isAndroid && !needsSvgShadow) {
      base.elevation = androidPlaceholderElevation
    }
    return base
  }, [
    contentStyle,
    elevation,
    r,
    resolvedBackgroundColor,
    borderWidth,
    borderColor,
    borderStyle,
    hasUserOverflowHidden,
    needsSvgShadow,
    androidPlaceholderElevation,
  ])

  return (
    <View style={finalContainerStyle} onLayout={onLayout}>
      {needsSvgShadow && (
        <Svg width={svgWidth} height={svgHeight} style={svgStyle} pointerEvents="none">
          <Defs>
            <Filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <FeGaussianBlur in="SourceGraphic" stdDeviation={shadowBlur} />
            </Filter>
          </Defs>
          {/* Shadow layer */}
          <Rect
            x={shadowX}
            y={shadowY}
            width={w}
            height={h}
            rx={r}
            ry={r}
            fill={`rgba(0,0,0,${shadowOpacity})`}
            filter={`url(#${filterId})`}
          />
          {/* Fill layer */}
          <Rect
            x={fillX}
            y={fillY}
            width={w}
            height={h}
            rx={r}
            ry={r}
            fill={resolvedBackgroundColor as string}
            stroke={borderWidth > 0 ? borderColor : undefined}
            strokeWidth={borderWidth > 0 ? borderWidth : undefined}
          />
        </Svg>
      )}

      <View {...rest} style={[finalContentStyle]}>
        {children}
      </View>
    </View>
  )
}

export default memo(MySurface)
