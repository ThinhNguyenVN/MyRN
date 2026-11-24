import { memo } from 'react'
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import type { ThemeType } from '@/theme/theme-context'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { USAGE_WARNING_RATIO } from './constants'

export type UsageMeterProps = {
  /** e.g. `Tin nhắn AI tháng này`. */
  label: string
  used: number
  /** `null` = no limit: the value shows alone, without a bar. */
  limit: number | null
  /** Text on the right, e.g. `120 / 300` (the caller formats numbers and units). */
  valueText: string
  /** Under the bar once the limit is reached, e.g. `Lượt mới từ 01/12.` */
  exhaustedText?: string
  /** Share of the limit from which the bar turns to the warning colour. */
  warningRatio?: number
  style?: StyleProp<ViewStyle>
  testID?: string
}

/** "label · used / limit" with a bar: brand colour, warning near the limit, alert at it. */
function UsageMeterInner({
  label,
  used,
  limit,
  valueText,
  exhaustedText,
  warningRatio = USAGE_WARNING_RATIO,
  style,
  testID,
}: UsageMeterProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()
  const ratio = limit === null ? null : limit <= 0 ? 1 : Math.min(1, used / limit)
  const exhausted = limit !== null && used >= limit
  const fill = exhausted
    ? getColor('fill/alert/primary')
    : ratio !== null && ratio >= warningRatio
      ? getColor('fill/warning/primary')
      : getColor('fill/active/primary')

  return (
    <MyView style={[styles.root, style]} testID={testID}>
      <MyView style={styles.head}>
        <MyText typography="caption" color="text/active/secondary">
          {label}
        </MyText>
        <MyText typography="subtitle">{valueText}</MyText>
      </MyView>
      {ratio !== null ? (
        <MyView
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: limit ?? 0, now: Math.min(used, limit ?? used) }}
        >
          <MyView
            style={[styles.bar, { width: `${Math.round(ratio * 100)}%`, backgroundColor: fill }]}
          />
        </MyView>
      ) : null}
      {exhausted && exhaustedText ? (
        <MyText typography="caption" color="text/alert/primary">
          {exhaustedText}
        </MyText>
      ) : null}
    </MyView>
  )
}

function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    root: {
      gap: getSpacing('x2'),
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: getSpacing('x2'),
    },
    track: {
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
      backgroundColor: getColor('fill/inactive/secondary'),
    },
    bar: {
      height: '100%',
      borderRadius: 3,
    },
  })
}

export const UsageMeter = memo(UsageMeterInner)
