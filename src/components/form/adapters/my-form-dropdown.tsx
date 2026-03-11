import React, { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import MyDropdownInput from '@/components/elements/my-dropdown-input'
import type { MyDropdownInputProps } from '@/components/elements/my-dropdown-input/type'

import { useFormField } from '../use-form-field'

export type MyFormDropdownProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<MyDropdownInputProps, 'value' | 'onValueChange' | 'error' | 'errorMessage'> & {
  name: TName
}

function MyFormDropdownInner<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ name, ...rest }: MyFormDropdownProps<TFieldValues, TName>) {
  const { value, onChange, error } = useFormField<TFieldValues, TName>(name)
  return (
    <MyDropdownInput
      {...rest}
      value={(value as string | string[] | null) ?? null}
      onValueChange={(v) => onChange(v)}
      error={!!error}
      errorMessage={error?.message}
    />
  )
}

const MyFormDropdown = memo(MyFormDropdownInner) as <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  props: MyFormDropdownProps<TFieldValues, TName>,
) => React.ReactElement

export default MyFormDropdown
