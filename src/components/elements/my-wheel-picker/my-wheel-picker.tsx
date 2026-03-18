import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, View } from 'react-native'
import { BottomSheetView } from '@gorhom/bottom-sheet'

import MyBottomSheet, { type MyBottomSheetRef } from '@/components/elements/my-bottom-sheet'
import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyTextInput from '@/components/elements/my-text-input'
import { TriggerModal } from '@/components/ui/trigger-modal'
import { useIsMobile } from '@/hooks/dimenstions-hooks'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import WheelPickerView from './wheel-picker-view'
import type { MyWheelPickerProps } from './type'
import { generateStyles } from './styles'
import { isNil } from 'lodash'

const MyWheelPicker = memo(function MyWheelPicker({
  items,
  value,
  onValueChange,
  title = 'Chọn',
  placeholder = 'Chọn',
  disabled = false,
  haptic: hapticProp,
}: MyWheelPickerProps) {
  const { hapticEnabled } = useTheme()
  const haptic = hapticProp ?? hapticEnabled
  const styles = useThemedStyles(generateStyles)
  const useSheet = useIsMobile()
  const sheetRef = useRef<MyBottomSheetRef>(null)
  const triggerRef = useRef<View>(null)
  const isMobile = useIsMobile()
  const confirmHandlerRef = useRef<() => void>(() => {})
  const [open, setOpen] = useState(false)
  const [triggerLayout, setTriggerLayout] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const [pendingIndex, setPendingIndex] = useState(() =>
    !isNil(value)
      ? Math.max(
          0,
          items.findIndex((i) => i.value === value),
        )
      : 0,
  )

  useEffect(() => {
    if (!isNil(value)) {
      const idx = items.findIndex((i) => i.value === value)
      if (idx >= 0) setPendingIndex(idx)
    }
  }, [value, items])

  const openPicker = useCallback(() => {
    if (disabled) return
    Keyboard.dismiss()
    if (useSheet) {
      setOpen(true)
      requestAnimationFrame(() => {
        sheetRef.current?.open()
      })
    } else {
      triggerRef.current?.measureInWindow((x, y, width, height) => {
        setTriggerLayout({ x, y, width, height })
        setOpen(true)
      })
    }
  }, [disabled, useSheet])

  const closePicker = useCallback(() => {
    if (useSheet) sheetRef.current?.close()
    setOpen(false)
    setTriggerLayout(null)
  }, [useSheet])

  const handleConfirm = useCallback(() => {
    const item = items[pendingIndex]
    if (!isNil(item)) onValueChange(item.value)
    closePicker()
  }, [items, pendingIndex, onValueChange, closePicker])

  confirmHandlerRef.current = handleConfirm

  const triggerLabel = !isNil(value)
    ? (items.find((i) => i.value === value)?.label ?? placeholder)
    : placeholder

  const wheelPicker = (
    <WheelPickerView
      items={items}
      selectedIndex={pendingIndex}
      onSelectIndex={setPendingIndex}
      haptic={haptic}
    />
  )

  const paddingBottom = isMobile ? 140 : 0

  const footerContent = useMemo(
    () => (
      <MyButton
        type="primary"
        text="Xác nhận"
        width="full"
        onPress={() => confirmHandlerRef.current()}
      />
    ),
    [],
  )

  return (
    <View style={styles.triggerWrap}>
      <View ref={triggerRef} collapsable={false} style={styles.triggerWrap}>
        <MyPressable
          onPress={openPicker}
          disabled={disabled}
          haptic={false}
          animatedType="opacity"
          style={styles.triggerWrap}
        >
          <View pointerEvents="none">
            <MyTextInput
              value={triggerLabel}
              placeholder={placeholder}
              disabled={disabled}
              editable={false}
              endIcon={<MyIcon name="chevron-down" size={20} color="icon/active/primary" />}
              error={false}
            />
          </View>
        </MyPressable>
      </View>

      {useSheet ? (
        <MyBottomSheet
          ref={sheetRef}
          title={title}
          showClose
          onClosed={closePicker}
          pressBackdropToClose
          useScrollView={false}
          footer={footerContent}
        >
          <BottomSheetView style={[styles.pickerContent, { paddingBottom }]}>
            {wheelPicker}
          </BottomSheetView>
        </MyBottomSheet>
      ) : (
        <TriggerModal
          visible={open}
          onClose={closePicker}
          triggerLayout={triggerLayout}
          estimatedPanelHeight={280}
          footer={footerContent}
          footerContainerStyle={styles.sheetFooter}
        >
          <View style={styles.pickerContent}>{wheelPicker}</View>
        </TriggerModal>
      )}
    </View>
  )
})

MyWheelPicker.displayName = 'MyWheelPicker'

export default MyWheelPicker
