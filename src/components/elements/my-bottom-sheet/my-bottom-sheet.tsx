import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Dimensions, Modal, Pressable, ScrollView, View } from 'react-native'

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
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'

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
      useScrollView = true,
      ...rest
    },
    ref,
  ) => {
    const { getSpacing } = useTheme()
    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const styles = useThemedStyles(generateStyles)
    const insets = useSafeAreaInsets()
    const isMobileSize = useIsMobileSize()

    const isMobile = isMobileSize
    const [modalVisible, setModalVisible] = useState(false)

    const close = useCallback(() => {
      if (isMobile) {
        bottomSheetRef.current?.dismiss()
      } else {
        setModalVisible(false)
      }
    }, [isMobile])

    const open = useCallback(() => {
      if (isMobile) {
        bottomSheetRef.current?.present()
      } else {
        setModalVisible(true)
      }
    }, [isMobile])

    useImperativeHandle(ref, () => ({ open, close }), [open, close])

    const handleDismiss = useCallback(() => {
      onClosed?.()
      onDismiss?.()
    }, [onClosed, onDismiss])

    const handleModalClose = useCallback(() => {
      setModalVisible(false)
      handleDismiss()
    }, [handleDismiss])

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

    const footerComponent = useCallback(
      (footerProps: BottomSheetFooterProps) => {
        if (!footer) return undefined

        return (
          <BottomSheetFooter {...footerProps}>
            <MyView style={styles.footer}>{footer}</MyView>
          </BottomSheetFooter>
        )
      },
      [footer, styles.footer],
    )

    const backdropComponent = useMemo(
      () => createBackdropComponent(pressBackdropToClose),
      [pressBackdropToClose],
    )

    const windowHeight = Dimensions.get('window').height

    const withFooterStyle = !!footerComponent ? { paddingBottom: 130 } : { paddingBottom: 100 }
    const modalPanelStyle = useMemo(
      () => [styles.modalPanel, { maxHeight: windowHeight * 0.8 }],
      [styles.modalPanel, windowHeight],
    )

    if (!isMobile) {
      return (
        <Modal
          visible={modalVisible}
          transparent
          onRequestClose={handleModalClose}
          animationType="fade"
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={pressBackdropToClose ? handleModalClose : undefined}
          >
            <Pressable style={modalPanelStyle} onPress={() => {}}>
              {header ?? headerContent}
              <ScrollView
                contentContainerStyle={[styles.content, contentContainerStyle]}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
              {footer ? <MyView style={styles.modalFooter}>{footer}</MyView> : null}
            </Pressable>
          </Pressable>
        </Modal>
      )
    }

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
        {useScrollView ? (
          <BottomSheetScrollView
            contentContainerStyle={[styles.content, withFooterStyle, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </BottomSheetScrollView>
        ) : (
          <View style={[styles.content, contentContainerStyle]}>{children}</View>
        )}
      </BottomSheetModal>
    )
  },
)

MyBottomSheet.displayName = 'MyBottomSheet'

export default memo(MyBottomSheet)
