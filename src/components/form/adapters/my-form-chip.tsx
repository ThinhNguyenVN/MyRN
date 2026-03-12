import React, { memo, useCallback } from 'react'
import { View } from 'react-native'
import type { FieldPath, FieldValues } from 'react-hook-form'

import MyChip from '@/components/elements/my-chip'
import type { MyChipProps } from '@/components/elements/my-chip/type'

import FormFieldError from '../form-field-error'
import { useFormField } from '../use-form-field'

export type MyFormChipProps<TFieldValues extends FieldValues> = Omit<
  MyChipProps,
  'selected' | 'onPress'
> & {
  name: FieldPath<TFieldValues>
}

function MyFormChipInner<TFieldValues extends FieldValues>({
  name,
  ...rest
}: MyFormChipProps<TFieldValues>) {
  const { value, onChange, error } = useFormField<TFieldValues, FieldPath<TFieldValues>>(name)
  const selected = value === true
  const onPress = useCallback(() => onChange(!selected), [onChange, selected])
  return (
    <View>
      <MyChip {...rest} selected={selected} onPress={onPress} />
      <FormFieldError error={error} />
    </View>
  )
}

const MyFormChip = memo(MyFormChipInner) as <TFieldValues extends FieldValues>(
  props: MyFormChipProps<TFieldValues>,
) => React.ReactElement

export default MyFormChip
