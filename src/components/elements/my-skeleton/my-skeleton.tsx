import React, { memo, useMemo } from 'react'
import Skeleton from 'react-native-reanimated-skeleton'

import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { getSkeletonLayout, resolveSkeletonCount } from './skeleton-utils'
import { generateStyles } from './styles'
import type { MySkeletonProps } from './type'

const MySkeleton: React.FC<MySkeletonProps> = ({
  preset = 'listRow',
  count,
  isLoading = true,
  style,
  ...rest
}) => {
  const styles = useThemedStyles(generateStyles)
  const layout = useMemo(() => getSkeletonLayout(preset), [preset])
  const resolvedCount = resolveSkeletonCount(count)
  const keys = useMemo(
    () => Array.from({ length: resolvedCount }, (_, index) => `skeleton-${preset}-${index}`),
    [preset, resolvedCount],
  )

  return (
    <MyView {...rest} style={[styles.list, style]}>
      {keys.map((key) => (
        <MyView key={key} style={styles.item}>
          <Skeleton isLoading={isLoading} layout={layout} containerStyle={styles.itemInner} />
        </MyView>
      ))}
    </MyView>
  )
}

MySkeleton.displayName = 'MySkeleton'

export default memo(MySkeleton)
