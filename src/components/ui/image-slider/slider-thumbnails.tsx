import { memo, useCallback } from 'react'
import { ScrollView } from 'react-native'

import MyImage from '@/components/elements/my-image'
import MyPressable from '@/components/elements/my-pressable'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

type SliderThumbnailsProps = {
  images: string[]
  label: string
  activeIndex: number
  onSelect: (index: number) => void
}

export const SliderThumbnails = memo(function SliderThumbnails({
  images,
  label,
  activeIndex,
  onSelect,
}: SliderThumbnailsProps) {
  const styles = useThemedStyles(generateStyles)

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.thumbnails}
    >
      {images.map((image, index) => (
        <SliderThumbnail
          key={`${image}-${index}`}
          image={image}
          index={index}
          label={label}
          selected={index === activeIndex}
          onSelect={onSelect}
        />
      ))}
    </ScrollView>
  )
})

const SliderThumbnail = memo(function SliderThumbnail({
  image,
  index,
  label,
  selected,
  onSelect,
}: {
  image: string
  index: number
  label: string
  selected: boolean
  onSelect: (index: number) => void
}) {
  const styles = useThemedStyles(generateStyles)
  const handlePress = useCallback(() => onSelect(index), [index, onSelect])

  return (
    <MyPressable
      animatedType="opacity"
      style={[styles.thumbnail, selected && styles.thumbnailActive]}
      accessibilityRole="button"
      accessibilityLabel={`Show ${label} image ${index + 1}`}
      accessibilityState={{ selected }}
      onPress={handlePress}
    >
      <MyImage
        url={image}
        style={styles.thumbnailImage}
        imageStyle={styles.thumbnailImage}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    </MyPressable>
  )
})
