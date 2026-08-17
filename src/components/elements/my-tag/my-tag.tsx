import { memo } from 'react'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { MyTagProps, TagTone } from './type'

const TONE_SURFACE: Record<
  TagTone,
  'toneSuccess' | 'toneNeutral' | 'toneAlert' | 'toneWarning' | 'toneInfo'
> = {
  success: 'toneSuccess',
  neutral: 'toneNeutral',
  alert: 'toneAlert',
  warning: 'toneWarning',
  info: 'toneInfo',
}

const TONE_TEXT: Record<
  TagTone,
  'textSuccess' | 'textNeutral' | 'textAlert' | 'textWarning' | 'textInfo'
> = {
  success: 'textSuccess',
  neutral: 'textNeutral',
  alert: 'textAlert',
  warning: 'textWarning',
  info: 'textInfo',
}

function MyTagComponent({ label, tone = 'neutral', size = 'default' }: MyTagProps) {
  const styles = useThemedStyles(generateStyles)

  return (
    <MyView
      style={[
        styles.base,
        size === 'compact' ? styles.sizeCompact : styles.sizeDefault,
        styles[TONE_SURFACE[tone]],
      ]}
    >
      <MyText typography="caption" style={styles[TONE_TEXT[tone]]} numberOfLines={1}>
        {label}
      </MyText>
    </MyView>
  )
}

export default memo(MyTagComponent)
