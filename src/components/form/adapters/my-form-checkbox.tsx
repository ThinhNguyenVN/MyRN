import React, { memo, useCallback } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import MyCheckbox from '@/components/elements/my-checkbox'
import type { MyCheckboxProps } from '@/components/elements/my-checkbox/type'

import MyFormField from '../my-form-field'
import { useFormField } from '../use-form-field'
import { resolveCheckboxChecked } from './form-checkbox-utils'

export type MyFormCheckboxProps<TFieldValues extends FieldValues> = Omit<
  MyCheckboxProps,
  'checked' | 'onValueChange'
> & {
  name: FieldPath<TFieldValues>
  title?: string
  subTitle?: string
  required?: boolean
}

function MyFormCheckboxInner<TFieldValues extends FieldValues>({
  name,
  title,
  subTitle,
  required,
  ...rest
}: MyFormCheckboxProps<TFieldValues>) {
  const { value, onChange, error, clearError } = useFormField<
    TFieldValues,
    FieldPath<TFieldValues>
  >(name)
  const checked = resolveCheckboxChecked(value)

  const handleValueChange = useCallback(
    (next: boolean) => {
      if (error) clearError?.()
      onChange(next)
    },
    [clearError, error, onChange],
  )

  return (
    <MyFormField<TFieldValues> name={name} title={title} subTitle={subTitle} required={required}>
      <MyCheckbox {...rest} checked={checked} onValueChange={handleValueChange} />
    </MyFormField>
  )
}

const MyFormCheckbox = memo(MyFormCheckboxInner) as <TFieldValues extends FieldValues>(
  props: MyFormCheckboxProps<TFieldValues>,
) => React.ReactElement

export default MyFormCheckbox
