import React, { memo } from 'react'
import { Image } from 'expo-image'
import { View } from 'react-native'

import { useThemedStyles } from '@/theme/theme-context'

import { CROSSFADE_MS } from './constants'
import { generateStyles } from './styles'
import type { HeroBackgroundProps } from './type'

const HeroBackgroundInner: React.FC<HeroBackgroundProps> = ({ images, currentSlide, style }) => {
  const styles = useThemedStyles(generateStyles)
  const image = images[currentSlide]

  return (
    <View style={[style, styles.heroBackgroundBase]} pointerEvents="none">
      {image ? (
        <Image
          source={image}
          style={styles.heroBackgroundBaseImage}
          contentFit="cover"
          transition={CROSSFADE_MS}
          cachePolicy="memory-disk"
        />
      ) : null}
      <View style={styles.heroBackgroundOverlay} />
    </View>
  )
}

export const HeroBackground = memo(HeroBackgroundInner)
