import { ReactNode } from 'react'
import type { DefaultValues, FieldPath, FieldValues, UseFormProps } from 'react-hook-form'

import type { z } from 'zod'
export type { FieldPath, FieldValues }

export interface MyFormProps<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: z.ZodType<T, z.ZodTypeDef, unknown>
  defaultValues?: DefaultValues<T>
  children: ReactNode
}
