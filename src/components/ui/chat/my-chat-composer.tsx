import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'

import MyBottomSheet, { type MyBottomSheetRef } from '@/components/elements/my-bottom-sheet'
import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyImage from '@/components/elements/my-image'
import MyPressable from '@/components/elements/my-pressable'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import {
  deletePickedImageIfTemp,
  pickImageFromCamera,
  pickImages,
  resizeImageIfNeeded,
  type PickedImage,
} from '@/components/ui/image-picker'
import { Toast } from '@/components/ui/toast'
import { isWeb } from '@/constants/dimensions'
import { useThemedStyles } from '@/theme/theme-context'

import {
  ATTACHMENT_RESIZE_BATCH_SIZE,
  COMPOSER_ACTIONS_HEIGHT,
  MAX_CHAT_ATTACHMENTS,
  MIN_COMPOSER_HEIGHT,
} from './constants'
import MyChatComposerInput from './my-chat-composer-input'
import { generateStyles } from './styles'
import { useComposerInputLayout } from './use-composer-input-layout'

export interface MyChatComposerProps {
  onSend: (text: string) => void
  onSendImages: (imageUris: string[], caption?: string) => void
  disabled?: boolean
  /** Reports composer focus so the transcript only dismisses the keyboard it owns. */
  onFocusChange?: (focused: boolean) => void
}

/** A picked image staged in the composer, resizing in the background after being shown. */
interface StagedImage {
  image: PickedImage
  isResizing: boolean
}

/** Stable identity for dedup — `sourceId` survives resize, unlike `uri` (see PickedImage). */
function imageIdentity(image: PickedImage): string {
  return image.sourceId ?? image.uri
}

/**
 * Resizes in small concurrent batches (not all-at-once, to keep peak memory down), calling
 * `onOneResized` as each image finishes so the caller can swap it in immediately rather than
 * waiting for the whole batch.
 */
async function resizeInBatches(
  images: PickedImage[],
  onOneResized: (id: string, resized: PickedImage) => void,
): Promise<void> {
  for (let i = 0; i < images.length; i += ATTACHMENT_RESIZE_BATCH_SIZE) {
    const batch = images.slice(i, i + ATTACHMENT_RESIZE_BATCH_SIZE)
    await Promise.all(
      batch.map(async (image) => {
        const resized = await resizeImageIfNeeded(image)
        onOneResized(imageIdentity(image), resized)
      }),
    )
  }
}

