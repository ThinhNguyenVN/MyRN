import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import axios, { AxiosHeaders, type AxiosRequestConfig } from 'axios'

import { apiClient } from '@/api/axios-instance'
import { toSerializedApiError, type ApiErrorCodeType } from '@/api/errors'
import { API_AXIOS_CONFIG, API_TIMEOUT, API_UPLOAD_TIMEOUT } from '@/constants/api'

export type AxiosBaseQueryArgs = {
  url: string
  method?: AxiosRequestConfig['method']
  data?: AxiosRequestConfig['data']
  params?: AxiosRequestConfig['params']
  headers?: AxiosRequestConfig['headers']
  /** Optional override host (e.g. AUTH_BASE_URL for Step 3 auth RTK endpoints). */
  baseUrl?: string
  /** Override request timeout (ms). */
  timeout?: number
}

export type ApiFailureType = {
  status?: number | string
  errorCode: ApiErrorCodeType
  message: string
}

/** RN/Hermes may not always pass `instanceof FormData` across bundles. */
export function isFormDataBody(data: unknown): data is FormData {
  if (data === null || typeof data !== 'object') {
    return false
  }
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return true
  }
  return (
    typeof (data as FormData).append === 'function' &&
    (Object.prototype.toString.call(data) === '[object FormData]' ||
      (data as { constructor?: { name?: string } }).constructor?.name === 'FormData')
  )
}

/**
 * Axios instance defaults `Content-Type: application/json`.
 * Multipart MUST omit it so the runtime can set boundary.
 * Axios 1 `AxiosHeaders`: use `set(..., false)` / `delete` — plain `delete obj[key]` is unreliable.
 */
function headersForRequest(
  data: unknown,
  headers: AxiosRequestConfig['headers'] | undefined,
  includeJsonDefaults: boolean,
): AxiosRequestConfig['headers'] {
  const merged = includeJsonDefaults
    ? { ...(API_AXIOS_CONFIG.headers as Record<string, string>), ...headers }
    : { ...headers }

  const next = AxiosHeaders.from(merged)

  if (!isFormDataBody(data)) {
    return next
  }

  next.delete('Content-Type')
  next.delete('content-type')
  // `false` tells Axios 1 to skip this header entirely (do not re-apply defaults).
  next.set('Content-Type', false)
  return next
}

export const axiosBaseQuery: BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiFailureType> = async ({
  url,
  method = 'GET',
  data,
  params,
  headers,
  baseUrl,
  timeout,
}) => {
  const formData = isFormDataBody(data)
  const resolvedTimeout = timeout ?? (formData ? API_UPLOAD_TIMEOUT : API_TIMEOUT)
  const resolvedHeaders = headersForRequest(data, headers, Boolean(baseUrl))

  try {
    const result = baseUrl
      ? await axios({
          url,
          method,
          data,
          params,
          headers: resolvedHeaders,
          baseURL: baseUrl,
          timeout: resolvedTimeout,
        })
      : await apiClient({
          url,
          method,
          data,
          params,
          headers: resolvedHeaders,
          timeout: resolvedTimeout,
          ...(formData
            ? {
                transformRequest: [
                  (body: unknown, hdrs: Record<string, unknown>) => {
                    if (hdrs && typeof (hdrs as AxiosHeaders).delete === 'function') {
                      const ax = hdrs as AxiosHeaders
                      ax.delete('Content-Type')
                      ax.delete('content-type')
                      ax.set('Content-Type', false)
                    } else if (hdrs) {
                      delete hdrs['Content-Type']
                      delete hdrs['content-type']
                    }
                    return body
                  },
                ],
              }
            : {}),
        })
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
