import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, Platform, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { isNil } from 'lodash'

import MyBottomSheet, {
  BottomSheetView,
  type MyBottomSheetRef,
} from '@/components/elements/my-bottom-sheet'
import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyTextInput from '@/components/elements/my-text-input'
import {
  commitWheelSelection,
  resolvePendingIndex,
  resolveWheelPickerEngine,
} from '@/components/elements/picker-engine'
import { TriggerModal } from '@/components/ui/trigger-modal'
import { useIsMobile } from '@/hooks/dimenstions-hooks'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import ExpoWheelPickerField from './expo-wheel-picker-field'
import WheelPickerView from './wheel-picker-view'
import type { MyWheelPickerProps } from './type'
import { generateStyles } from './styles'

const MyWheelPicker = memo(function MyWheelPicker({
  items,
  value,
  onValueChange,
  title,
  placeholder,
  disabled = false,
  haptic: hapticProp,
}: MyWheelPickerProps) {
  const { t } = useTranslation()
  const { hapticEnabled } = useTheme()
  const haptic = hapticProp ?? hapticEnabled
  const styles = useThemedStyles(generateStyles)
  const useSheet = useIsMobile()
  const wheelEngine = resolveWheelPickerEngine(Platform.OS)
  const sheetRef = useRef<MyBottomSheetRef>(null)
  const triggerRef = useRef<View>(null)
  const confirmHandlerRef = useRef<() => void>(() => {})
  const [open, setOpen] = useState(false)
  const [triggerLayout, setTriggerLayout] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const [pendingIndex, setPendingIndex] = useState(() => resolvePendingIndex(value, items))
  const pendingIndexRef = useRef(pendingIndex)
  pendingIndexRef.current = pendingIndex

  useEffect(() => {
    setPendingIndex(resolvePendingIndex(value, items))
  }, [value, items])

  const openSheet = useCallback(() => {
    sheetRef.current?.open()
  }, [])

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
    if (useSheet) {
      setOpen(true)
      requestAnimationFrame(openSheet)
    } else {
      triggerRef.current?.measureInWindow(handleMeasureInWindow)
    }
  }, [disabled, useSheet, openSheet, handleMeasureInWindow])

  const closePicker = useCallback(() => {
    if (useSheet) sheetRef.current?.close()
    setOpen(false)
    setTriggerLayout(null)
  }, [useSheet])

  const handleConfirm = useCallback(() => {
    const next = commitWheelSelection(items, pendingIndexRef.current)
    if (!isNil(next)) onValueChange(next)
    closePicker()
  }, [items, onValueChange, closePicker])

  confirmHandlerRef.current = handleConfirm

  const handleFooterConfirm = useCallback(() => {
    confirmHandlerRef.current()
  }, [])

  const handleSelectIndex = useCallback((index: number) => {
    if (index < 0) return
    pendingIndexRef.current = index
    setPendingIndex(index)
  }, [])

  const resolvedTitle = title ?? t('components.wheelSelect')
  const resolvedPlaceholder = placeholder ?? t('components.wheelSelect')

  const triggerLabel = !isNil(value)
    ? (items.find((i) => i.value === value)?.label ?? resolvedPlaceholder)
    : resolvedPlaceholder

  const wheelPicker =
    wheelEngine === 'expo-ui' ? (
      <ExpoWheelPickerField
        items={items}
        selectedIndex={pendingIndex}
        onSelectIndex={handleSelectIndex}
        enabled={!disabled}
      />
    ) : (
      <WheelPickerView
        items={items}
        selectedIndex={pendingIndex}
        onSelectIndex={handleSelectIndex}
        haptic={haptic}
      />
    )

  const footerContent = useMemo(
    () => (
      <MyButton
        type="primary"
        text={t('common.confirm')}
        width="full"
        onPress={handleFooterConfirm}
      />
    ),
    [t, handleFooterConfirm],
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
              placeholder={resolvedPlaceholder}
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
          title={resolvedTitle}
          showClose
          onClosed={closePicker}
          pressBackdropToClose
          useScrollView={false}
          footer={footerContent}
        >
          <BottomSheetView style={styles.pickerContent}>{wheelPicker}</BottomSheetView>
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
