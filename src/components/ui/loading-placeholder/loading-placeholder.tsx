import { memo } from 'react'

import MySkeleton from '@/components/elements/my-skeleton'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { LoadingPlaceholderProps } from './type'

function LoadingPlaceholder({ count = 3, preset = 'listRow', style }: LoadingPlaceholderProps) {
  const styles = useThemedStyles(generateStyles)

  return (
    <MyView style={[styles.wrap, style]}>
      <MySkeleton preset={preset} count={count} />
    </MyView>
  )
}

export default memo(LoadingPlaceholder)
