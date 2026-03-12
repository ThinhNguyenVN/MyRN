import React, { memo } from 'react'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import type { FormFieldLabelProps } from './types'
import { generateStyles } from './styles'

function FormFieldLabel({
  title,
  subTitle,
  required = false,
  error = false,
  style,
}: FormFieldLabelProps) {
  const styles = useThemedStyles(generateStyles)
  const hasTitle = !!title && title !== ''
  const hasSubTitle = !!subTitle && subTitle !== ''
  if (!hasTitle && !hasSubTitle) return null
  const titleColor = error ? 'text/alert/primary' : 'text/active/primary'
  const subTitleColor = error ? 'text/alert/primary' : 'text/active/tertiary'
  return (
    <MyView style={[styles.titleRow, style]}>
      {hasTitle && (
        <MyText typography="label" color={titleColor}>
          {title}
          {required ? ' *' : ''}
        </MyText>
      )}
      {hasSubTitle && (
        <MyText typography="caption" color={subTitleColor}>
          {subTitle}
        </MyText>
      )}
    </MyView>
  )
}

FormFieldLabel.displayName = 'FormFieldLabel'

export default memo(FormFieldLabel)
