import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import MyPressable from '@/components/elements/my-pressable'
import { useThemedStyles } from '@/theme/theme-context'

import type { MyBottomSheetProps, MyBottomSheetRef } from './type'
import { generateStyles } from './styles'

/**
 * Web-only implementation. `useBottomSheet` trong bản native luôn là `false` trên web
 * (`isWeb` guard), nên nhánh `BottomSheetModal` của `@expo/ui/community/bottom-sheet`
 * không bao giờ chạy tới ở đây — vì vậy file này KHÔNG import gì từ `@expo/ui`, tránh kéo
 * theo `vaul` + `@radix-ui/*` (~90KB minified, xem `expo-ssr-gap-analysis.md` — Phát hiện #5)
 * vào bundle web dù chưa từng dùng tới. Hành vi render giống hệt nhánh web trước đây của
 * `my-bottom-sheet.tsx`.
 */

function ignorePanelPress() {
  // Keep the sheet panel from closing when tapping inside (overlay Pressable is the closer).
}

const DISMISS_TRANSLATION_Y = 120
const DISMISS_VELOCITY_Y = 900
const SHEET_OFFSCREEN_Y = 640

type RnModalSheetProps = {
  visible: boolean
  panDownEnabled: boolean
  pressBackdropToClose: boolean
  panelStyle: StyleProp<ViewStyle>
  header: React.ReactNode
  body: React.ReactNode
  footer: React.ReactNode
  styles: ReturnType<typeof generateStyles>
  onRequestClose: () => void
}

