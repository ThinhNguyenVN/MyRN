import React, { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import { MyWheelPicker } from '@/components/elements/my-wheel-picker'
import type {
  MyWheelPickerProps,
  WheelPickerItem,
} from '@/components/elements/my-wheel-picker/type'

import MyFormField from '../my-form-field'
import { useFormField } from '../use-form-field'

export type MyFormWheelPickerProps<TFieldValues extends FieldValues> = Omit<
  MyWheelPickerProps,
  'value' | 'onValueChange' | 'title'
> & {
  name: FieldPath<TFieldValues>
  items: WheelPickerItem[]
  title?: string
  subTitle?: string
  required?: boolean
}

function MyFormWheelPickerInner<TFieldValues extends FieldValues>({
  name,
  items,
  title,
  subTitle,
  required,
  ...rest
}: MyFormWheelPickerProps<TFieldValues>) {
  const { value, onChange, error, clearError } = useFormField<
    TFieldValues,
    FieldPath<TFieldValues>
  >(name)
  const numValue = value === null || value === undefined ? null : (value as number)
  return (
    <MyFormField<TFieldValues> name={name} title={title} subTitle={subTitle} required={required}>
      <MyWheelPicker
        {...rest}
        items={items}
        value={numValue}
        onValueChange={(v) => {
          if (error) clearError?.()
          onChange(v)
        }}
      />
    </MyFormField>
  )
}

const MyFormWheelPicker = memo(MyFormWheelPickerInner) as <TFieldValues extends FieldValues>(
  props: MyFormWheelPickerProps<TFieldValues>,
) => React.ReactElement

export default MyFormWheelPicker
