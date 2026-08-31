import { memo, useCallback, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ImagePreview } from '@/components/ui/image-preview'
import { useThemedStyles } from '@/theme/theme-context'

import { SliderButton } from './slider-button'
import { SliderPage } from './slider-page'
import { SliderThumbnails } from './slider-thumbnails'
import { generateStyles } from './styles'
import type { ImageSliderProps } from './type'

const keyExtractor = (item: string, index: number) => `${item}-${index}`

export const ImageSlider = memo(function ImageSlider({
  images,
  label,
  aspectRatio = 16 / 9,
  style,
}: ImageSliderProps) {
  const styles = useThemedStyles(generateStyles)
  const listRef = useRef<FlatList<string>>(null)
  const [sliderSize, setSliderSize] = useState({ width: 0, height: 0 })
  const [activeIndex, setActiveIndex] = useState(0)
  const [previewVisible, setPreviewVisible] = useState(false)
  const lastIndex = Math.max(images.length - 1, 0)
  const { width: sliderWidth, height: sliderHeight } = sliderSize
  const listStyle = useMemo(
    () => [styles.list, { width: sliderWidth, height: sliderHeight }],
    [sliderHeight, sliderWidth, styles.list],
  )
  const listContentStyle = useMemo(() => ({ height: sliderHeight }), [sliderHeight])

  const goToIndex = useCallback(
    (index: number) => {
      const nextIndex = Math.min(Math.max(index, 0), lastIndex)
      setActiveIndex(nextIndex)
      listRef.current?.scrollToOffset({
        offset: nextIndex * sliderWidth,
        animated: true,
      })
    },
    [lastIndex, sliderWidth],
  )

  const handleLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      const { width, height } = nativeEvent.layout
      setSliderSize((current) =>
        current.width === width && current.height === height ? current : { width, height },
      )
      listRef.current?.scrollToOffset({
        offset: activeIndex * width,
        animated: false,
      })
    },
    [activeIndex],
  )

  const handleMomentumScrollEnd = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!sliderWidth) return
      const nextIndex = Math.round(nativeEvent.contentOffset.x / sliderWidth)
      setActiveIndex(Math.min(Math.max(nextIndex, 0), lastIndex))
    },
    [lastIndex, sliderWidth],
  )

  const handleOpenPreview = useCallback((index: number) => {
    setActiveIndex(index)
    setPreviewVisible(true)
  }, [])
  const handleClosePreview = useCallback(() => setPreviewVisible(false), [])

  const renderImage = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <SliderPage
        image={item}
        index={index}
        width={sliderWidth}
        height={sliderHeight}
        onPress={handleOpenPreview}
      />
    ),
    [handleOpenPreview, sliderHeight, sliderWidth],
  )
  const getItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, index: number) => ({
      length: sliderWidth,
      offset: sliderWidth * index,
      index,
    }),
    [sliderWidth],
  )

  const handlePreviousPress = useCallback(
    () => goToIndex(activeIndex - 1),
    [activeIndex, goToIndex],
  )
  const handleNextPress = useCallback(() => goToIndex(activeIndex + 1), [activeIndex, goToIndex])

  if (!images.length) return null

  return (
    <MyView style={[styles.container, style]}>
      <MyView
        backgroundColor="fill/background/secondary"
        elevation="soft/down/large"
        radius="medium"
        fillParent
        style={[styles.frame, { aspectRatio }]}
        onLayout={handleLayout}
      >
        {sliderWidth > 0 && sliderHeight > 0 ? (
          <FlatList
            key={`image-slider-${sliderWidth}-${sliderHeight}`}
            ref={listRef}
            horizontal
            pagingEnabled
            data={images}
            extraData={sliderWidth}
            renderItem={renderImage}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            initialScrollIndex={activeIndex}
            style={listStyle}
            contentContainerStyle={listContentStyle}
            showsHorizontalScrollIndicator={false}
            bounces={false}
            removeClippedSubviews={false}
            scrollEnabled={images.length > 1}
            onMomentumScrollEnd={handleMomentumScrollEnd}
          />
        ) : null}

        {images.length > 1 ? (
          <>
            <SliderButton
              direction="previous"
              disabled={activeIndex === 0}
              onPress={handlePreviousPress}
            />
            <SliderButton
              direction="next"
              disabled={activeIndex === lastIndex}
              onPress={handleNextPress}
            />
            <MyView style={styles.counter}>
              <MyText typography="label" style={styles.counterText}>
                {activeIndex + 1} / {images.length}
              </MyText>
            </MyView>
          </>
        ) : null}
      </MyView>

      {images.length > 1 ? (
        <SliderThumbnails
          images={images}
          label={label}
          activeIndex={activeIndex}
          onSelect={goToIndex}
        />
      ) : null}

      <ImagePreview
        images={images}
        activeIndex={activeIndex}
        visible={previewVisible}
        label={label}
        onClose={handleClosePreview}
        onIndexChange={goToIndex}
      />
    </MyView>
  )
})
