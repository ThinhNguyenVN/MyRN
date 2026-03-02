import React, { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef } from 'react'
import { Dimensions, View } from 'react-native'

import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetFooter,
  BottomSheetBackdrop,
  type BottomSheetFooterProps,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'

import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import type { MyBottomSheetProps, MyBottomSheetRef } from './type'
import { generateStyles } from './styles'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MyPressable from '../my-pressable'

function SheetHandle() {
  const styles = useThemedStyles(generateStyles)
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleIndicator} />
    </View>
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
      showClose = false,
      onClosed,
      header,
      footer,
      pressBackdropToClose = true,
      children,
      contentContainerStyle,
      enablePanDownToClose = true,
      onDismiss,
      style,
      backgroundStyle,
      ...rest
    },
    ref,
  ) => {
    const { getSpacing } = useTheme()
    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const styles = useThemedStyles(generateStyles)
    const insets = useSafeAreaInsets()
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
      if (header) return null
      if (title) {
        return (
          <MyView style={styles.header}>
            {showClose && <View style={styles.headerClose} />}
            <MyView style={styles.headerTitleWrap}>
              <MyText typography="subtitle" style={styles.headerTitle}>
                {title}
              </MyText>
            </MyView>
            {showClose && (
              <MyPressable style={styles.headerClose} onPress={close}>
                <MyIcon name="close" color="icon/active/primary" />
              </MyPressable>
            )}
          </MyView>
        )
      }
      return null
    }, [
      header,
      title,
      showClose,
      close,
      styles.header,
      styles.headerClose,
      styles.headerTitleWrap,
      styles.headerTitle,
    ])

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
        onDismiss={handleDismiss}
        enablePanDownToClose={enablePanDownToClose}
        style={[style, styles.sheet]}
        backgroundStyle={backgroundStyle}
        handleComponent={SheetHandle}
        backdropComponent={backdropComponent}
        footerComponent={footerComponent}
        enableDynamicSizing
        keyboardBehavior={'fillParent'}
        enableBlurKeyboardOnGesture={false}
        maxDynamicContentSize={Dimensions.get('window').height - (insets.top || getSpacing('x6'))}
        {...rest}
      >
        {header ?? headerContent}
        <BottomSheetScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </BottomSheetScrollView>
      </BottomSheetModal>
    )
  },
)

MyBottomSheet.displayName = 'MyBottomSheet'

export default memo(MyBottomSheet)
