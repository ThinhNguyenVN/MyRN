import { router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { isNormalizedApiError } from '@/api/errors'
import { loginThunk } from '@/features/auth/auth-thunks'
import { useAppDispatch } from '@/store/hooks'

import type { LoginForm } from './login-screen.types'

export function useLogin(scrollToField: (name: string) => void) {
  const dispatch = useAppDispatch()
  const { handleSubmit, control } = useFormContext<LoginForm>()
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const username = useWatch({ control, name: 'username' })
  const password = useWatch({ control, name: 'password' })

  useEffect(() => {
    setSubmitError(null)
  }, [username, password])

  const onSubmit = useCallback(
    async (values: LoginForm) => {
      setSubmitError(null)
      setIsLoading(true)
      try {
        await dispatch(
          loginThunk({
            username: values.username.trim(),
            password: values.password,
          }),
        ).unwrap()
        router.replace('/(tabs)')
      } catch (err) {
        if (isNormalizedApiError(err)) {
          setSubmitError(err.message)
          return
        }
        setSubmitError('Sign in failed')
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch],
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