function RnModalSheetInner({
  visible,
  panDownEnabled,
  pressBackdropToClose,
  panelStyle,
  header,
  body,
  footer,
  styles,
  onRequestClose,
}: RnModalSheetProps) {
  const translateY = useSharedValue(0)
  const backdropOpacity = useSharedValue(1)

  useEffect(() => {
    if (!visible) {
      return
    }
    translateY.value = 0
    backdropOpacity.value = 1
  }, [backdropOpacity, translateY, visible])

  const finishDismiss = useCallback(() => {
    onRequestClose()
  }, [onRequestClose])

  const panGesture = useMemo(() => {
    const pan = Gesture.Pan()
      .enabled(panDownEnabled)
      .activeOffsetY(8)
      .failOffsetX([-24, 24])
      .onUpdate((event) => {
        const nextY = Math.max(0, event.translationY)
        translateY.value = nextY
        backdropOpacity.value = interpolate(
          nextY,
          [0, SHEET_OFFSCREEN_Y * 0.5],
          [1, 0.35],
          Extrapolation.CLAMP,
        )
      })
      .onEnd((event) => {
        const shouldDismiss =
          event.translationY > DISMISS_TRANSLATION_Y || event.velocityY > DISMISS_VELOCITY_Y
        if (shouldDismiss) {
          backdropOpacity.value = withTiming(0, { duration: 180 })
          translateY.value = withTiming(SHEET_OFFSCREEN_Y, { duration: 200 }, (finished) => {
            if (finished) {
              runOnJS(finishDismiss)()
            }
          })
          return
        }
        translateY.value = withSpring(0, { damping: 22, stiffness: 220 })
        backdropOpacity.value = withTiming(1, { duration: 160 })
      })
    return pan
  }, [backdropOpacity, finishDismiss, panDownEnabled, translateY])

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const handleBackdropPress = useCallback(() => {
    if (pressBackdropToClose) {
      onRequestClose()
    }
  }, [onRequestClose, pressBackdropToClose])

  return (
    <Modal visible={visible} transparent onRequestClose={onRequestClose} animationType="none">
      <GestureHandlerRootView style={styles.gestureRoot}>
        <View style={styles.webSheetOverlay}>
          <Pressable style={styles.backdropHit} onPress={handleBackdropPress}>
            <Animated.View style={[styles.backdropFill, backdropAnimatedStyle]} />
          </Pressable>
          <Animated.View style={[panelStyle, panelAnimatedStyle]}>
            <Pressable onPress={ignorePanelPress}>
              <GestureDetector gesture={panGesture}>
                <Animated.View style={styles.dragHandleHit}>
                  {panDownEnabled ? <View style={styles.handle} /> : null}
                  <View style={styles.dragRegion}>{header}</View>
                </Animated.View>
              </GestureDetector>
              {body}
              {footer}
            </Pressable>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}

const RnModalSheet = memo(RnModalSheetInner)

const MyBottomSheet = forwardRef<MyBottomSheetRef, MyBottomSheetProps>(
  (
    {
      title,
      showClose = false,
      onClosed,
      header,
      footer,
      pressBackdropToClose = true,
      children,
      contentContainerStyle,
      enablePanDownToClose = true,
      onDismiss,
      useScrollView = true,
      snapPoints,
      visible: visibleProp,
      onClose: onCloseProp,
    },
    ref,
  ) => {
    const styles = useThemedStyles(generateStyles)
    /** Controlled mode: cha truyền visible — state nội bộ chỉ dùng khi không controlled. */
    const [internalVisible, setInternalVisible] = useState(false)

    const panDownEnabled = enablePanDownToClose && pressBackdropToClose

    const open = useCallback(() => {
      if (visibleProp === undefined) {
        setInternalVisible(true)
      }
    }, [visibleProp])

    const close = useCallback(() => {
      if (visibleProp === undefined) {
        setInternalVisible(false)
      }
    }, [visibleProp])

    /**
     * Đóng do TƯƠNG TÁC người dùng (X / backdrop / hệ thống) — báo cha qua onClose/onClosed.
     * Controlled mode: cha tự flip `visible`; internal mode: tự tắt.
     */
    const requestClose = useCallback(() => {
      if (visibleProp !== undefined) {
        onCloseProp?.()
        return
      }
      setInternalVisible(false)
      onClosed?.()
      onDismiss?.()
    }, [visibleProp, onCloseProp, onClosed, onDismiss])

    useImperativeHandle(ref, () => ({ open, close }), [open, close])

    const headerContent = useMemo(() => {
      if (header) return null
      if (!title) return null
      return (
        <MyView style={styles.header}>
          {showClose && <View style={styles.headerClose} />}
          <MyView style={styles.headerTitleWrap}>
            <MyText typography="subtitle" style={styles.headerTitle}>
              {title}
            </MyText>
          </MyView>
          {showClose && (
            <MyPressable
              style={styles.headerClose}
              onPress={requestClose}
              accessibilityRole="button"
            >
              <MyIcon name="close" color="icon/active/primary" />
            </MyPressable>
          )}
        </MyView>
      )
    }, [
      header,
      title,
      showClose,
      requestClose,
      styles.header,
      styles.headerClose,
      styles.headerTitleWrap,
      styles.headerTitle,
    ])

    /** Mobile responsive: neo đáy; có snapPoints → height cố định (footer luôn sát đáy panel). */
    const windowHeight = Dimensions.get('window').height
    const maxHeightPct = Number(String(snapPoints?.[0] ?? '85%').replace('%', ''))
    const maxHeight: DimensionValue = `${maxHeightPct}%`
    const hasFixedHeight = Boolean(snapPoints?.length)
    const panelStyle: StyleProp<ViewStyle> = [
      styles.webSheetPanel,
      hasFixedHeight ? { height: Math.round((windowHeight * maxHeightPct) / 100) } : { maxHeight },
    ]
    const isOpen = visibleProp ?? internalVisible
    const body = useScrollView ? (
      <ScrollView
        style={hasFixedHeight ? styles.webSheetScrollFixed : styles.webSheetScroll}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        contentInsetAdjustmentBehavior="never"
      >
        {children}
      </ScrollView>
    ) : (
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    )

    return (
      <RnModalSheet
        visible={isOpen}
        panDownEnabled={panDownEnabled}
        pressBackdropToClose={pressBackdropToClose}
        panelStyle={panelStyle}
        header={header ?? headerContent}
        body={body}
        footer={footer ? <MyView style={styles.modalFooter}>{footer}</MyView> : null}
        styles={styles}
        onRequestClose={requestClose}
      />
    )
  },
)

MyBottomSheet.displayName = 'MyBottomSheet'

export default memo(MyBottomSheet)
