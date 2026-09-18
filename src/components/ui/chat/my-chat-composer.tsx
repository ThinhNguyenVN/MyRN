import React, { memo, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'

import MyBottomSheet, { type MyBottomSheetRef } from '@/components/elements/my-bottom-sheet'
import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { pickImage, pickImageFromCamera } from '@/components/ui/image-picker'
import { isWeb } from '@/constants/dimensions'
import { useThemedStyles } from '@/theme/theme-context'

import { COMPOSER_ACTIONS_HEIGHT, MIN_COMPOSER_HEIGHT, useComposerInputLayout } from './hooks'
import MyChatComposerInput from './my-chat-composer-input'
import { generateStyles } from './styles'

export interface MyChatComposerProps {
  onSend: (text: string) => void
  onSendImage: (imageUri: string) => void
  disabled?: boolean
}

function MyChatComposer({ onSend, onSendImage, disabled = false }: MyChatComposerProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const attachSheetRef = useRef<MyBottomSheetRef>(null)
  const hasText = text.trim().length > 0
  const {
    isMobileSize,
    isExpanded,
    isInputScrollable,
    isHeightLocked,
    isClipHeight,
    isRemeasuring,
    contentHeight,
    composerMaxHeight,
    animatedComposerPaddingStyle,
    animatedInputAreaStyle,
    expandIconAnimatedStyle,
    collapsePanGesture,
    applyTextLayout,
    applyMeasuredHeight,
    handleContentSizeChange,
    handleInputScroll,
    handleToggleExpand,
    resetComposerLayout,
    inputResetKey,
  } = useComposerInputLayout()

  const handleChangeText = useCallback(
    (next: string) => {
      applyTextLayout(next, text.length)
      setText(next)
    },
    [applyTextLayout, text.length],
  )

  const handleSend = useCallback(() => {
    if (!text.trim() || disabled) {
      return
    }
    const toSend = text
    setText('')
    resetComposerLayout()
    onSend(toSend)
  }, [disabled, onSend, resetComposerLayout, text])

  const runPick = useCallback(
    async (source: 'camera' | 'library') => {
      attachSheetRef.current?.close()
      try {
        const picked = source === 'camera' ? await pickImageFromCamera() : await pickImage()
        onSendImage(picked.uri)
      } catch {
        // Cancel / permission-denied — no destination surface in Phase 1-4; silently ignore.
      }
    },
    [onSendImage],
  )

  const handlePickCamera = useCallback(() => {
    void runPick('camera')
  }, [runPick])

  const handlePickLibrary = useCallback(() => {
    void runPick('library')
  }, [runPick])

  const handleAttachPress = useCallback(() => {
    if (isWeb) {
      void runPick('library')
      return
    }
    attachSheetRef.current?.open()
  }, [runPick])

  const composerInputField = (
    <MyChatComposerInput
      key={`chat-composer-input-${inputResetKey}`}
      value={text}
      onChangeText={handleChangeText}
      onContentSizeChange={isWeb ? undefined : handleContentSizeChange}
      onMeasuredHeight={isWeb ? applyMeasuredHeight : undefined}
      onScroll={isWeb ? undefined : handleInputScroll}
      multiline
      blurOnSubmit={false}
      scrollEnabled={isExpanded || isInputScrollable}
      lockHeight={isHeightLocked && !isRemeasuring}
      minHeight={isMobileSize ? MIN_COMPOSER_HEIGHT : COMPOSER_ACTIONS_HEIGHT}
      contentHeight={contentHeight}
      lockedHeight={composerMaxHeight}
      placeholder={t('components.chat.composerPlaceholder')}
    />
  )

  const composerInput = (
    <ConditionRenderer when={isMobileSize} fallback={composerInputField}>
      <GestureDetector gesture={collapsePanGesture}>
        <View collapsable={false}>
          <ConditionRenderer when={isClipHeight} fallback={composerInputField}>
            <Animated.View collapsable={false} style={animatedInputAreaStyle}>
              {composerInputField}
            </Animated.View>
          </ConditionRenderer>
        </View>
      </GestureDetector>
    </ConditionRenderer>
  )

  const attachButton = (
    <MyPressable
      onPress={handleAttachPress}
      disabled={disabled}
      hitSlop={8}
      style={styles.composerIconButton}
      accessibilityLabel={t('components.chat.attach')}
    >
      <MyIcon name="add" size={24} color="icon/active/primary" />
    </MyPressable>
  )

  const sendButton = (
    <MyPressable
      onPress={handleSend}
      disabled={disabled || !hasText}
      hitSlop={8}
      style={[
        styles.sendButtonBase,
        hasText ? styles.sendButtonActiveFill : styles.sendButtonInactiveFill,
      ]}
      accessibilityLabel={t('components.chat.send')}
    >
      <MyIcon
        name="send"
        size={18}
        color={hasText ? 'icon/active/primary' : 'icon/inactive/primary'}
      />
    </MyPressable>
  )

  const nativeActions = (
    <MyView style={styles.composerActionsRow}>
      {attachButton}
      <MyView style={styles.composerActionsSpacer} />
      <MyPressable
        onPress={handleToggleExpand}
        hitSlop={8}
        style={styles.expandButton}
        accessibilityRole="button"
        accessibilityLabel={t(isExpanded ? 'components.chat.collapse' : 'components.chat.expand')}
      >
        <Animated.View style={expandIconAnimatedStyle}>
          <MyIcon name="chevron-up" size={22} color="icon/active/primary" />
        </Animated.View>
      </MyPressable>
      {sendButton}
    </MyView>
  )

  return (
    <MyView style={styles.composerRoot} radius="large">
      <Animated.View style={[styles.composerBody, animatedComposerPaddingStyle]}>
        <ConditionRenderer
          when={!isMobileSize}
          fallback={
            <>
              {composerInput}
              {nativeActions}
            </>
          }
        >
          <MyView style={styles.composerWebRow}>
            {attachButton}
            <MyView style={styles.composerWebInputSlot}>{composerInput}</MyView>
            {sendButton}
          </MyView>
        </ConditionRenderer>
      </Animated.View>

      <ConditionRenderer when={isMobileSize}>
        <MyBottomSheet
          ref={attachSheetRef}
          title={t('components.chat.attachTitle')}
          pressBackdropToClose
          contentContainerStyle={styles.sourceSheetBody}
        >
          <MyButton
            text={t('components.chat.attachCamera')}
            left={<MyIcon name="camera-outline" size={18} color="icon/active/primary" />}
            type="light"
            size="small"
            width="full"
            elevation="none"
            onPress={handlePickCamera}
          />
          <MyButton
            text={t('components.chat.attachLibrary')}
            left={<MyIcon name="images-outline" size={18} color="icon/active/primary" />}
            type="light"
            size="small"
            width="full"
            elevation="none"
            onPress={handlePickLibrary}
          />
        </MyBottomSheet>
      </ConditionRenderer>
    </MyView>
  )
}

export default memo(MyChatComposer)
