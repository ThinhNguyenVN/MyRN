import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyImage from '@/components/elements/my-image'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { TriggerModal, type TriggerLayout } from '@/components/ui/trigger-modal'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { ProfileMenuButtonProps, ProfileMenuItem } from './type'

const ITEM_HEIGHT_ESTIMATE = 52
const HEADER_HEIGHT_ESTIMATE = 64
const PANEL_PADDING_ESTIMATE = 40

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
      onPress={handlePress}
    />
  )
}

const MenuItem = memo(MenuItemInner)

interface MenuHeaderProps {
  readonly avatarUri?: string | null
  readonly displayName?: string | null
}

function MenuHeaderInner({ avatarUri, displayName }: MenuHeaderProps) {
  const styles = useThemedStyles(generateStyles)

  return (
    <MyView style={styles.header}>
      <ConditionRenderer
        when={Boolean(avatarUri)}
        fallback={
          <MyView style={styles.headerAvatar}>
            <MyIcon name="person-circle-outline" size={28} color="icon/inactive/primary" />
          </MyView>
        }
      >
        <MyImage
          url={avatarUri ?? ''}
          style={styles.headerAvatar}
          lockAspectRatio={false}
          contentFit="cover"
        />
      </ConditionRenderer>
      <MyText typography="body" style={styles.headerName} numberOfLines={1}>
        {displayName ?? ''}
      </MyText>
    </MyView>
  )
}

const MenuHeader = memo(MenuHeaderInner)

function ProfileMenuButtonInner({
  avatarUri,
  displayName,
  items,
  accessibilityLabel,
}: ProfileMenuButtonProps) {
  const styles = useThemedStyles(generateStyles)
  const triggerRef = useRef<View>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [triggerLayout, setTriggerLayout] = useState<TriggerLayout | null>(null)
  const hasHeader = Boolean(displayName)
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
        panelMinWidth={240}
        estimatedPanelHeight={estimatedPanelHeight}
        contentContainerStyle={styles.itemList}
      >
        <ConditionRenderer when={hasHeader}>
          <MenuHeader avatarUri={avatarUri} displayName={displayName} />
        </ConditionRenderer>

        {items.map((item) => (
          <MenuItem key={`profile-menu-${item.key}`} item={item} onPick={handlePick} />
        ))}
      </TriggerModal>
    </>
  )
}

export const ProfileMenuButton = memo(ProfileMenuButtonInner)
