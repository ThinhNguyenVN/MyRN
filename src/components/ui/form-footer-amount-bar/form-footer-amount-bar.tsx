import { memo } from 'react'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { FormFooterAmountBarProps } from './type'

function FormFooterAmountBarComponent({
  totalLabel,
  totalText,
  layout,
  leading,
}: FormFooterAmountBarProps) {
  const styles = useThemedStyles(generateStyles)
  const layoutStyle = layout === 'compact' ? styles.compact : styles.stacked

  return (
    <MyView style={[styles.bar, layoutStyle]} fillParent={false}>
      <ConditionRenderer when={Boolean(leading)} fallback={null}>
        {leading}
      </ConditionRenderer>
      <MyView style={styles.total} fillParent={false}>
        <MyText typography="caption" style={styles.totalLabel}>
          {totalLabel}
        </MyText>
        <MyText typography="h4" style={styles.totalValue}>
          {totalText}
        </MyText>
      </MyView>
    </MyView>
  )
}

export const FormFooterAmountBar = memo(FormFooterAmountBarComponent)