function MyChatComposer({
  onSend,
  onSendImages,
  disabled = false,
  onFocusChange,
}: MyChatComposerProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [pendingImages, setPendingImages] = useState<StagedImage[]>([])
  const attachSheetRef = useRef<MyBottomSheetRef>(null)
  const pendingImagesRef = useRef(pendingImages)
  pendingImagesRef.current = pendingImages
  // Ids removed from `pendingImages` while their resize was still in flight — the resize
  // still finishes in the background (not cancellable), so its result must be deleted on
  // arrival instead of silently leaking a cache file (see `addPickedImages`).
  const removedWhileResizingRef = useRef(new Set<string>())
  const hasText = text.trim().length > 0
  const isResizingAny = pendingImages.some((staged) => staged.isResizing)
  const canSend = (hasText || pendingImages.length > 0) && !isResizingAny
  const canAddMoreImages = pendingImages.length < MAX_CHAT_ATTACHMENTS

  // Discard any staged-but-unsent resized cache files when the composer goes away — the
  // originals (library/camera) are never touched, only copies this module wrote itself.
  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach((staged) => deletePickedImageIfTemp(staged.image))
    }
  }, [])
  const {
    isMobileComposer,
    isExpanded,
    isOverflowing,
    contentHeight,
    composerMaxHeight,
    animatedComposerPaddingStyle,
    animatedInputAreaStyle,
    expandIconAnimatedStyle,
    collapsePanGesture,
    applyMeasuredHeight,
    handleContentSizeChange,
    handleInputScroll,
    handleToggleExpand,
    resetComposerLayout,
  } = useComposerInputLayout()

  const handleFocus = useCallback(() => {
    onFocusChange?.(true)
  }, [onFocusChange])

  const handleBlur = useCallback(() => {
    onFocusChange?.(false)
  }, [onFocusChange])

  const handleSend = useCallback(() => {
    if (disabled || !canSend) {
      return
    }
    const trimmedText = text.trim()
    setText('')
    resetComposerLayout()

    if (pendingImages.length > 0) {
      const imageUris = pendingImages.map((staged) => staged.image.uri)
      setPendingImages([])
      onSendImages(imageUris, trimmedText || undefined)
      return
    }

    onSend(trimmedText)
  }, [canSend, disabled, onSend, onSendImages, pendingImages, resetComposerLayout, text])

  const addPickedImages = useCallback(
    async (newImages: PickedImage[]) => {
      if (newImages.length === 0) {
        return
      }
      const existingIds = new Set(
        pendingImagesRef.current.map((staged) => imageIdentity(staged.image)),
      )
      const seenIds = new Set<string>()
      const deduped: PickedImage[] = []
      let hadDuplicate = false
      for (const image of newImages) {
        const id = imageIdentity(image)
        if (existingIds.has(id) || seenIds.has(id)) {
          hadDuplicate = true
          continue
        }
        seenIds.add(id)
        deduped.push(image)
      }

      const remaining = MAX_CHAT_ATTACHMENTS - pendingImagesRef.current.length
      const accepted = deduped.slice(0, remaining)
      const hadOverflow = accepted.length < deduped.length

      if (hadOverflow) {
        Toast.show({
          type: 'warning',
          text: t('components.chat.attachmentLimitReached', { max: MAX_CHAT_ATTACHMENTS }),
        })
      } else if (hadDuplicate) {
        Toast.show({ type: 'info', text: t('components.chat.attachmentDuplicateSkipped') })
      }

      if (accepted.length === 0) {
        return
      }

      // Show the original (unresized) photo immediately — MyImage's own load skeleton covers
      // the brief decode — instead of waiting for the resize before the user sees anything.
      setPendingImages((current) => [
        ...current,
        ...accepted.map((image): StagedImage => ({ image, isResizing: true })),
      ])

      await resizeInBatches(accepted, (id, resized) => {
        if (removedWhileResizingRef.current.delete(id)) {
          // User already removed this one before its resize landed — nothing left to swap
          // in; just clean up the cache file the resize produced so it isn't orphaned.
          deletePickedImageIfTemp(resized)
          return
        }
        setPendingImages((current) =>
          current.map((staged) =>
            imageIdentity(staged.image) === id ? { image: resized, isResizing: false } : staged,
          ),
        )
      })
    },
    [t],
  )

  const handleRemoveImage = useCallback((id: string) => {
    setPendingImages((current) => {
      const removed = current.find((staged) => imageIdentity(staged.image) === id)
      if (!removed) {
        return current
      }
      if (removed.isResizing) {
        removedWhileResizingRef.current.add(id)
      } else {
        deletePickedImageIfTemp(removed.image)
      }
      return current.filter((staged) => imageIdentity(staged.image) !== id)
    })
  }, [])

  const runPick = useCallback(
    async (source: 'camera' | 'library') => {
      attachSheetRef.current?.close()
      const remaining = MAX_CHAT_ATTACHMENTS - pendingImagesRef.current.length
      if (remaining <= 0) {
        return
      }
      try {
        if (source === 'camera') {
          await addPickedImages([await pickImageFromCamera()])
        } else {
          const { images, skippedCount } = await pickImages({ selectionLimit: remaining })
          // A single unsupported/oversized asset in the batch must not sink the rest — tell
          // the user which ones were dropped and still stage everything that was valid.
          if (skippedCount > 0) {
            Toast.show({
              type: 'warning',
              text: t('components.chat.attachmentUnsupportedSkipped', { count: skippedCount }),
            })
          }
          await addPickedImages(images)
        }
      } catch {
        // Cancel / permission-denied — no destination surface in Phase 1-4; silently ignore.
      }
    },
    [addPickedImages, t],
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
      value={text}
      onChangeText={setText}
      onContentSizeChange={isWeb ? undefined : handleContentSizeChange}
      onMeasuredHeight={isWeb ? applyMeasuredHeight : undefined}
      onScroll={isWeb ? undefined : handleInputScroll}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onEnterSend={handleSend}
      multiline
      scrollEnabled={isExpanded || isOverflowing}
      lockHeight={isOverflowing}
      minHeight={isMobileComposer ? MIN_COMPOSER_HEIGHT : COMPOSER_ACTIONS_HEIGHT}
      contentHeight={contentHeight}
      lockedHeight={composerMaxHeight}
      placeholder={t('components.chat.composerPlaceholder')}
    />
  )

  const composerInput = isMobileComposer ? (
    <GestureDetector gesture={collapsePanGesture}>
      <View collapsable={false}>
        <Animated.View collapsable={false} style={animatedInputAreaStyle}>
          {composerInputField}
        </Animated.View>
      </View>
    </GestureDetector>
  ) : (
    composerInputField
  )

  const attachButton = (
    <MyPressable
      onPress={handleAttachPress}
      disabled={disabled || !canAddMoreImages}
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
      disabled={disabled || !canSend}
      hitSlop={8}
      style={[
        styles.sendButtonBase,
        canSend ? styles.sendButtonActiveFill : styles.sendButtonInactiveFill,
      ]}
      accessibilityLabel={t('components.chat.send')}
    >
      <MyIcon
        name="send"
        size={18}
        color={canSend ? 'icon/active/primary' : 'icon/inactive/primary'}
      />
    </MyPressable>
  )

  const attachmentPreviewRow =
    pendingImages.length > 0 ? (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.attachmentPreviewRow}
        contentContainerStyle={styles.attachmentPreviewContent}
      >
        {pendingImages.map((staged) => {
          const id = imageIdentity(staged.image)
          return (
            <MyView key={id} style={styles.attachmentThumbWrap}>
              <MyImage url={staged.image.uri} style={styles.attachmentThumb} contentFit="cover" />
              <MyPressable
                onPress={() => handleRemoveImage(id)}
                hitSlop={8}
                style={styles.attachmentRemoveBadge}
                accessibilityLabel={t('components.chat.removeAttachment')}
              >
                <MyIcon name="close" size={12} color="icon/contrast/dark" />
              </MyPressable>
            </MyView>
          )
        })}
        <ConditionRenderer when={canAddMoreImages}>
          <MyPressable
            onPress={handleAttachPress}
            disabled={disabled}
            style={styles.attachmentAddTile}
            accessibilityLabel={t('components.chat.attach')}
          >
            <MyIcon name="add" size={20} color="icon/active/primary" />
          </MyPressable>
        </ConditionRenderer>
      </ScrollView>
    ) : null

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
      {attachmentPreviewRow}
      <Animated.View style={[styles.composerBody, animatedComposerPaddingStyle]}>
        <ConditionRenderer
          when={!isMobileComposer}
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

      <ConditionRenderer when={!isWeb}>
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
