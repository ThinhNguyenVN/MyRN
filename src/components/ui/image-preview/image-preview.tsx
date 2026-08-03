import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Modal,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { PreviewZoomableImage } from './preview-zoomable-image'
import { generateStyles } from './styles'
import type { ImagePreviewProps } from './type'

const keyExtractor = (item: string, index: number) => `${item}-${index}`

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
  const listRef = useRef<FlatList<string>>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const lastIndex = Math.max(images.length - 1, 0)
  const hasImages = images.length > 0

  const closeButtonStyle = useMemo(
    () => [styles.closeButton, { top: insets.top + 16 }],
    [insets.top, styles.closeButton],
  )
  const counterStyle = useMemo(
    () => [styles.counter, { bottom: insets.bottom + 16 }],
    [insets.bottom, styles.counter],
  )
  const listStyle = useMemo(() => ({ width, height }), [height, width])

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      if (width <= 0) return
      listRef.current?.scrollToOffset({
        offset: index * width,
        animated,
      })
    },
    [width],
  )

  useEffect(() => {
    if (!visible || width <= 0) return
    setIsZoomed(false)
    const frame = requestAnimationFrame(() => {
      scrollToIndex(activeIndex, false)
    })
    return () => cancelAnimationFrame(frame)
    // Only sync when opening / viewport changes — index changes from buttons call scrollToIndex directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, width, scrollToIndex])

  const goToIndex = useCallback(
    (index: number, animated: boolean) => {
      const nextIndex = Math.min(Math.max(index, 0), lastIndex)
      setIsZoomed(false)
      onIndexChange(nextIndex)
      scrollToIndex(nextIndex, animated)
    },
    [lastIndex, onIndexChange, scrollToIndex],
  )

  const handlePreviousPress = useCallback(
    () => goToIndex(activeIndex - 1, true),
    [activeIndex, goToIndex],
  )
  const handleNextPress = useCallback(
    () => goToIndex(activeIndex + 1, true),
    [activeIndex, goToIndex],
  )

  const handleMomentumScrollEnd = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (width <= 0) return
      const nextIndex = Math.round(nativeEvent.contentOffset.x / width)
      const clamped = Math.min(Math.max(nextIndex, 0), lastIndex)
      if (clamped !== activeIndex) {
        setIsZoomed(false)
        onIndexChange(clamped)
      }
    },
    [activeIndex, lastIndex, onIndexChange, width],
  )

  const handleZoomChange = useCallback((zoomed: boolean) => {
    setIsZoomed(zoomed)
  }, [])

  const getItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  )

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <PreviewZoomableImage
        uri={item}
        label={label}
        index={index}
        width={width}
        height={height}
        isActive={visible && index === activeIndex}
        onZoomChange={handleZoomChange}
      />
    ),
    [activeIndex, handleZoomChange, height, label, visible, width],
  )

  if (!hasImages) return null

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
        {width > 0 && height > 0 ? (
          <FlatList
            key={`image-preview-${width}-${height}`}
            ref={listRef}
            horizontal
            pagingEnabled
            data={images}
            extraData={`${activeIndex}-${isZoomed}`}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            style={listStyle}
            showsHorizontalScrollIndicator={false}
            bounces={false}
            scrollEnabled={images.length > 1 && !isZoomed}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            initialScrollIndex={Math.min(activeIndex, lastIndex)}
            removeClippedSubviews={false}
          />
        ) : null}

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
              disabled={activeIndex === 0 || isZoomed}
              onPress={handlePreviousPress}
            />
            <PreviewNavigationButton
              direction="next"
              disabled={activeIndex === lastIndex || isZoomed}
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
