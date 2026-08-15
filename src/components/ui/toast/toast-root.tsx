import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { View } from 'react-native'
import { Portal } from '@gorhom/portal'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'

import type { ToastOptions, ToastRef, ToastType } from './type'
import { generateStyles } from './styles'

const TYPE_ICON_MAP: Record<ToastType, React.ComponentProps<typeof MyIcon>['name']> = {
  info: 'information-circle',
  success: 'checkmark-circle',
  warning: 'warning',
  error: 'alert-circle',
}

const TYPE_COLOR_MAP: Record<ToastType, string> = {
  info: 'icon/info/primary',
  success: 'icon/success/primary',
  warning: 'icon/warning/primary',
  error: 'icon/alert/primary',
}

const DEFAULT_DURATION = 2000
const ANIMATION_DURATION = 250
const SLIDE_DISTANCE = 120
const SLIDE_DISTANCE_WEB = 400
const ANIMATION_DURATION_WEB = 400

const ToastRoot = forwardRef<ToastRef, object>(function ToastRoot(_, ref) {
  const styles = useThemedStyles(generateStyles)
  const { defaultElevation } = useTheme()
  const [options, setOptions] = useState<ToastOptions | null>(null)
  const [visible, setVisible] = useState(false)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const translateY = useSharedValue(SLIDE_DISTANCE)
  const translateX = useSharedValue(SLIDE_DISTANCE_WEB)

  const isDesktopViewport = !useIsMobileSize()

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }, [])

  const setHidden = useCallback(() => {
    setVisible(false)
    setOptions(null)
  }, [])

  const hide = useCallback(() => {
    clearHideTimeout()
    if (isDesktopViewport) {
      translateX.value = withTiming(SLIDE_DISTANCE_WEB, { duration: ANIMATION_DURATION_WEB }, () =>
        runOnJS(setHidden)(),
      )
    } else {
      translateY.value = withTiming(SLIDE_DISTANCE, { duration: ANIMATION_DURATION }, () =>
        runOnJS(setHidden)(),
      )
    }
  }, [clearHideTimeout, isDesktopViewport, setHidden, translateX, translateY])

  const show = useCallback(
    (opts: ToastOptions) => {
      clearHideTimeout()
      if (isDesktopViewport) {
        translateX.value = SLIDE_DISTANCE_WEB
      } else {
        translateY.value = SLIDE_DISTANCE
      }
      setOptions({ ...opts, duration: opts.duration ?? DEFAULT_DURATION })
      setVisible(true)
      const duration = opts.duration ?? DEFAULT_DURATION
      hideTimeoutRef.current = setTimeout(() => {
        hideTimeoutRef.current = null
        hide()
      }, duration)
    },
    [clearHideTimeout, hide, isDesktopViewport, translateX, translateY],
  )

  useEffect(() => {
    if (!visible || !options) return
    if (isDesktopViewport) {
      translateX.value = withTiming(0, { duration: ANIMATION_DURATION_WEB })
    } else {
      translateY.value = withTiming(0, { duration: ANIMATION_DURATION })
    }
  }, [visible, options, isDesktopViewport, translateX, translateY])

  useImperativeHandle(ref, () => ({ show, hide }), [show, hide])

  useEffect(() => clearHideTimeout, [clearHideTimeout])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: isDesktopViewport
      ? [{ translateX: translateX.value }]
      : [{ translateY: translateY.value }],
  }))

  if (!visible || !options) return null

  const type = options.type ?? 'info'
  const typeCap = type.charAt(0).toUpperCase() + type.slice(1)
  const containerStyle = styles[`container${typeCap}` as keyof typeof styles] as object
  const iconName = TYPE_ICON_MAP[type]
  const iconColor = TYPE_COLOR_MAP[type]

  const body = (
    <>
      <MyView style={styles.toastIcon}>
        <MyIcon name={iconName} size={22} color={iconColor as never} />
      </MyView>
      <MyView style={styles.toastBody}>
        <MyText style={styles.toastText} numberOfLines={4}>
          {options.text}
        </MyText>
        {options.description ? (
          <MyText style={[styles.description, styles.toastText]} numberOfLines={4}>
            {options.description}
          </MyText>
        ) : null}
      </MyView>
    </>
  )

  const elevation =
    options.elevation !== 'none' ? (options.elevation ?? defaultElevation) : undefined
  const elevationFinal = elevation && elevation !== 'none' ? elevation : undefined

  const wrapper = (
    <MyView
      elevation={elevationFinal}
      radius="medium"
      fillParent={false}
      style={[styles.container, containerStyle]}
    >
      <MyView style={styles.toastRow}>{body}</MyView>
    </MyView>
  )

  return (
    <Portal hostName="root">
      <View
        style={[styles.toastPosition, isDesktopViewport && styles.toastPositionWeb]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            animatedStyle,
            styles.toastInnerWrap,
            isDesktopViewport && styles.toastInnerWrapWeb,
          ]}
          pointerEvents="none"
        >
          {wrapper}
        </Animated.View>
      </View>
    </Portal>
  )
})

export default ToastRoot
