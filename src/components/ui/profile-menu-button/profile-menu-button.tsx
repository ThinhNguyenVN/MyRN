import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyImage from '@/components/elements/my-image'
import { TriggerModal, type TriggerLayout } from '@/components/ui/trigger-modal'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { ProfileMenuButtonProps, ProfileMenuItem } from './type'

const ITEM_HEIGHT_ESTIMATE = 52
const PANEL_PADDING_ESTIMATE = 40

function ProfileMenuButtonComponent({
  avatarUri,
  items,
  accessibilityLabel,
}: ProfileMenuButtonProps) {
  const styles = useThemedStyles(generateStyles)
  const triggerRef = useRef<View>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [triggerLayout, setTriggerLayout] = useState<TriggerLayout | null>(null)
  const estimatedPanelHeight = items.length * ITEM_HEIGHT_ESTIMATE + PANEL_PADDING_ESTIMATE

  const handleMeasured = useCallback((x: number, y: number, width: number, height: number) => {
    setTriggerLayout({ x, y, width, height })
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handlePress = useCallback(() => {
    if (isOpen) {
      setIsOpen(false)
      return
    }
    triggerRef.current?.measureInWindow(handleMeasured)
  }, [handleMeasured, isOpen])

  const handlePick = useCallback((item: ProfileMenuItem) => {
    setIsOpen(false)
    item.onPress()
  }, [])

  const trigger = useMemo(() => {
    if (avatarUri) {
      return (
        <MyImage
          url={avatarUri}
          style={styles.avatar}
          onPress={handlePress}
          lockAspectRatio={false}
          contentFit="cover"
        />
      )
    }
    return (
      <MyButton.Icon
        icon="person-circle-outline"
        type="light"
        size="small"
        elevation="none"
        onPress={handlePress}
        accessibilityLabel={accessibilityLabel}
      />
    )
  }, [accessibilityLabel, avatarUri, handlePress, styles.avatar])

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        {trigger}
      </View>
      <TriggerModal
        visible={isOpen}
        onClose={handleClose}
        triggerLayout={triggerLayout}
        panelMinWidth={220}
        estimatedPanelHeight={estimatedPanelHeight}
        contentContainerStyle={styles.itemList}
      >
        {items.map((item) => (
          <MyButton
            key={`profile-menu-${item.key}`}
            text={item.text}
            left={<MyIcon name={item.icon} size={18} color="icon/active/primary" />}
            type="light"
            size="small"
            width="full"
            elevation="none"
            onPress={() => handlePick(item)}
          />
        ))}
      </TriggerModal>
    </>
  )
}

export const ProfileMenuButton = memo(ProfileMenuButtonComponent)
