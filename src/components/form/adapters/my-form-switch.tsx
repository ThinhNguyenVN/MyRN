import React, { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import MySwitch from '@/components/elements/my-switch'
import type { MySwitchProps } from '@/components/elements/my-switch/type'

import { useFormField } from '../use-form-field'

export type MyFormSwitchProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<MySwitchProps, 'value' | 'onValueChange'> & {
  name: TName
}

function MyFormSwitchInner<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ name, ...rest }: MyFormSwitchProps<TFieldValues, TName>) {
  const { value, onChange } = useFormField<TFieldValues, TName>(name)
  const bool = value === true
  return <MySwitch {...rest} value={bool} onValueChange={(v) => onChange(v)} />
}

const MyFormSwitch = memo(MyFormSwitchInner) as <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  props: MyFormSwitchProps<TFieldValues, TName>,
) => React.ReactElement

export default MyFormSwitch
