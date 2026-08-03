import React, { memo } from 'react'
import { isNil } from 'lodash'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { MyErrorStateProps } from './type'

const MyErrorState: React.FC<MyErrorStateProps> = ({
  title,
  message,
  retryLabel = 'Retry',
  onRetry,
  style,
  ...rest
}) => {
  const styles = useThemedStyles(generateStyles)
  const showTitle = !isNil(title) && title !== ''

  return (
    <MyView {...rest} style={[styles.container, style]}>
      <ConditionRenderer when={showTitle}>
        <MyText typography="subtitle" style={styles.title}>
          {title}
        </MyText>
      </ConditionRenderer>
      <MyText typography="body" color="text/active/secondary" style={styles.message}>
        {message}
      </MyText>
      <MyButton
        type="secondary"
        text={retryLabel}
        width="auto"
        onPress={onRetry}
        style={styles.retry}
      />
    </MyView>
  )
}

MyErrorState.displayName = 'MyErrorState'

export default memo(MyErrorState)
