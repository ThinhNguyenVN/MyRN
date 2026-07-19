import { memo, useCallback, useMemo } from 'react'

import MyImage from '@/components/elements/my-image'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

type SliderPageProps = {
  image: string
  index: number
  width: number
  height: number
  onPress: (index: number) => void
}

export const SliderPage = memo(function SliderPage({
  image,
  index,
  width,
  height,
  onPress,
}: SliderPageProps) {
  const styles = useThemedStyles(generateStyles)
  const aspectRatio = height > 0 ? width / height : 1
  const pageStyle = useMemo(() => [styles.page, { width, height }], [height, styles.page, width])
  const imageContainerStyle = useMemo(
    () => [styles.image, { width, height, aspectRatio }],
    [aspectRatio, height, styles.image, width],
  )
  const imageStyle = useMemo(() => ({ width, height }), [height, width])
  const handlePress = useCallback(() => onPress(index), [index, onPress])

  return (
    <MyView style={pageStyle}>
      <MyImage
        url={image}
        style={imageContainerStyle}
        imageStyle={imageStyle}
        contentFit="cover"
        cachePolicy="memory-disk"
        onPress={handlePress}
      />
    </MyView>
  )
})
