import React, { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import MyTextInput from '@/components/elements/my-text-input'
import type { MyTextInputProps } from '@/components/elements/my-text-input/type'

import MyFormField from '../my-form-field'
import { useFormField } from '../use-form-field'

export type MyFormTextInputProps<TFieldValues extends FieldValues> = Omit<
  MyTextInputProps,
  'value' | 'onChangeText' | 'error' | 'errorMessage' | 'title' | 'subTitle' | 'required'
> & {
  name: FieldPath<TFieldValues>
  title?: string
  subTitle?: string
  required?: boolean
}

function MyFormTextInputInner<TFieldValues extends FieldValues>({
  name,
  title,
  subTitle,
  required,
  ...rest
}: MyFormTextInputProps<TFieldValues>) {
  const { value, onChange, onBlur, error, clearError } = useFormField<
    TFieldValues,
    FieldPath<TFieldValues>
  >(name)
  return (
    <MyFormField<TFieldValues>
      name={name}
      title={title}
      subTitle={subTitle}
      required={required}
    >
      <MyTextInput
        {...rest}
        value={value as string}
        onChangeText={(text) => onChange(text)}
        onBlur={onBlur}
        onFocus={(e) => {
          if (error) clearError?.()
          rest.onFocus?.(e)
        }}
      />
    </MyFormField>
  )
}

const MyFormTextInput = memo(MyFormTextInputInner) as <TFieldValues extends FieldValues>(
  props: MyFormTextInputProps<TFieldValues>,
) => React.ReactElement

export default MyFormTextInput
