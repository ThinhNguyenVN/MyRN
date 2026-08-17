import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'

import MyButton from '@/components/elements/my-button'
import { usesOnPrimaryButtonText } from '@/components/elements/my-button/button-utils'
import MyIcon from '@/components/elements/my-icon'
import { TriggerModal, type TriggerLayout } from '@/components/ui/trigger-modal'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { TableRowMoreMenuItem, TableRowMoreMenuProps } from './type'

const ITEM_HEIGHT_ESTIMATE = 52
const PANEL_PADDING_ESTIMATE = 40

function MoreMenuItemButton({
  item,
  onPick,
}: {
  item: TableRowMoreMenuItem
  onPick: (item: TableRowMoreMenuItem) => void
}) {
  const buttonType = item.type ?? 'light'
  const useWhiteIcon = usesOnPrimaryButtonText(buttonType, Boolean(item.disabled))
  const icon = useMemo(
    () => (
      <MyIcon name={item.icon} size={18} color={useWhiteIcon ? '#ffffff' : 'icon/active/primary'} />
    ),
    [item.icon, useWhiteIcon],
  )

  const handlePress = useCallback(() => {
    onPick(item)
  }, [item, onPick])

  return (
    <MyButton
      text={item.text}
      left={icon}
      type={buttonType}
      size="small"
      width="full"
      elevation="none"
      onPress={handlePress}
      disabled={item.disabled}
    />
  )
}

function TableRowMoreMenuComponent({
  items,
  accessibilityLabel,
  panelMinWidth = 220,
}: TableRowMoreMenuProps) {
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

  const handleMorePress = useCallback(() => {
    if (isOpen) {
      setIsOpen(false)
      return
    }
    triggerRef.current?.measureInWindow(handleMeasured)
  }, [handleMeasured, isOpen])

  const handlePick = useCallback((item: TableRowMoreMenuItem) => {
    setIsOpen(false)
    item.onPress()
  }, [])

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <MyButton.Icon
          icon="ellipsis-horizontal"
          type="light"
          size="small"
          elevation="none"
          onPress={handleMorePress}
          accessibilityLabel={accessibilityLabel}
        />
      </View>
      <TriggerModal
        visible={isOpen}
        onClose={handleClose}
        triggerLayout={triggerLayout}
        panelMinWidth={panelMinWidth}
        estimatedPanelHeight={estimatedPanelHeight}
        contentContainerStyle={styles.itemList}
      >
        {items.map((item) => (
          <MoreMenuItemButton key={`more-item-${item.key}`} item={item} onPick={handlePick} />
        ))}
      </TriggerModal>
    </>
  )
}

export const TableRowMoreMenu = memo(TableRowMoreMenuComponent)
