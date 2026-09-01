import { createElement, memo, useCallback, useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyImage from '@/components/elements/my-image'
import MyPressable from '@/components/elements/my-pressable'
import MySpinner from '@/components/elements/my-spinner'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { isWeb } from '@/constants/dimensions'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { useImageDropZone } from './hooks'
import { generateStyles } from './styles'
import type { ImagePickerFieldProps, PickedImage } from './type'

const DRAG_ANIM_MS = 180

const WEB_HOST_STYLE = {
  position: 'relative' as const,
  width: '100%',
}

function ImagePickerFieldInner({
  imageUri,
  isUploading = false,
  errorMessage,
  emptyTitle,
  emptyHint,
  clearAccessibilityLabel,
  onPick,
  onClear,
  onImagePicked,
  onPickError,
  pickOptions,
  readOnly = false,
  shape = 'square',
}: ImagePickerFieldProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()
  const isAvatar = shape === 'circle'
  const hasPreview = Boolean(imageUri)
  const showClear = hasPreview && !isUploading && !readOnly
  const dropHandler = readOnly ? undefined : onImagePicked
  const dragProgress = useSharedValue(0)

  const idleBorder = getColor('border/inactive/secondary')
  const activeBorder = getColor('border/active/primary')
  const idleFill = getColor('fill/background/secondary')
  const activeFill = getColor('fill/background/tertiary')

  const handleDroppedImage = useCallback(
    (image: PickedImage) => {
      dropHandler?.(image)
    },
    [dropHandler],
  )

  const { isDragging, hostRef } = useImageDropZone({
    disabled: isUploading || readOnly || !dropHandler,
    pickOptions,
    onImagePicked: handleDroppedImage,
    onError: onPickError,
  })

  useEffect(() => {
    dragProgress.value = withTiming(isDragging ? 1 : 0, {
      duration: DRAG_ANIM_MS,
      easing: Easing.out(Easing.cubic),
    })
  }, [dragProgress, isDragging])

  const dropzoneAnimatedStyle = useAnimatedStyle(() => {
    const p = dragProgress.value
    return {
      borderColor: interpolateColor(p, [0, 1], [idleBorder, activeBorder]),
      backgroundColor: interpolateColor(p, [0, 1], [idleFill, activeFill]),
      transform: [{ scale: interpolate(p, [0, 1], [1, 1.015]) }],
    }
  }, [activeBorder, activeFill, idleBorder, idleFill])

  const dropzoneBody = (
    <View style={isAvatar ? styles.dropzoneHostAvatar : styles.dropzoneHost}>
      <Animated.View
        style={[isAvatar ? styles.dropzoneAvatar : styles.dropzone, dropzoneAnimatedStyle]}
      >
        <MyPressable
          style={
            hasPreview || isUploading
              ? styles.dropzonePressableFilled
              : isAvatar
                ? styles.dropzonePressableAvatar
                : styles.dropzonePressable
          }
          onPress={onPick}
          disabled={isUploading || readOnly}
          accessibilityLabel={isAvatar ? emptyTitle : undefined}
        >
          <ConditionRenderer when={hasPreview}>
            <View style={styles.preview} pointerEvents="none">
              <MyImage
                url={imageUri ?? ''}
                style={styles.previewImage}
                contentFit="cover"
                cachePolicy="none"
                lockAspectRatio={false}
              />
            </View>
          </ConditionRenderer>
          <ConditionRenderer when={!hasPreview && !isUploading && isAvatar}>
            <MyIcon name="camera-outline" size={32} color="icon/inactive/primary" />
          </ConditionRenderer>
          <ConditionRenderer when={!hasPreview && !isUploading && !isAvatar}>
            <>
              <MyIcon name="cloud-upload-outline" size={40} color="icon/inactive/primary" />
              <MyText typography="body">{emptyTitle}</MyText>
              <ConditionRenderer when={Boolean(emptyHint)}>
                <MyText typography="caption" style={styles.hint}>
                  {emptyHint}
                </MyText>
              </ConditionRenderer>
            </>
          </ConditionRenderer>
        </MyPressable>
      </Animated.View>

      <ConditionRenderer when={isUploading}>
        <View style={styles.uploadingOverlay} pointerEvents="none">
          <MySpinner />
        </View>
      </ConditionRenderer>

      <ConditionRenderer when={showClear}>
        <MyButton.Icon
          icon="close"
          type="light"
          size="small"
          elevation="none"
          onPress={onClear}
          disabled={isUploading}
          containerStyle={styles.clearButton}
          accessibilityLabel={clearAccessibilityLabel}
        />
      </ConditionRenderer>

      <ConditionRenderer when={isDragging}>
        <View style={styles.dragOverlay} pointerEvents="none">
          <MyText typography="body" style={styles.dragOverlayText}>
            {emptyTitle}
          </MyText>
        </View>
      </ConditionRenderer>
    </View>
  )

  return (
    <MyView style={isAvatar ? styles.rootAvatar : styles.root}>
      {isWeb
        ? createElement('div', { ref: hostRef, style: WEB_HOST_STYLE }, dropzoneBody)
        : dropzoneBody}

      <ConditionRenderer when={Boolean(errorMessage)}>
        <MyText typography="caption" style={styles.error}>
          {errorMessage}
        </MyText>
      </ConditionRenderer>
    </MyView>
  )
}

export const ImagePickerField = memo(ImagePickerFieldInner)
