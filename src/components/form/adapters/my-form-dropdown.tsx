import React, { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import MyDropdownInput from '@/components/elements/my-dropdown-input'
import type { MyDropdownInputProps } from '@/components/elements/my-dropdown-input/type'

import MyFormField from '../my-form-field'
import { useFormField } from '../use-form-field'

export type MyFormDropdownProps<TFieldValues extends FieldValues> = Omit<
  MyDropdownInputProps,
  'value' | 'onValueChange' | 'error' | 'errorMessage' | 'title' | 'subTitle' | 'required'
> & {
  name: FieldPath<TFieldValues>
  title?: string
  pickerTitle?: string
  subTitle?: string
  required?: boolean
}

function MyFormDropdownInner<TFieldValues extends FieldValues>({
  name,
  title,
  pickerTitle,
  subTitle,
  required,
  ...rest
}: MyFormDropdownProps<TFieldValues>) {
  const { value, onChange, error, clearError } = useFormField<
    TFieldValues,
    FieldPath<TFieldValues>
  >(name)
  return (
    <MyFormField<TFieldValues> name={name} title={title} subTitle={subTitle} required={required}>
      <MyDropdownInput
        {...rest}
        pickerTitle={pickerTitle ?? title}
        required={required}
        value={(value as string | string[] | null) ?? null}
        onValueChange={(v) => {
          if (error) clearError?.()
          onChange(v)
        }}
      />
    </MyFormField>
  )
}

const MyFormDropdown = memo(MyFormDropdownInner) as <TFieldValues extends FieldValues>(
  props: MyFormDropdownProps<TFieldValues>,
) => React.ReactElement

export default MyFormDropdown
