import type { ReactNode } from 'react'
import React, { memo, useCallback, useRef, useState } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { View } from 'react-native'

import MyBottomSheet, { type MyBottomSheetRef } from '@/components/elements/my-bottom-sheet'
import { TriggerModal } from '@/components/ui/trigger-modal'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

export interface DatePickerShellProps {
  title: string
  disabled?: boolean
  footer?: ReactNode
  renderFooter?: (closePicker: () => void) => ReactNode
  renderTrigger: (props: { openPicker: () => void; disabled: boolean; open: boolean }) => ReactNode
  renderContent: (closePicker: () => void) => ReactNode
  panelMinWidth?: number
  estimatedPanelHeight?: number
  contentContainerStyle?: StyleProp<ViewStyle>
  footerContainerStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
}

const DatePickerShell = memo(function DatePickerShell({
  title,
  disabled = false,
  footer,
  renderFooter,
  renderTrigger,
  renderContent,
  panelMinWidth = 280,
  estimatedPanelHeight = 380,
  contentContainerStyle,
  footerContainerStyle,
  style,
}: DatePickerShellProps) {
  const styles = useThemedStyles(generateStyles)
  const isMobile = useIsMobileSize()
  const sheetRef = useRef<MyBottomSheetRef>(null)
  const triggerRef = useRef<View>(null)
  const [open, setOpen] = useState(false)
  const [triggerLayout, setTriggerLayout] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const openPicker = useCallback(() => {
    if (disabled) return
    if (isMobile) {
      setOpen(true)
      sheetRef.current?.open()
    } else {
      triggerRef.current?.measureInWindow((x, y, width, height) => {
        setTriggerLayout({ x, y, width, height })
        setOpen(true)
      })
    }
  }, [disabled, isMobile])

  const closePicker = useCallback(() => {
    if (isMobile) {
      sheetRef.current?.close()
    }
    setOpen(false)
    setTriggerLayout(null)
  }, [isMobile])

  const trigger = (
    <View ref={triggerRef} collapsable={false} style={styles.triggerWrap}>
      {renderTrigger({ openPicker, disabled, open })}
    </View>
  )

  const content = renderContent(closePicker)
  const contentWrapped = <View style={contentContainerStyle}>{content}</View>
  const footerContent = renderFooter ? renderFooter(closePicker) : footer

  return (
    <View style={style}>
      {trigger}

      {isMobile ? (
        <MyBottomSheet
          ref={sheetRef}
          title={title}
          showClose
          onClosed={closePicker}
          pressBackdropToClose
          footer={footerContent}
        >
          {contentWrapped}
        </MyBottomSheet>
      ) : (
        <TriggerModal
          visible={open}
          onClose={closePicker}
          triggerLayout={triggerLayout}
          footer={footerContent}
          panelMinWidth={panelMinWidth}
          estimatedPanelHeight={estimatedPanelHeight}
          contentContainerStyle={contentContainerStyle}
          footerContainerStyle={footerContainerStyle}
        >
          {content}
        </TriggerModal>
      )}
    </View>
  )
})

DatePickerShell.displayName = 'DatePickerShell'

export default DatePickerShell
