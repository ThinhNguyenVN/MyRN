import type { ReactNode } from 'react'
import type { DefaultValues, FieldPath, FieldValues, UseFormProps } from 'react-hook-form'
import type { StyleProp, ViewStyle } from 'react-native'

import type { z } from 'zod'
export type { FieldPath, FieldValues }

export interface MyFormProps<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: z.ZodType<T, z.ZodTypeDef, unknown>
  defaultValues?: DefaultValues<T>
  children: ReactNode
}

export interface FormFieldErrorProps {
  error?: { message?: string } | null
  style?: StyleProp<ViewStyle>
}

export interface FormFieldLabelProps {
  title?: string
  subTitle?: string
  required?: boolean
  error?: boolean
  style?: StyleProp<ViewStyle>
}

export interface MyFormFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>
  title?: string
  subTitle?: string
  required?: boolean
  children: ReactNode
}

export interface UseFormFieldReturn<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  ref: (instance: unknown) => void
  error: { message?: string } | undefined
  name: TName
  clearError?: () => void
}
