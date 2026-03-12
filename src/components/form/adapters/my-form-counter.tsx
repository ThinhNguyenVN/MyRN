import React, { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import MyCounter from '@/components/elements/my-counter'
import type { MyCounterProps } from '@/components/elements/my-counter/type'

import MyFormField from '../my-form-field'
import { useFormField } from '../use-form-field'

export type MyFormCounterProps<TFieldValues extends FieldValues> = Omit<
  MyCounterProps,
  'value' | 'onValueChange'
> & {
  name: FieldPath<TFieldValues>
  title?: string
  subTitle?: string
  required?: boolean
}

function MyFormCounterInner<TFieldValues extends FieldValues>({
  name,
  title,
  subTitle,
  required,
  ...rest
}: MyFormCounterProps<TFieldValues>) {
  const { value, onChange, error, clearError } = useFormField<
    TFieldValues,
    FieldPath<TFieldValues>
  >(name)
  const num = typeof value === 'number' ? value : 0
  return (
    <MyFormField<TFieldValues>
      name={name}
      title={title}
      subTitle={subTitle}
      required={required}
    >
      <MyCounter
        {...rest}
        value={num}
        onValueChange={(v) => {
          if (error) clearError?.()
          onChange(v)
        }}
      />
    </MyFormField>
  )
}

const MyFormCounter = memo(MyFormCounterInner) as <TFieldValues extends FieldValues>(
  props: MyFormCounterProps<TFieldValues>,
) => React.ReactElement

export default MyFormCounter
