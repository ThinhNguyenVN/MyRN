import { memo } from 'react'
import { Modal } from 'react-native'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { isAndroid, isIos } from '@/constants/dimensions'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { NativeFullscreenModalProps } from './type'

function NativeFullscreenModalComponent({
  visible,
  title,
  children,
  onClose,
  presentation = 'pageSheet',
  onDismiss,
  closeAccessibilityLabel,
  footer,
  avoidKeyboard = true,
  bodyStyle,
}: NativeFullscreenModalProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const iosPresentation = isIos ? presentation : undefined
  const rootStyle = isAndroid
    ? [styles.root, styles.rootAndroid]
    : presentation === 'fullScreen'
      ? [styles.root, styles.rootIosFullScreen]
      : [styles.root, styles.rootIosPageSheet]
  const closeLabel = closeAccessibilityLabel ?? t('common.close')

  const inner = (
    <>
      <MyView style={styles.header} fillParent={false}>
        <MyText typography="h3" style={styles.title} numberOfLines={1}>
          {title}
        </MyText>
        <MyPressable
          onPress={onClose}
          haptic={false}
          animatedType="opacity"
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          style={styles.closeHit}
        >
          <MyIcon name="close" size={24} color="icon/active/primary" />
        </MyPressable>
      </MyView>
      <MyView style={[styles.body, bodyStyle]}>{children}</MyView>
      {footer ? (
        <MyView style={styles.footer} fillParent={false}>
          {footer}
        </MyView>
      ) : null}
    </>
  )

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={iosPresentation}
      onRequestClose={onClose}
      onDismiss={isIos ? onDismiss : undefined}
    >
      <MyView style={rootStyle} backgroundColor="fill/background/primary">
        {avoidKeyboard ? (
          <KeyboardAvoidingView behavior="padding" automaticOffset style={styles.keyboardAvoid}>
            {inner}
          </KeyboardAvoidingView>
        ) : (
          <MyView style={styles.keyboardAvoid}>{inner}</MyView>
        )}
      </MyView>
    </Modal>
  )
}

export default memo(NativeFullscreenModalComponent)
