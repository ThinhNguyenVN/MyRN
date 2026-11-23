import { memo, useCallback, useRef, useState } from 'react'
import { View } from 'react-native'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyImage from '@/components/elements/my-image'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { TriggerModal, type TriggerLayout } from '@/components/ui/trigger-modal'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { ProfileMenuButtonProps, ProfileMenuItem } from './type'

const ITEM_HEIGHT_ESTIMATE = 52
const HEADER_HEIGHT_ESTIMATE = 64
const PANEL_PADDING_ESTIMATE = 40
const PANEL_MIN_WIDTH = 280

interface MenuItemProps {
  readonly item: ProfileMenuItem
  readonly onPick: (item: ProfileMenuItem) => void
}

function MenuItemInner({ item, onPick }: MenuItemProps) {
  const handlePress = useCallback(() => onPick(item), [onPick, item])

  return (
    <MyButton
      text={item.text}
      left={<MyIcon name={item.icon} size={18} color="icon/active/primary" />}
      type="light"
      size="small"
      width="full"
      elevation="none"
      // the icon glyph would otherwise leak into the accessible name
      accessibilityLabel={item.text}
      onPress={handlePress}
    />
  )
}

const MenuItem = memo(MenuItemInner)

interface AvatarProps {
  readonly avatarUri?: string | null
  readonly initials?: string
  readonly style: object
}

/** Photo when `avatarUri` is set, else initials, else a generic person icon. */
function Avatar({ avatarUri, initials, style }: AvatarProps) {
  if (avatarUri) {
    return <MyImage url={avatarUri} style={style} lockAspectRatio={false} contentFit="cover" />
  }
  return (
    <MyView style={style}>
      {initials ? (
        <MyText typography="body" color="text/active/primary">
          {initials}
        </MyText>
      ) : (
        <MyIcon name="person-circle-outline" size={28} color="icon/inactive/primary" />
      )}
    </MyView>
  )
}

function ProfileMenuButtonInner({
  avatarUri,
  initials,
  displayName,
  subtitle,
  items,
  accessibilityLabel,
}: ProfileMenuButtonProps) {
  const styles = useThemedStyles(generateStyles)
  const triggerRef = useRef<View>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [triggerLayout, setTriggerLayout] = useState<TriggerLayout | null>(null)
  const hasHeader = Boolean(displayName || subtitle)
  const estimatedPanelHeight =
    (hasHeader ? HEADER_HEIGHT_ESTIMATE : 0) +
    items.length * ITEM_HEIGHT_ESTIMATE +
    PANEL_PADDING_ESTIMATE

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

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <MyPressable
          onPress={handlePress}
          haptic={false}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        >
          <Avatar avatarUri={avatarUri} initials={initials} style={styles.avatar} />
        </MyPressable>
      </View>
      <TriggerModal
        visible={isOpen}
        onClose={handleClose}
        triggerLayout={triggerLayout}
        panelMinWidth={PANEL_MIN_WIDTH}
        estimatedPanelHeight={estimatedPanelHeight}
        contentContainerStyle={styles.itemList}
      >
        {hasHeader ? (
          <MyView style={styles.header}>
            <Avatar avatarUri={avatarUri} initials={initials} style={styles.headerAvatar} />
            <MyView style={styles.headerText}>
              <MyText typography="body" numberOfLines={1}>
                {displayName ?? ''}
              </MyText>
              {subtitle ? (
                <MyText typography="caption" color="text/active/secondary" numberOfLines={1}>
                  {subtitle}
                </MyText>
              ) : null}
            </MyView>
          </MyView>
        ) : null}

        {items.map((item) => (
          <MenuItem key={`profile-menu-${item.key}`} item={item} onPick={handlePick} />
        ))}
      </TriggerModal>
    </>
  )
}

export const ProfileMenuButton = memo(ProfileMenuButtonInner)
