import React, { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import { MyChips } from '@/components/elements/my-chip'
import type { MyChipsProps } from '@/components/elements/my-chip/type'

import MyFormField from '../my-form-field'
import { useFormField } from '../use-form-field'

export type MyFormChipsProps<TFieldValues extends FieldValues> = Omit<
  MyChipsProps,
  'selected' | 'onChanged'
> & {
  name: FieldPath<TFieldValues>
  title?: string
  subTitle?: string
  required?: boolean
}

function MyFormChipsInner<TFieldValues extends FieldValues>({
  name,
  title,
  subTitle,
  required,
  ...rest
}: MyFormChipsProps<TFieldValues>) {
  const { value, onChange, error, clearError } = useFormField<
    TFieldValues,
    FieldPath<TFieldValues>
  >(name)
  const selected = Array.isArray(value) ? (value as string[]) : []
  return (
    <MyFormField<TFieldValues>
      name={name}
      title={title}
      subTitle={subTitle}
      required={required}
    >
      <MyChips
        {...rest}
        selected={selected}
        onChanged={(v) => {
          if (error) clearError?.()
          onChange(v)
        }}
      />
    </MyFormField>
  )
}

const MyFormChips = memo(MyFormChipsInner) as <TFieldValues extends FieldValues>(
  props: MyFormChipsProps<TFieldValues>,
) => React.ReactElement

export default MyFormChips
