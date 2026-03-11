import React, { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import MyDatePicker from '@/components/elements/my-date-picker'
import type { MyDatePickerProps } from '@/components/elements/my-date-picker/type'

import { useFormField } from '../use-form-field'

export type MyFormDatePickerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<MyDatePickerProps, 'value' | 'onValueChange' | 'error' | 'errorMessage'> & {
  name: TName
}

function MyFormDatePickerInner<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ name, ...rest }: MyFormDatePickerProps<TFieldValues, TName>) {
  const { value, onChange, error } = useFormField<TFieldValues, TName>(name)
  return (
    <MyDatePicker
      {...rest}
      value={(value as Date | null) ?? null}
      onValueChange={(date) => onChange(date)}
      error={!!error}
      errorMessage={error?.message}
    />
  )
}

const MyFormDatePicker = memo(MyFormDatePickerInner) as <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  props: MyFormDatePickerProps<TFieldValues, TName>,
) => React.ReactElement

export default MyFormDatePicker
