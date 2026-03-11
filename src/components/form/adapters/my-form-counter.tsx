import React, { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import MyCounter from '@/components/elements/my-counter'
import type { MyCounterProps } from '@/components/elements/my-counter/type'

import { useFormField } from '../use-form-field'

export type MyFormCounterProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<MyCounterProps, 'value' | 'onValueChange'> & {
  name: TName
}

function MyFormCounterInner<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ name, ...rest }: MyFormCounterProps<TFieldValues, TName>) {
  const { value, onChange } = useFormField<TFieldValues, TName>(name)
  const num = typeof value === 'number' ? value : 0
  return <MyCounter {...rest} value={num} onValueChange={(v) => onChange(v)} />
}

const MyFormCounter = memo(MyFormCounterInner) as <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  props: MyFormCounterProps<TFieldValues, TName>,
) => React.ReactElement

export default MyFormCounter
