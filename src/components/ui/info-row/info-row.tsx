import { memo } from 'react'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { InfoRowProps } from './type'

/** One "label: value" line of a detail section; a row without a value is not rendered. */
function InfoRow({ label, value, children }: InfoRowProps) {
  const styles = useThemedStyles(generateStyles)
  if (!children && !(value && value.length > 0)) return null
  return (
    <MyView style={styles.infoRow}>
      <MyText typography="caption" color="text/active/secondary" style={styles.infoLabel}>
        {label}
      </MyText>
      <MyView style={styles.infoValue}>
        {children ?? <MyText typography="body">{value}</MyText>}
      </MyView>
    </MyView>
  )
}

export default memo(InfoRow)
