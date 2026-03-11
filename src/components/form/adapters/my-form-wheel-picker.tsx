import React, { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import { MyWheelPicker } from '@/components/elements/my-wheel-picker'
import type {
  MyWheelPickerProps,
  WheelPickerItem,
} from '@/components/elements/my-wheel-picker/type'

import { useFormField } from '../use-form-field'

export type MyFormWheelPickerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<MyWheelPickerProps, 'value' | 'onValueChange'> & {
  name: TName
  items: WheelPickerItem[]
}

function MyFormWheelPickerInner<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ name, items, ...rest }: MyFormWheelPickerProps<TFieldValues, TName>) {
  const { value, onChange } = useFormField<TFieldValues, TName>(name)
  const numValue = value === null || value === undefined ? null : (value as number)
  return (
    <MyWheelPicker {...rest} items={items} value={numValue} onValueChange={(v) => onChange(v)} />
  )
}

const MyFormWheelPicker = memo(MyFormWheelPickerInner) as <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  props: MyFormWheelPickerProps<TFieldValues, TName>,
) => React.ReactElement

export default MyFormWheelPicker
