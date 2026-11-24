import { memo } from 'react'
import { StyleSheet } from 'react-native'

import MyIcon from '@/components/elements/my-icon'
import type { MyIconProps } from '@/components/elements/my-icon/type'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import type { ThemeType } from '@/theme/theme-context'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

export type FeatureHighlight = {
  key: string
  icon: MyIconProps['name']
  title: string
  body: string
}

export type FeatureHighlightsProps = {
  items: FeatureHighlight[]
}

/**
 * A few short promises (e.g. near a price list): icon, title and one sentence each. In a row on
 * desktop, stacked on mobile. Keep them true: no invented numbers.
 */
function FeatureHighlightsInner({ items }: FeatureHighlightsProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()
  return (
    <MyView style={styles.row}>
      {items.map((item) => (
        <MyView key={`feature-highlight-${item.key}`} style={styles.item}>
          <MyView style={styles.icon}>
            <MyIcon name={item.icon} size={20} color={getColor('brand/primary')} />
          </MyView>
          <MyView style={styles.text}>
            <MyText typography="subtitle">{item.title}</MyText>
            <MyText typography="caption" color="text/active/secondary">
              {item.body}
            </MyText>
          </MyView>
        </MyView>
      ))}
    </MyView>
  )
}

function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, isMobileSize } = theme
  return StyleSheet.create({
    row: {
      flexDirection: isMobileSize ? 'column' : 'row',
      gap: getSpacing('x4'),
    },
    item: {
      flex: isMobileSize ? undefined : 1,
      flexDirection: 'row',
      gap: getSpacing('x3'),
      alignItems: 'flex-start',
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: getColor('border/info/tertiary'),
    },
    text: {
      flex: 1,
      gap: 2,
    },
  })
}

export const FeatureHighlights = memo(FeatureHighlightsInner)
