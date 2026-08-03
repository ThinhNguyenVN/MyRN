import React, { memo } from 'react'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { shouldShowEmptyStateAction, shouldShowEmptyStateSubtitle } from './empty-state-utils'
import { generateStyles } from './styles'
import type { MyEmptyStateProps } from './type'

const MyEmptyState: React.FC<MyEmptyStateProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  style,
  ...rest
}) => {
  const styles = useThemedStyles(generateStyles)
  const showSubtitle = shouldShowEmptyStateSubtitle(subtitle)
  const showAction = shouldShowEmptyStateAction(actionLabel, onActionPress)

  return (
    <MyView {...rest} style={[styles.container, style]}>
      <MyText typography="subtitle" style={styles.title}>
        {title}
      </MyText>
      <ConditionRenderer when={showSubtitle}>
        <MyText typography="body" color="text/active/secondary" style={styles.subtitle}>
          {subtitle}
        </MyText>
      </ConditionRenderer>
      <ConditionRenderer when={showAction}>
        <MyButton
          type="secondary"
          text={actionLabel ?? ''}
          width="auto"
          onPress={onActionPress}
          style={styles.action}
        />
      </ConditionRenderer>
    </MyView>
  )
}

MyEmptyState.displayName = 'MyEmptyState'

export default memo(MyEmptyState)
