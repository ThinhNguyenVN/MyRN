import React, { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import MySwitch from '@/components/elements/my-switch'
import type { MySwitchProps } from '@/components/elements/my-switch/type'

import MyFormField from '../my-form-field'
import { useFormField } from '../use-form-field'

export type MyFormSwitchProps<TFieldValues extends FieldValues> = Omit<
  MySwitchProps,
  'value' | 'onValueChange'
> & {
  name: FieldPath<TFieldValues>
  title?: string
  subTitle?: string
  required?: boolean
}

function MyFormSwitchInner<TFieldValues extends FieldValues>({
  name,
  title,
  subTitle,
  required,
  ...rest
}: MyFormSwitchProps<TFieldValues>) {
  const { value, onChange, error, clearError } = useFormField<
    TFieldValues,
    FieldPath<TFieldValues>
  >(name)
  const bool = value === true
  return (
    <MyFormField<TFieldValues> name={name} title={title} subTitle={subTitle} required={required}>
      <MySwitch
        {...rest}
        value={bool}
        onValueChange={(v) => {
          if (error) clearError?.()
          onChange(v)
        }}
      />
    </MyFormField>
  )
}

const MyFormSwitch = memo(MyFormSwitchInner) as <TFieldValues extends FieldValues>(
  props: MyFormSwitchProps<TFieldValues>,
) => React.ReactElement

export default MyFormSwitch
