import React, { memo } from 'react'

import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

function MyChatTyping() {
  const styles = useThemedStyles(generateStyles)

  return (
    <MyView style={styles.typingRow}>
      <MyView style={styles.typingDot} />
      <MyView style={styles.typingDot} />
      <MyView style={styles.typingDot} />
    </MyView>
  )
}

export default memo(MyChatTyping)
