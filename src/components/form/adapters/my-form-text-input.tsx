import React, { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import MyTextInput from '@/components/elements/my-text-input'
import type { MyTextInputProps } from '@/components/elements/my-text-input/type'

import { useFormField } from '../use-form-field'

export type MyFormTextInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<MyTextInputProps, 'value' | 'onChangeText' | 'error' | 'errorMessage'> & {
  name: TName
}

function MyFormTextInputInner<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ name, ...rest }: MyFormTextInputProps<TFieldValues, TName>) {
  const { value, onChange, onBlur, error } = useFormField<TFieldValues, TName>(name)
  return (
    <MyTextInput
      {...rest}
      value={value as string}
      onChangeText={(text) => onChange(text)}
      onBlur={onBlur}
      error={!!error}
      errorMessage={error?.message}
    />
  )
}

const MyFormTextInput = memo(MyFormTextInputInner) as <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  props: MyFormTextInputProps<TFieldValues, TName>,
) => React.ReactElement

export default MyFormTextInput
