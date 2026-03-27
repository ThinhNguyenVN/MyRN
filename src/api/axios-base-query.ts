import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import type { AxiosRequestConfig } from 'axios'

import { apiClient } from '@/api/axios-instance'
import { toSerializedApiError, type ApiErrorCodeType } from '@/api/errors'

export type AxiosBaseQueryArgs = {
  url: string
  method?: AxiosRequestConfig['method']
  data?: AxiosRequestConfig['data']
  params?: AxiosRequestConfig['params']
  headers?: AxiosRequestConfig['headers']
}

export type ApiFailureType = {
  status?: number | string
  errorCode: ApiErrorCodeType
  message: string
}

export const axiosBaseQuery: BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiFailureType> = async ({
  url,
  method = 'GET',
  data,
  params,
}) => {
  try {
    const result = await apiClient({ url, method, data, params })
    return {
      data: result.data,
    }
  } catch (err) {
    const serialized = toSerializedApiError(err)
    return {
      error: {
        status: serialized.status,
        errorCode: serialized.data.code,
        message: serialized.data.message,
      },
    }
  }
}
