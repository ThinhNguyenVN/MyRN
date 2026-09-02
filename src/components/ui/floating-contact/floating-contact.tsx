import React, { memo, useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import MyPressable from '@/components/elements/my-pressable'
import { useThemedStyles } from '@/theme/theme-context'

import { PULSE_DURATION } from './constants'
import { generateStyles } from './styles'
import type { FloatingContactItem, FloatingContactProps } from './type'

interface FloatingContactButtonProps {
  readonly item: FloatingContactItem
  readonly styles: ReturnType<typeof generateStyles>
}

const FloatingContactButtonInner: React.FC<FloatingContactButtonProps> = ({ item, styles }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const opacityAnim = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    if (!item.emphasized) return undefined

    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: PULSE_DURATION,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: PULSE_DURATION,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: PULSE_DURATION * 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [item.emphasized, scaleAnim, opacityAnim])

  return (
    <View style={styles.buttonWrap}>
      {item.emphasized ? (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              backgroundColor: item.color,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
      ) : null}
      <MyPressable
        style={[
          styles.fab,
          item.emphasized && styles.fabEmphasized,
          { backgroundColor: item.color },
        ]}
        onPress={item.onPress}
        accessibilityRole="button"
        accessibilityLabel={item.accessibilityLabel}
        haptic
      >
        <Feather name={item.icon} size={item.emphasized ? 24 : 20} color="#ffffff" />
      </MyPressable>
    </View>
  )
}

const FloatingContactButton = memo(FloatingContactButtonInner)

const FloatingContactInner: React.FC<FloatingContactProps> = ({ items, style }) => {
  const styles = useThemedStyles(generateStyles)

  return (
    <View style={[styles.container, style]}>
      {items.map((item) => (
        <FloatingContactButton key={item.key} item={item} styles={styles} />
      ))}
    </View>
  )
}

export const FloatingContact = memo(FloatingContactInner)
