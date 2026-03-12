import { useController, useFormContext } from 'react-hook-form'

import type { FieldPath, FieldValues, UseFormFieldReturn } from './types'

export function useFormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(name: TName): UseFormFieldReturn<TFieldValues, TName> {
  const { control, clearErrors } = useFormContext<TFieldValues>()
  const { field, fieldState } = useController<TFieldValues, TName>({ name, control })
  return {
    value: field.value,
    onChange: field.onChange,
    onBlur: field.onBlur,
    ref: field.ref,
    error: fieldState.error,
    name,
    clearError: () => clearErrors?.(name),
  }
}
