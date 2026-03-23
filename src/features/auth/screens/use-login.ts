import { router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { ApiFailureType } from '@/api/axios-base-query'
import { useLoginMutation } from '@/features/auth/authApi'

import type { LoginForm } from './login-screen.types'

export function useLogin(scrollToField: (name: string) => void) {
  const [login, { isLoading }] = useLoginMutation()
  const { handleSubmit, control } = useFormContext<LoginForm>()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const username = useWatch({ control, name: 'username' })
  const password = useWatch({ control, name: 'password' })

  useEffect(() => {
    setSubmitError(null)
  }, [username, password])

  const onSubmit = useCallback(
    async (values: LoginForm) => {
      setSubmitError(null)
      try {
        await login({
          username: values.username.trim(),
          password: values.password,
        }).unwrap()
        router.replace('/(tabs)')
      } catch (err) {
        const error = err as ApiFailureType
        setSubmitError(error.message)
      }
    },
    [login],
  )

  const onInvalid = useCallback(
    (formErrors: Partial<Record<keyof LoginForm, { message?: string }>>) => {
      const first = Object.keys(formErrors)[0] as keyof LoginForm | undefined
      if (first) scrollToField(first)
    },
    [scrollToField],
  )

  const onSignInPress = useCallback(() => {
    void handleSubmit(onSubmit, onInvalid)()
  }, [handleSubmit, onSubmit, onInvalid])

  return {
    submitError,
    isLoading,
    onSignInPress,
  }
}
