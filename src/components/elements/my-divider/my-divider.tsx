import React, { memo } from 'react'

import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { resolveDividerOrientation } from './divider-utils'
import { generateStyles } from './styles'
import type { MyDividerProps } from './type'

const MyDivider: React.FC<MyDividerProps> = ({ orientation, style, ...rest }) => {
  const styles = useThemedStyles(generateStyles)
  const resolved = resolveDividerOrientation(orientation)
  const lineStyle = resolved === 'vertical' ? styles.vertical : styles.horizontal

  return <MyView {...rest} style={[lineStyle, style]} />
}

MyDivider.displayName = 'MyDivider'

export default memo(MyDivider)
