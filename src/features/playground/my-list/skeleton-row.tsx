import React, { memo } from 'react'
import { View } from 'react-native'
import Skeleton from 'react-native-reanimated-skeleton'

import { useThemedStyles } from '@/theme/theme-context'

import {
  generateStyles,
  skeletonTextLayout,
  skeletonThumbLayout,
} from '@/features/playground/my-list/styles'

export const SkeletonRow = memo(function SkeletonRow() {
  const styles = useThemedStyles(generateStyles)
  return (
    <View style={styles.skeletonRow}>
      <Skeleton
        isLoading
        layout={skeletonThumbLayout}
        containerStyle={styles.skeletonThumbContainer}
      />
      <Skeleton isLoading layout={skeletonTextLayout} containerStyle={styles.skeletonTextBlock} />
    </View>
  )
})
