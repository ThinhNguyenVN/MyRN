import React, { memo } from 'react'
import type { DefaultValues, Resolver } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { FieldValues, MyFormProps } from './types'

function MyFormInner<T extends FieldValues>({
  schema,
  defaultValues,
  children,
  ...rest
}: MyFormProps<T>) {
  const methods = useForm<T>({
    ...rest,
    defaultValues: defaultValues as DefaultValues<T>,
    resolver: zodResolver(schema) as Resolver<T>,
  })
  return <FormProvider {...methods}>{children}</FormProvider>
}

const MyForm = memo(MyFormInner) as <T extends FieldValues>(
  props: MyFormProps<T>,
) => React.ReactElement

export default MyForm
