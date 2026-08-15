import React, { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import MyDatePicker from '@/components/elements/my-date-picker'
import type { MyDatePickerProps } from '@/components/elements/my-date-picker/type'

import MyFormField from '../my-form-field'
import { useFormField } from '../use-form-field'

export type MyFormDatePickerProps<TFieldValues extends FieldValues> = Omit<
  MyDatePickerProps,
  'value' | 'onValueChange' | 'error' | 'errorMessage' | 'title' | 'required' | 'hideTitle'
> & {
  name: FieldPath<TFieldValues>
  title?: string
  subTitle?: string
  required?: boolean
}

function MyFormDatePickerInner<TFieldValues extends FieldValues>({
  name,
  title,
  subTitle,
  required,
  ...rest
}: MyFormDatePickerProps<TFieldValues>) {
  const { value, onChange, error, clearError } = useFormField<
    TFieldValues,
    FieldPath<TFieldValues>
  >(name)
  return (
    <MyFormField<TFieldValues> name={name} title={title} subTitle={subTitle} required={required}>
      <MyDatePicker
        {...rest}
        title={title}
        hideTitle
        value={(value as Date | null) ?? null}
        onValueChange={(date) => {
          if (error) clearError?.()
          onChange(date)
        }}
      />
    </MyFormField>
  )
}

const MyFormDatePicker = memo(MyFormDatePickerInner) as <TFieldValues extends FieldValues>(
  props: MyFormDatePickerProps<TFieldValues>,
) => React.ReactElement

export default MyFormDatePicker
