import React, { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import { MyChips } from '@/components/elements/my-chip'
import type { MyChipsProps } from '@/components/elements/my-chip/type'

import { useFormField } from '../use-form-field'

export type MyFormChipsProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<MyChipsProps, 'selected' | 'onChanged'> & {
  name: TName
}

function MyFormChipsInner<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  name,
  ...rest
}: MyFormChipsProps<TFieldValues, TName>) {
  const { value, onChange } = useFormField<TFieldValues, TName>(name)
  const selected = Array.isArray(value) ? (value as string[]) : []
  return <MyChips {...rest} selected={selected} onChanged={(v) => onChange(v)} />
}

const MyFormChips = memo(MyFormChipsInner) as <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  props: MyFormChipsProps<TFieldValues, TName>,
) => React.ReactElement

export default MyFormChips
