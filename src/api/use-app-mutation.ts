import type { SerializedError } from '@reduxjs/toolkit'
import { useCallback } from 'react'

import { ApiErrorCode } from '@/api/errors'
import type { ApiErrorCodeType } from '@/api/errors'
import type { ApiFailureType } from '@/api/axios-base-query'

type TriggerResult<TData, TError> = { data: TData } | { error: TError }
type MutationTrigger<TArg, TData, TError> = (arg: TArg) => Promise<TriggerResult<TData, TError>>

function isApiFailure(error: unknown): error is ApiFailureType {
  return (
    !!error &&
    typeof error === 'object' &&
    'isSuccess' in error &&
    'errorCode' in error &&
    'message' in error &&
    (error as ApiFailureType).isSuccess === false
  )
}

function toApiFailure(error: unknown): ApiFailureType {
  if (isApiFailure(error)) {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as SerializedError).message ?? 'Request failed'
    return {
      isSuccess: false,
      errorCode: ApiErrorCode.UNKNOWN as ApiErrorCodeType,
      message,
    }
  }

  return {
    isSuccess: false,
    errorCode: ApiErrorCode.UNKNOWN as ApiErrorCodeType,
    message: 'Request failed',
  }
}

export type AppMutationResult<TData> = { isSuccess: true; data: TData } | ApiFailureType

export function useAppMutation<TArg, TData, TError, TState>(
  useMutationHook: () => readonly [MutationTrigger<TArg, TData, TError>, TState],
) {
  const [trigger, state] = useMutationHook()

  const run = useCallback(
    async (arg: TArg): Promise<AppMutationResult<TData>> => {
      const result = await trigger(arg)
      if ('error' in result) {
        return toApiFailure(result.error)
      }
      return {
        isSuccess: true,
        data: result.data,
      }
    },
    [trigger],
  )

  return [run, state] as const
}
