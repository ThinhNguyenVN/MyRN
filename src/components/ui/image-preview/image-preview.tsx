import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Modal, Pressable, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ImageLoadEventData } from 'expo-image'

import MyIcon from '@/components/elements/my-icon'
import MyImage from '@/components/elements/my-image'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { ImagePreviewProps } from './type'

type ImageSize = {
  width: number
  height: number
}

const preventBackdropClose = () => undefined

export const ImagePreview = memo(function ImagePreview({
  images,
  activeIndex,
  visible,
  label,
  onClose,
  onIndexChange,
}: ImagePreviewProps) {
  const styles = useThemedStyles(generateStyles)
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const [sourceSize, setSourceSize] = useState<ImageSize | null>(null)
  const lastIndex = Math.max(images.length - 1, 0)
  const activeImage = images[activeIndex]
  const renderedImageSize = useMemo(() => {
    if (!sourceSize || sourceSize.width <= 0 || sourceSize.height <= 0) {
      return { width, height }
    }

    const sourceAspectRatio = sourceSize.width / sourceSize.height
    const viewportAspectRatio = width / height

    if (viewportAspectRatio > sourceAspectRatio) {
      return { width: height * sourceAspectRatio, height }
    }

    return { width, height: width / sourceAspectRatio }
  }, [height, sourceSize, width])
  const imageFrameStyle = useMemo(
    () => [styles.imageFrame, renderedImageSize],
    [renderedImageSize, styles.imageFrame],
  )
  const closeButtonStyle = useMemo(
    () => [styles.closeButton, { top: insets.top + 16 }],
    [insets.top, styles.closeButton],
  )
  const counterStyle = useMemo(
    () => [styles.counter, { bottom: insets.bottom + 16 }],
    [insets.bottom, styles.counter],
  )

  useEffect(() => {
    setSourceSize(null)
  }, [activeImage])

  const handleImageLoad = useCallback((event: ImageLoadEventData) => {
    setSourceSize({
      width: event.source.width,
      height: event.source.height,
    })
  }, [])
  const handlePreviousPress = useCallback(
    () => onIndexChange(Math.max(activeIndex - 1, 0)),
    [activeIndex, onIndexChange],
  )
  const handleNextPress = useCallback(
    () => onIndexChange(Math.min(activeIndex + 1, lastIndex)),
    [activeIndex, lastIndex, onIndexChange],
  )

  if (!activeImage) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <MyView style={styles.container}>
        <Pressable
          style={styles.backdrop}
          accessibilityRole="button"
          accessibilityLabel={`Close ${label} image preview`}
          onPress={onClose}
        />

        <Pressable
          style={imageFrameStyle}
          accessibilityRole="image"
          accessibilityLabel={`${label} image ${activeIndex + 1}`}
          onPress={preventBackdropClose}
        >
          <MyImage
            url={activeImage}
            style={styles.image}
            imageStyle={styles.image}
            contentFit="contain"
            cachePolicy="memory-disk"
            onLoad={handleImageLoad}
          />
        </Pressable>

        <MyPressable
          animatedType="opacity"
          style={closeButtonStyle}
          accessibilityRole="button"
          accessibilityLabel={`Close ${label} image preview`}
          onPress={onClose}
        >
          <MyIcon name="close" size={24} color="icon/active/tertiary" />
        </MyPressable>

        {images.length > 1 ? (
          <>
            <PreviewNavigationButton
              direction="previous"
              disabled={activeIndex === 0}
              onPress={handlePreviousPress}
            />
            <PreviewNavigationButton
              direction="next"
              disabled={activeIndex === lastIndex}
              onPress={handleNextPress}
            />
          </>
        ) : null}

        <MyView style={counterStyle}>
          <MyText typography="label" style={styles.counterText}>
            {activeIndex + 1} / {images.length}
          </MyText>
        </MyView>
      </MyView>
    </Modal>
  )
})

const PreviewNavigationButton = memo(function PreviewNavigationButton({
  direction,
  disabled,
  onPress,
}: {
  direction: 'previous' | 'next'
  disabled: boolean
  onPress: () => void
}) {
  const styles = useThemedStyles(generateStyles)
  const isPrevious = direction === 'previous'

  return (
    <MyPressable
      animatedType="opacity"
      disabled={disabled}
      style={[
        styles.navigationButton,
        isPrevious ? styles.previousButton : styles.nextButton,
        disabled && styles.disabledButton,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${isPrevious ? 'Previous' : 'Next'} preview image`}
      onPress={onPress}
    >
      <MyIcon
        name={isPrevious ? 'chevron-back' : 'chevron-forward'}
        size={24}
        color="icon/active/tertiary"
      />
    </MyPressable>
  )
})
