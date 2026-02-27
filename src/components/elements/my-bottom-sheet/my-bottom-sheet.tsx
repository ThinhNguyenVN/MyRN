import React, { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef } from 'react'
import { View } from 'react-native'

import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetFooter,
  BottomSheetBackdrop,
  type BottomSheetFooterProps,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'

import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import type { MyBottomSheetProps, MyBottomSheetRef } from './type'
import { generateStyles } from './styles'

const DEFAULT_SNAP_POINTS = ['80%', '100%']

function SheetHandle() {
  const { getColor } = useTheme()
  const styles = useThemedStyles(generateStyles)
  return (
    <MySurface
      elevation="soft/up/small"
      radius="small"
      backgroundColor={getColor('fill/background/primary')}
      style={styles.handleShadow}
    >
      <View style={styles.handleIndicator} />
    </MySurface>
  )
}

function createBackdropComponent(pressBackdropToClose: boolean) {
  function SheetBackdrop(props: BottomSheetBackdropProps) {
    return (
      <BottomSheetBackdrop
        {...props}
        pressBehavior={pressBackdropToClose ? 'close' : 'none'}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    )
  }
  SheetBackdrop.displayName = 'SheetBackdrop'
  return SheetBackdrop
}

const MyBottomSheet = forwardRef<MyBottomSheetRef, MyBottomSheetProps>(
  (
    {
      title,
      onClosed,
      header,
      footer,
      pressBackdropToClose = true,
      children,
      snapPoints = DEFAULT_SNAP_POINTS,
      enablePanDownToClose = true,
      onDismiss,
      style,
      backgroundStyle,
      ...rest
    },
    ref,
  ) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const styles = useThemedStyles(generateStyles)

    const open = useCallback(() => {
      bottomSheetRef.current?.present()
    }, [])

    const close = useCallback(() => {
      bottomSheetRef.current?.dismiss()
    }, [])

    useImperativeHandle(ref, () => ({ open, close }), [open, close])

    const handleDismiss = useCallback(() => {
      onClosed?.()
      onDismiss?.()
    }, [onClosed, onDismiss])

    const headerContent = useMemo(() => {
      if (header) return header
      if (title) {
        return (
          <MyView style={styles.header}>
            <MyText typography="subtitle" style={styles.title}>
              {title}
            </MyText>
          </MyView>
        )
      }
      return null
    }, [header, title, styles.header, styles.title])

    const footerComponent = useMemo(() => {
      if (!footer) return undefined
      function MyBottomSheetFooter(footerProps: BottomSheetFooterProps) {
        return (
          <BottomSheetFooter {...footerProps}>
            <MyView style={styles.footer}>{footer}</MyView>
          </BottomSheetFooter>
        )
      }
      return MyBottomSheetFooter
    }, [footer, styles.footer])

    const backdropComponent = useMemo(
      () => createBackdropComponent(pressBackdropToClose),
      [pressBackdropToClose],
    )

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        onDismiss={handleDismiss}
        enablePanDownToClose={enablePanDownToClose}
        style={[styles.sheet, style]}
        backgroundStyle={[styles.sheetBackground, backgroundStyle]}
        handleComponent={SheetHandle}
        backdropComponent={backdropComponent}
        footerComponent={footerComponent}
        {...rest}
      >
        <View style={styles.sheetInner} pointerEvents="box-none">
          {headerContent}
          <BottomSheetScrollView contentContainerStyle={styles.content}>
            {children}
          </BottomSheetScrollView>
        </View>
      </BottomSheetModal>
    )
  },
)

MyBottomSheet.displayName = 'MyBottomSheet'

export default memo(MyBottomSheet)
