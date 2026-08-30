import React, { memo } from 'react'
import { View } from 'react-native'
import type { FieldPath, FieldValues } from 'react-hook-form'

import FormFieldError from './form-field-error'
import FormFieldLabel from './form-field-label'
import { useFormScrollContext } from './form-scroll-context'
import type { MyFormFieldProps } from './types'
import { useFormField } from './use-form-field'
import { useThemedStyles } from '@/theme/theme-context'
import { generateStyles } from './styles'

function MyFormFieldInner<TFieldValues extends FieldValues>({
  name,
  title,
  subTitle,
  required,
  externalInvalid = false,
  hideErrorMessage = false,
  children,
}: MyFormFieldProps<TFieldValues>) {
  const styles = useThemedStyles(generateStyles)
  const { error } = useFormField<TFieldValues, FieldPath<TFieldValues>>(name)
  const { registerFieldRef, unregisterFieldRef } = useFormScrollContext()
  const showErrorVisual = !!error || externalInvalid

  return (
    <View
      ref={(r) => {
        registerFieldRef(name as string, r)
        if (r === null) unregisterFieldRef(name as string)
      }}
      style={styles.field}
      collapsable={false}
    >
      <FormFieldLabel
        title={title}
        subTitle={subTitle}
        required={required}
        error={showErrorVisual}
      />
      {children}
      {hideErrorMessage ? null : <FormFieldError error={error ?? null} />}
    </View>
  )
}

const MyFormField = memo(MyFormFieldInner) as <TFieldValues extends FieldValues>(
  props: MyFormFieldProps<TFieldValues>,
) => React.ReactElement

export default MyFormField
