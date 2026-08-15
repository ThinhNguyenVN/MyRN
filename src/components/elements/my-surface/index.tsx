import React, { memo, useId, useMemo, useRef, useState } from 'react'
import { View, type ViewStyle, LayoutChangeEvent, StyleProp, StyleSheet } from 'react-native'
import Svg, { Defs, FeGaussianBlur, Filter, Rect } from 'react-native-svg'

import { Radius, RadiusType } from '@/theme/radius'
import { ElevationToken, getElevation } from '@/theme/elevation'
import { SurfaceStyle } from './type'
import { splitSurfaceStyle } from './utils'
import { isAndroid, isIos, isWeb } from '@/constants/dimensions'

/** Android SVG shadow: giảm đậm, tăng blur (tránh shadow quá đậm/sắc) */
const ANDROID_OPACITY_FACTOR = 0.5
const ANDROID_BLUR_FACTOR = 2

export interface MySurfaceProps extends Omit<
  SurfaceStyle,
  'elevation' | 'backgroundColor' | 'style'
> {
  elevation?: ElevationToken
  radius?: RadiusType

  backgroundColor?: string
  style?: StyleProp<SurfaceStyle>
  children?: React.ReactNode
  /** false = content size theo children (auto height, e.g. MyAlert). true = flex:1 fill parent (e.g. MyButton) */
  fillParent?: boolean
}

const MIN_INSET = 16
/** Gaussian blur extends ~3× stdDeviation; inset cần đủ để shadow không bị cắt */
const BLUR_EXTENT_FACTOR = 3

const MySurface: React.FC<MySurfaceProps> = ({
  elevation = 'soft',
  radius = 'none',
  backgroundColor,
  style,
  children,
  fillParent = true,
  ...rest
}) => {
  const filterId = useId().replace(/:/g, '')
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

  const onLayout = (e: LayoutChangeEvent) => {
    if (hasStaticSize) return
    const { width, height } = e.nativeEvent.layout
    const s = sizeRef.current
    if (s.w !== width || s.h !== height) {
      sizeRef.current = { w: width, h: height }
      forceUpdate((x) => x + 1)
    }
  }

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
    }
    return base as ViewStyle
  }, [containerStyle, elevation, resolvedBackgroundColor, r, dx, dy, opacity, blur])

  // Inner content: clip, border, background. iOS/Web: native shadow; Android: SVG
  const finalContentStyle = useMemo(() => {
    const base: ViewStyle = { ...contentStyle }
    if (!(elevation && elevation !== 'none')) return base

    base.backgroundColor = resolvedBackgroundColor as string
    base.borderRadius = r
    if (borderWidth > 0) {
      base.borderWidth = borderWidth
      base.borderColor = borderColor
    }
    if (hasUserOverflowHidden) base.overflow = 'hidden'

    // Web: CSS boxShadow — nhanh, không cần SVG
    if (isWeb) {
      ;(base as Record<string, unknown>).boxShadow =
        `${dx}px ${dy}px ${blur * 2}px rgba(0,0,0,${opacity})`
    }
    return base
  }, [
    contentStyle,
    elevation,
    r,
    resolvedBackgroundColor,
    borderWidth,
    borderColor,
    hasUserOverflowHidden,
    dx,
    dy,
    opacity,
    blur,
  ])

  const needsSvgShadow = isAndroid && elevation && elevation !== 'none' && w > 0 && h > 0

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
