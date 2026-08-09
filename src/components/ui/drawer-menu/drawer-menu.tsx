import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Modal, Pressable, StyleSheet } from 'react-native'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { DRAWER_MENU_DEFAULT_WIDTH, generateStyles } from './styles'
import type { DrawerMenuItem, DrawerMenuProps } from './type'

const OPEN_MS = 280
const CLOSE_MS = 220
const OPEN_EASING = Easing.out(Easing.cubic)
const CLOSE_EASING = Easing.in(Easing.cubic)

function DrawerMenuInner({
  visible,
  onClose,
  title,
  subtitle,
  meta,
  data,
  onSelected,
  headerContent,
  footer,
  closeAccessibilityLabel,
  backdropAccessibilityLabel,
  width = DRAWER_MENU_DEFAULT_WIDTH,
  side = 'left',
  style,
}: DrawerMenuProps) {
  const styles = useThemedStyles(generateStyles)
  const [mounted, setMounted] = useState(visible)
  const visibleRef = useRef(visible)
  const progress = useSharedValue(visible ? 1 : 0)
  const panelWidth = useSharedValue(width)
  /** -1 = slide from left, +1 = slide from right */
  const sideSign = useSharedValue(side === 'right' ? 1 : -1)

  visibleRef.current = visible

  useEffect(() => {
    panelWidth.value = width
  }, [panelWidth, width])

  useEffect(() => {
    sideSign.value = side === 'right' ? 1 : -1
  }, [side, sideSign])

  const finishClose = useCallback(() => {
    if (!visibleRef.current) setMounted(false)
  }, [])

  useEffect(() => {
    if (visible) {
      setMounted(true)
      progress.value = withTiming(1, { duration: OPEN_MS, easing: OPEN_EASING })
      return
    }
    progress.value = withTiming(0, { duration: CLOSE_MS, easing: CLOSE_EASING }, (finished) => {
      if (finished) runOnJS(finishClose)()
    })
  }, [visible, progress, finishClose])

  const handlePress = useCallback(
    (item: DrawerMenuItem, index: number) => {
      onSelected?.(item, index)
    },
    [onSelected],
  )

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }))

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - progress.value) * sideSign.value * panelWidth.value }],
  }))

  const showUserBlock = Boolean(headerContent || subtitle || meta)
  const panelStyle = side === 'right' ? styles.panelRight : styles.panelLeft

  if (!mounted) return null

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View
        style={[styles.backdrop, backdropAnimatedStyle]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel={backdropAccessibilityLabel ?? closeAccessibilityLabel}
        />
      </Animated.View>

      <Animated.View
        style={[panelStyle, { width }, style, panelAnimatedStyle]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <MyView style={styles.header}>
          <MyText typography="subtitle">{title}</MyText>
          <MyButton.Icon
            icon="close"
            type="light"
            size="small"
            onPress={onClose}
            accessibilityLabel={closeAccessibilityLabel}
          />
        </MyView>

        {showUserBlock ? (
          <MyView style={styles.userBlock}>
            {headerContent ?? (
              <>
                {subtitle ? (
                  <MyText typography="body" style={styles.userName}>
                    {subtitle}
                  </MyText>
                ) : null}
                {meta ? (
                  <MyText typography="label" style={styles.userMeta}>
                    {meta}
                  </MyText>
                ) : null}
              </>
            )}
          </MyView>
        ) : null}

        <MyView style={styles.items}>
          {data.map((item, index) => (
            <MyPressable
              key={`drawer-item-${item.id}`}
              style={styles.item}
              onPress={() => handlePress(item, index)}
              haptic={false}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              {item.icon ? <MyIcon name={item.icon} size={22} color="icon/active/primary" /> : null}
              <MyText typography="body" style={styles.itemLabel}>
                {item.label}
              </MyText>
            </MyPressable>
          ))}
        </MyView>

        {footer ? <MyView style={styles.footer}>{footer}</MyView> : null}
      </Animated.View>
    </Modal>
  )
}

DrawerMenuInner.displayName = 'DrawerMenu'

export default memo(DrawerMenuInner)
