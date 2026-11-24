import { memo, useMemo } from 'react'
import { StyleSheet } from 'react-native'

import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import type { ThemeType } from '@/theme/theme-context'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { featuredPaletteOf, type FeaturedPalette } from './constants'

export type PlanComparisonColumn = {
  key: string
  title: string
  /** The featured plan: header in the featured gradient colour, column tinted, values bold. */
  highlighted?: boolean
}

export type PlanComparisonRow = {
  key: string
  label: string
  /** One per column: text, or `true` / `false` for a check / a dash. */
  values: (string | boolean)[]
}

export type PlanComparisonTableProps = {
  /** First header cell, e.g. `Tính năng`. */
  featureLabel: string
  columns: PlanComparisonColumn[]
  rows: PlanComparisonRow[]
  palette?: Partial<FeaturedPalette>
  testID?: string
}

/** Plans side by side, one row per limit or feature; the highlighted column stands out. */
function PlanComparisonTableInner({
  featureLabel,
  columns,
  rows,
  palette,
  testID,
}: PlanComparisonTableProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()
  const colors = useMemo(() => featuredPaletteOf(palette), [palette])
  // The middle stop reads as "the" colour of the gradient.
  const headerFill = colors.gradient[1]

  return (
    <MyView style={styles.table} testID={testID}>
      <MyView style={styles.row}>
        <MyText typography="label" color="text/active/secondary" style={styles.labelCell}>
          {featureLabel}
        </MyText>
        {columns.map((column) => (
          <MyView
            key={`compare-head-${column.key}`}
            style={[styles.cell, column.highlighted ? { backgroundColor: headerFill } : null]}
          >
            <MyView style={styles.headCell}>
              {column.highlighted ? (
                <MyIcon name="diamond" size={14} color={colors.accent} />
              ) : null}
              <MyText
                typography="subtitle"
                style={[styles.bold, column.highlighted ? { color: colors.ink } : null]}
              >
                {column.title}
              </MyText>
            </MyView>
          </MyView>
        ))}
      </MyView>
      {rows.map((row) => (
        <MyView key={`compare-row-${row.key}`} style={[styles.row, styles.bodyRow]}>
          <MyText typography="body" color="text/active/secondary" style={styles.labelCell}>
            {row.label}
          </MyText>
          {columns.map((column, index) => {
            const value = row.values[index]
            return (
              <MyView
                key={`compare-cell-${row.key}-${column.key}`}
                style={[styles.cell, column.highlighted ? styles.highlightedCell : null]}
              >
                {typeof value === 'boolean' ? (
                  <MyIcon
                    name={value ? 'checkmark-circle' : 'remove'}
                    size={18}
                    color={getColor(value ? 'brand/primary' : 'icon/inactive/primary')}
                  />
                ) : (
                  <MyText
                    typography={column.highlighted ? 'h6' : 'subtitle'}
                    color="text/active/primary"
                    style={column.highlighted ? styles.highlightedValue : undefined}
                  >
                    {value ?? ''}
                  </MyText>
                )}
              </MyView>
            )
          })}
        </MyView>
      ))}
    </MyView>
  )
}

function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, isMobileSize } = theme
  return StyleSheet.create({
    table: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: getColor('border/inactive/quaternary'),
      backgroundColor: getColor('fill/background/tertiary'),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'stretch',
    },
    bodyRow: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: getColor('border/inactive/quaternary'),
    },
    labelCell: {
      flex: isMobileSize ? 1.3 : 2,
      paddingVertical: getSpacing('x3'),
      paddingHorizontal: getSpacing(isMobileSize ? 'x3' : 'x5'),
      alignSelf: 'center',
    },
    cell: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: getSpacing('x3'),
      paddingHorizontal: getSpacing('x2'),
    },
    highlightedCell: {
      backgroundColor: getColor('border/info/tertiary'),
    },
    headCell: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    bold: {
      fontWeight: '700',
    },
    highlightedValue: {
      color: getColor('brand/primary'),
      fontWeight: '800',
    },
  })
}

export const PlanComparisonTable = memo(PlanComparisonTableInner)
