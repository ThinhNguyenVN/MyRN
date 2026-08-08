import { router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { isNormalizedApiError } from '@/api/errors'
import { isWeb } from '@/constants/dimensions'
import { Routes } from '@/constants/routes'
import { loginThunk } from '@/features/auth/auth-thunks'
import { useAppDispatch } from '@/store/hooks'

import type { LoginForm } from './types'

export function useLogin(scrollToField: (name: string) => void) {
  const { t } = useTranslation()
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
            // Native: always persist until logout. Web: honor remember-me checkbox.
            remember: isWeb ? values.remember : true,
          }),
        ).unwrap()
        router.replace(Routes.defaultRoute)
      } catch (err) {
        if (isNormalizedApiError(err)) {
          setSubmitError(err.message)
          return
        }
        setSubmitError(t('auth.signInFailed'))
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch, t],
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
