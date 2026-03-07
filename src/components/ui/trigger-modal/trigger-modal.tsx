import React, { memo, useMemo } from 'react'
import { Dimensions, Modal, Pressable, View } from 'react-native'

import { MAX_INPUT_WIDTH } from '@/constants/dimensions'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { TriggerModalProps } from './type'

const DEFAULT_ESTIMATED_HEIGHT = 320
const DEFAULT_SAFE_INSET = 24

const TriggerModal = memo(function TriggerModal({
  visible,
  onClose,
  triggerLayout,
  children,
  footer,
  panelMinWidth,
  estimatedPanelHeight = DEFAULT_ESTIMATED_HEIGHT,
  safeInset = DEFAULT_SAFE_INSET,
  panelStyle,
  contentContainerStyle,
  footerContainerStyle,
}: TriggerModalProps) {
  const styles = useThemedStyles(generateStyles)
  const { getSpacing } = useTheme()
  const gap = getSpacing('x1')

  const panelLayout = useMemo(() => {
    if (!triggerLayout) return null
    const { x, y, width, height } = triggerLayout
    const windowHeight = Dimensions.get('window').height
    const spaceBelow = windowHeight - (y + height + gap) - safeInset
    const openAbove = spaceBelow < estimatedPanelHeight
    const panelWidth = Math.min(MAX_INPUT_WIDTH, Math.max(width, panelMinWidth ?? 0))
    const maxHeightBelow = windowHeight - (y + height + gap) - safeInset
    const maxHeightAbove = y - gap - safeInset
    return {
      left: x,
      width: panelWidth,
      top: openAbove ? undefined : y + height + gap,
      bottom: openAbove ? windowHeight - y + gap : undefined,
      maxHeight: openAbove ? maxHeightAbove : maxHeightBelow,
    }
  }, [triggerLayout, gap, safeInset, estimatedPanelHeight, panelMinWidth])

  if (!visible || !triggerLayout) return null

  return (
    <Modal visible transparent animationType="fade">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.panel,
            panelLayout && {
              left: panelLayout.left,
              width: panelLayout.width,
              top: panelLayout.top,
              bottom: panelLayout.bottom,
              maxHeight: Math.max(200, panelLayout.maxHeight),
            },
            panelStyle,
          ]}
          onPress={() => {}}
        >
          <View style={[styles.contentWrap, contentContainerStyle]}>{children}</View>
          {!!footer ? (
            <View style={[styles.footerWrap, footerContainerStyle]}>{footer}</View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  )
})

TriggerModal.displayName = 'TriggerModal'

export default TriggerModal
