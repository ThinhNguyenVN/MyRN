import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

import { BottomSheetModal, BottomSheetScrollView } from '@expo/ui/community/bottom-sheet'

import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import MyPressable from '@/components/elements/my-pressable'
import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'

import type { MyBottomSheetProps, MyBottomSheetRef } from './type'
import { generateStyles } from './styles'

/** Re-export cho các nơi cũ wrap content bằng BottomSheetView/ScrollView. */
export { BottomSheetView, BottomSheetScrollView } from '@expo/ui/community/bottom-sheet'

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
      visible: visibleProp,
      onClose: onCloseProp,
      index,
      onChange,
    },
    ref,
  ) => {
    const { getColor } = useTheme()
    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const styles = useThemedStyles(generateStyles)
    const isMobileSize = useIsMobileSize()
    /** Mobile = bottom sheet thật (kéo, snap) trên mọi platform. Desktop web = modal thường. */
    const useBottomSheet = isMobileSize
    /** Controlled mode: cha truyền visible — state nội bộ chỉ dùng khi không controlled (web desktop modal). */
    const [internalVisible, setInternalVisible] = useState(false)

    const panDownEnabled = enablePanDownToClose && pressBackdropToClose

    const open = useCallback(() => {
      if (useBottomSheet) {
        bottomSheetRef.current?.present()
        return
      }
      if (visibleProp === undefined) {
        setInternalVisible(true)
      }
    }, [useBottomSheet, visibleProp])

    const close = useCallback(() => {
      if (useBottomSheet) {
        bottomSheetRef.current?.dismiss()
        return
      }
      if (visibleProp === undefined) {
        setInternalVisible(false)
      }
    }, [useBottomSheet, visibleProp])

    /**
     * Đóng do TƯƠNG TÁC người dùng (X / backdrop / hệ thống) — báo cha qua onClose/onClosed.
     * Controlled mode: cha tự flip `visible`; internal mode: tự tắt.
     */
    const requestClose = useCallback(() => {
      if (useBottomSheet) {
        bottomSheetRef.current?.dismiss()
        return
      }
      if (visibleProp !== undefined) {
        onCloseProp?.()
        return
      }
      setInternalVisible(false)
      onClosed?.()
      onDismiss?.()
    }, [useBottomSheet, visibleProp, onCloseProp, onClosed, onDismiss])

    useImperativeHandle(ref, () => ({ open, close }), [open, close])

    const handleDismiss = useCallback(() => {
      onClosed?.()
      onDismiss?.()
    }, [onClosed, onDismiss])

    /**
     * `padding: 0` đè lên `padding: '0 16px'` hard-code trong vaul (web polyfill của
     * @expo/ui bottom-sheet) — nếu không, header/content/footer bên trong luôn bị ăn
     * thêm 16px hai bên dù đã tự set padding riêng, border không sát rìa được.
     * Native bỏ qua field lạ trong backgroundStyle nên không ảnh hưởng iOS/Android.
     */
    const resolvedBackgroundStyle = useMemo(
      () => [
        { backgroundColor: getColor('fill/background/tertiary'), padding: 0 },
        backgroundStyle,
      ],
      [getColor, backgroundStyle],
    )

    const headerContent = useMemo(() => {
      if (header) return null
      if (!title) return null
      return (
        <MyView style={styles.header}>
          {showClose && <View style={styles.headerClose} />}
          <MyView style={styles.headerTitleWrap}>
            <MyText typography="subtitle" style={styles.headerTitle}>
              {title}
            </MyText>
          </MyView>
          {showClose && (
            <MyPressable
              style={styles.headerClose}
              onPress={requestClose}
              accessibilityRole="button"
            >
              <MyIcon name="close" color="icon/active/primary" />
            </MyPressable>
          )}
        </MyView>
      )
    }, [
      header,
      title,
      showClose,
      requestClose,
      styles.header,
      styles.headerClose,
      styles.headerTitleWrap,
      styles.headerTitle,
    ])

    const footerNode = footer ? <MyView style={styles.footer}>{footer}</MyView> : null

    // Đồng bộ controlled visible cho bottom sheet (mobile)
    React.useEffect(() => {
      if (!useBottomSheet || visibleProp === undefined) return
      if (visibleProp) bottomSheetRef.current?.present()
      else bottomSheetRef.current?.dismiss()
    }, [useBottomSheet, visibleProp])

    // Lồng trong filter sheet: backdrop trong suốt để outer không tối thêm (chỉ áp dụng cho BottomSheetModal).

    if (!useBottomSheet) {
      /** Mobile responsive: neo đáy; có snapPoints → height cố định (footer luôn sát đáy panel). */
      const windowHeight = Dimensions.get('window').height
      const maxHeightPct = Number(String(snapPoints?.[0] ?? '85%').replace('%', ''))
      const maxHeight: DimensionValue = `${maxHeightPct}%`
      const hasFixedHeight = Boolean(snapPoints?.length)
      const panelStyle: StyleProp<ViewStyle> = [
        styles.webSheetPanel,
        hasFixedHeight
          ? { height: Math.round((windowHeight * maxHeightPct) / 100) }
          : { maxHeight },
      ]
      const isOpen = visibleProp ?? internalVisible
      const body = useScrollView ? (
        <ScrollView
          style={hasFixedHeight ? styles.webSheetScrollFixed : styles.webSheetScroll}
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      )
      return (
        <Modal visible={isOpen} transparent onRequestClose={requestClose} animationType="none">
          <Pressable
            style={styles.webSheetOverlay}
            onPress={pressBackdropToClose ? requestClose : undefined}
          >
            <Pressable style={panelStyle} onPress={() => {}}>
              {header ?? headerContent}
              {body}
              {footer ? <MyView style={styles.modalFooter}>{footer}</MyView> : null}
            </Pressable>
          </Pressable>
        </Modal>
      )
    }

    const sheetBody = useScrollView ? (
      <>
        <BottomSheetScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </BottomSheetScrollView>
        {footerNode}
      </>
    ) : (
      <>
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
        {footerNode}
      </>
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
