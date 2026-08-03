import { memo, useCallback, useEffect, useMemo } from 'react'
import { Image } from 'expo-image'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { PreviewZoomableImageProps } from './type'

const ZOOM_IN_SCALE = 2.5
const MIN_SCALE = 1
const MAX_SCALE = 4
const TIMING = { duration: 200 }

function resetZoomSharedValues(
  scale: { value: number },
  savedScale: { value: number },
  translateX: { value: number },
  translateY: { value: number },
  savedTranslateX: { value: number },
  savedTranslateY: { value: number },
) {
  scale.value = 1
  savedScale.value = 1
  translateX.value = 0
  translateY.value = 0
  savedTranslateX.value = 0
  savedTranslateY.value = 0
}

export const PreviewZoomableImage = memo(function PreviewZoomableImage({
  uri,
  label,
  index,
  width,
  height,
  isActive,
  onZoomChange,
  style,
}: PreviewZoomableImageProps) {
  const styles = useThemedStyles(generateStyles)
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const savedTranslateX = useSharedValue(0)
  const savedTranslateY = useSharedValue(0)
  const focalX = useSharedValue(0)
  const focalY = useSharedValue(0)
  const pageSizeStyle = useMemo(() => ({ width, height }), [height, width])

  const notifyZoomChange = useCallback(
    (zoomed: boolean) => {
      if (!isActive) return
      onZoomChange(zoomed)
    },
    [isActive, onZoomChange],
  )

  useEffect(() => {
    resetZoomSharedValues(
      scale,
      savedScale,
      translateX,
      translateY,
      savedTranslateX,
      savedTranslateY,
    )
    if (isActive) {
      onZoomChange(false)
    }
  }, [
    uri,
    index,
    isActive,
    onZoomChange,
    scale,
    savedScale,
    translateX,
    translateY,
    savedTranslateX,
    savedTranslateY,
  ])

  const clampTranslation = (nextScale: number, x: number, y: number) => {
    'worklet'
    const maxX = Math.max((width * nextScale - width) / 2, 0)
    const maxY = Math.max((height * nextScale - height) / 2, 0)
    return {
      x: Math.min(Math.max(x, -maxX), maxX),
      y: Math.min(Math.max(y, -maxY), maxY),
    }
  }

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd((event) => {
      if (scale.value > MIN_SCALE + 0.01) {
        scale.value = withTiming(MIN_SCALE, TIMING)
        savedScale.value = MIN_SCALE
        translateX.value = withTiming(0, TIMING)
        translateY.value = withTiming(0, TIMING)
        savedTranslateX.value = 0
        savedTranslateY.value = 0
        runOnJS(notifyZoomChange)(false)
        return
      }

      const nextScale = ZOOM_IN_SCALE
      const centeredX = (width / 2 - event.x) * (nextScale - 1)
      const centeredY = (height / 2 - event.y) * (nextScale - 1)
      const clamped = clampTranslation(nextScale, centeredX, centeredY)
      scale.value = withTiming(nextScale, TIMING)
      savedScale.value = nextScale
      translateX.value = withTiming(clamped.x, TIMING)
      translateY.value = withTiming(clamped.y, TIMING)
      savedTranslateX.value = clamped.x
      savedTranslateY.value = clamped.y
      runOnJS(notifyZoomChange)(true)
    })

  const pinch = Gesture.Pinch()
    .onBegin((event) => {
      savedScale.value = scale.value
      focalX.value = event.focalX
      focalY.value = event.focalY
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })
    .onUpdate((event) => {
      const nextScale = Math.min(Math.max(savedScale.value * event.scale, MIN_SCALE), MAX_SCALE)
      const focusShiftX = (width / 2 - focalX.value) * (nextScale / savedScale.value - 1)
      const focusShiftY = (height / 2 - focalY.value) * (nextScale / savedScale.value - 1)
      const nextX = savedTranslateX.value + focusShiftX
      const nextY = savedTranslateY.value + focusShiftY
      const clamped = clampTranslation(nextScale, nextX, nextY)
      scale.value = nextScale
      translateX.value = clamped.x
      translateY.value = clamped.y
    })
    .onEnd(() => {
      if (scale.value < MIN_SCALE + 0.01) {
        scale.value = withTiming(MIN_SCALE, TIMING)
        translateX.value = withTiming(0, TIMING)
        translateY.value = withTiming(0, TIMING)
        savedScale.value = MIN_SCALE
        savedTranslateX.value = 0
        savedTranslateY.value = 0
        runOnJS(notifyZoomChange)(false)
        return
      }
      savedScale.value = scale.value
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
      runOnJS(notifyZoomChange)(scale.value > MIN_SCALE + 0.01)
    })

  const pan = Gesture.Pan()
    .maxPointers(1)
    .manualActivation(true)
    .onTouchesMove((_event, state) => {
      if (scale.value > MIN_SCALE + 0.01) {
        state.activate()
        return
      }
      state.fail()
    })
    .onBegin(() => {
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })
    .onUpdate((event) => {
      const clamped = clampTranslation(
        scale.value,
        savedTranslateX.value + event.translationX,
        savedTranslateY.value + event.translationY,
      )
      translateX.value = clamped.x
      translateY.value = clamped.y
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })

  const gesture = Gesture.Simultaneous(pinch, Gesture.Exclusive(doubleTap, pan))

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }))

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.page, pageSizeStyle, style, animatedStyle]}
        accessibilityRole="image"
        accessibilityLabel={`${label} image ${index + 1}`}
      >
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </Animated.View>
    </GestureDetector>
  )
})
