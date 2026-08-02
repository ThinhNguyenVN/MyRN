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
  type BottomSheetMethods,
} from '@expo/ui/community/bottom-sheet'

import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import MyPressable from '@/components/elements/my-pressable'
import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'

import type { MyBottomSheetProps, MyBottomSheetRef } from './type'
import { generateStyles } from './styles'

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
      enableDynamicSizing,
      snapPoints,
      index,
      onChange,
    },
    ref,
  ) => {
    const { getColor } = useTheme()
    const bottomSheetRef = useRef<BottomSheetMethods>(null)
    const styles = useThemedStyles(generateStyles)
    const isMobile = useIsMobileSize()
    const [modalVisible, setModalVisible] = useState(false)

    const panDownEnabled = enablePanDownToClose && pressBackdropToClose

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

    const resolvedBackgroundStyle = useMemo(
      () => [{ backgroundColor: getColor('fill/background/tertiary') }, backgroundStyle],
      [getColor, backgroundStyle],
    )

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

    const footerNode = footer ? <MyView style={styles.footer}>{footer}</MyView> : null

    const windowHeight = Dimensions.get('window').height
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

    const sheetBody = useScrollView ? (
      <BottomSheetScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
        {footerNode}
      </BottomSheetScrollView>
    ) : (
      <View style={[styles.content, contentContainerStyle]}>
        {children}
        {footerNode}
      </View>
    )

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        onDismiss={handleDismiss}
        enablePanDownToClose={panDownEnabled}
        style={[style, styles.sheet]}
        backgroundStyle={resolvedBackgroundStyle}
        enableDynamicSizing={enableDynamicSizing ?? !snapPoints}
        snapPoints={snapPoints}
        index={index}
        onChange={onChange}
      >
        {header ?? headerContent}
        {sheetBody}
      </BottomSheetModal>
    )
  },
)

MyBottomSheet.displayName = 'MyBottomSheet'

export default memo(MyBottomSheet)
