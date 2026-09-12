import { memo } from 'react'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { FormFooterAmountBarProps } from './type'

function FormFooterAmountBarInner({
  totalLabel,
  totalText,
  layout,
  right,
}: FormFooterAmountBarProps) {
  const styles = useThemedStyles(generateStyles)
  const layoutStyle = layout === 'compact' ? styles.compact : styles.stacked

  return (
    <MyView style={[styles.bar, layoutStyle]}>
      <MyView style={styles.total}>
        <MyText typography="caption" style={styles.totalLabel}>
          {totalLabel}
        </MyText>
        <MyText typography="h4" style={styles.totalValue}>
          {totalText}
        </MyText>
      </MyView>
      <ConditionRenderer when={Boolean(right)} fallback={null}>
        <MyView style={styles.right}>{right}</MyView>
      </ConditionRenderer>
    </MyView>
  )
}

export const FormFooterAmountBar = memo(FormFooterAmountBarInner)
