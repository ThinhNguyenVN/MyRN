import React, { memo, useCallback, useMemo, useRef, useState } from 'react'
import { Keyboard, View } from 'react-native'

import MyBottomSheet, {
  BottomSheetView,
  type MyBottomSheetRef,
} from '@/components/elements/my-bottom-sheet'
import { TriggerModal } from '@/components/ui/trigger-modal'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { DatePickerShellProps } from './type'

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
  const [yearMonthMode, setYearMonthMode] = useState(false)

  const handleMeasureInWindow = useCallback(
    (x: number, y: number, width: number, height: number) => {
      setTriggerLayout({ x, y, width, height })
      setOpen(true)
    },
    [],
  )

  const openPicker = useCallback(() => {
    if (disabled) return
    Keyboard.dismiss()
    if (isMobile) {
      setOpen(true)
      sheetRef.current?.open()
    } else {
      triggerRef.current?.measureInWindow(handleMeasureInWindow)
    }
  }, [disabled, isMobile, handleMeasureInWindow])

  const closePicker = useCallback(() => {
    if (isMobile) {
      sheetRef.current?.close()
    }
    setOpen(false)
    setTriggerLayout(null)
    setYearMonthMode(false)
  }, [isMobile])

  const trigger = (
    <View ref={triggerRef} collapsable={false} style={styles.triggerWrap}>
      {renderTrigger({ openPicker, disabled, open })}
    </View>
  )

  const contentOpts = useMemo(() => ({ setYearMonthMode, yearMonthMode }), [yearMonthMode])
  const content = renderContent(closePicker, contentOpts)

  const footerContent = yearMonthMode ? null : renderFooter ? renderFooter(closePicker) : footer

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
          useScrollView={false}
        >
          <BottomSheetView style={[styles.mobileContentContainer, contentContainerStyle]}>
            {content}
          </BottomSheetView>
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
          <View style={contentContainerStyle}>{content}</View>
        </TriggerModal>
      )}
    </View>
  )
})

DatePickerShell.displayName = 'DatePickerShell'

export default DatePickerShell
export type { DatePickerContentOpts, DatePickerShellProps } from './type'
