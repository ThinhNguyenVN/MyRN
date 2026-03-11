import React, { memo, useCallback } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'

import MyChip from '@/components/elements/my-chip'
import type { MyChipProps } from '@/components/elements/my-chip/type'

import { useFormField } from '../use-form-field'

export type MyFormChipProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<MyChipProps, 'selected' | 'onPress'> & {
  name: TName
}

function MyFormChipInner<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  name,
  ...rest
}: MyFormChipProps<TFieldValues, TName>) {
  const { value, onChange } = useFormField<TFieldValues, TName>(name)
  const selected = value === true
  const onPress = useCallback(() => onChange(!selected), [onChange, selected])
  return <MyChip {...rest} selected={selected} onPress={onPress} />
}

const MyFormChip = memo(MyFormChipInner) as <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  props: MyFormChipProps<TFieldValues, TName>,
) => React.ReactElement

export default MyFormChip
