import { memo } from 'react'

import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { MySectionCardProps } from './type'

function MySectionCardInner({ title, children, radius = 'large', gap }: MySectionCardProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()

  return (
    <MySurface
      elevation="soft/down/small"
      radius={radius}
      backgroundColor={getColor('fill/background/tertiary')}
      style={styles.surface}
    >
      <MyView style={gap ? [styles.body, { gap }] : styles.body}>
        {title ? (
          <MyText typography="h3" style={styles.title}>
            {title}
          </MyText>
        ) : null}
        {children}
      </MyView>
    </MySurface>
  )
}

export default memo(MySectionCardInner)
