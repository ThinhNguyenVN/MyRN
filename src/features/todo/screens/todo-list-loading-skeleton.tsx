import React, { memo } from 'react'
import { View } from 'react-native'
import Skeleton from 'react-native-reanimated-skeleton'

import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles, todoSkeletonRowLayout } from './styles'

const SKELETON_ROW_COUNT = 6

export const TodoListLoadingSkeleton = memo(function TodoListLoadingSkeleton() {
  const styles = useThemedStyles(generateStyles)

  return (
    <View style={styles.skeletonListWrap}>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => (
        <View key={i} style={styles.skeletonCard}>
          <Skeleton
            isLoading
            layout={todoSkeletonRowLayout}
            containerStyle={styles.skeletonCardInner}
          />
        </View>
      ))}
    </View>
  )
})
