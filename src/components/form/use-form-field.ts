import { useController, useFormContext } from 'react-hook-form'

import type { FieldPath, FieldValues } from './types'


export interface UseFormFieldReturn<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> {
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  ref: (instance: unknown) => void
  error: { message?: string } | undefined
  name: TName
}

export function useFormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
  name: TName,
): UseFormFieldReturn<TFieldValues, TName> {
  const { control } = useFormContext<TFieldValues>()
  const { field, fieldState } = useController<TFieldValues, TName>({ name, control })
  return {
    value: field.value,
    onChange: field.onChange,
    onBlur: field.onBlur,
    ref: field.ref,
    error: fieldState.error,
    name,
  }
}
