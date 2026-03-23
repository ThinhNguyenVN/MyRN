import { type AxiosError, isAxiosError } from 'axios'

/** App-level API error codes (normalized from HTTP / Axios). */
export const ApiErrorCode = {
  NETWORK: 'NETWORK',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION',
  BAD_CREDENTIALS: 'BAD_CREDENTIALS',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN',
} as const

export type ApiErrorCodeType = (typeof ApiErrorCode)[keyof typeof ApiErrorCode]

export type NormalizedApiError = {
  code: ApiErrorCodeType
  message: string
  status?: number
}

const API_ERROR_CODES_SET = new Set<string>(Object.values(ApiErrorCode))

/** True when `error` is already a plain object from a prior `normalizeAxiosError` (e.g. axios interceptor reject). */
export function isNormalizedApiError(error: unknown): error is NormalizedApiError {
  if (!error || typeof error !== 'object') return false
  const e = error as Record<string, unknown>
  if (typeof e.code !== 'string' || !API_ERROR_CODES_SET.has(e.code)) return false
  if (typeof e.message !== 'string') return false
  if (e.status !== undefined && typeof e.status !== 'number') return false
  return true
}

function getMessageFromData(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'message' in data) {
    const m = (data as { message: unknown }).message
    if (typeof m === 'string') return m
  }
  return undefined
}

function mapStatusToCode(
  status: number | undefined,
  data: unknown,
  url?: string,
): ApiErrorCodeType {
  if (status === undefined) return ApiErrorCode.UNKNOWN
  const msg = getMessageFromData(data)?.toLowerCase() ?? ''
  if (status === 400) {
    if (
      msg.includes('password') ||
      msg.includes('username') ||
      msg.includes('credentials') ||
      url?.includes('/auth/login')
    ) {
      return ApiErrorCode.BAD_CREDENTIALS
    }
    return ApiErrorCode.VALIDATION
  }
  if (status === 401) return ApiErrorCode.UNAUTHORIZED
  if (status === 403) return ApiErrorCode.FORBIDDEN
  if (status === 404) return ApiErrorCode.NOT_FOUND
  if (status === 408) return ApiErrorCode.TIMEOUT
  if (status >= 500) return ApiErrorCode.SERVER
  return ApiErrorCode.UNKNOWN
}

export function normalizeAxiosError(error: unknown): NormalizedApiError {
  /** Interceptor có thể `reject(normalizeAxiosError(ax))` → base query gọi normalize lần 2 → cần pass-through. */
  if (isNormalizedApiError(error)) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
    }
  }

  if (isAxiosError(error)) {
    const ax = error as AxiosError<unknown>
    const status = ax.response?.status
    const data = ax.response?.data
    const url = ax.config?.url

    if (ax.code === 'ECONNABORTED' || ax.message?.toLowerCase().includes('timeout')) {
      return {
        code: ApiErrorCode.TIMEOUT,
        message: ax.message || 'Request timed out',
        status,
      }
    }

    if (!ax.response) {
      return {
        code: ApiErrorCode.NETWORK,
        message: ax.message || 'Network error',
      }
    }

    const code = mapStatusToCode(status, data, url)
    const message =
      getMessageFromData(data) ||
      ax.message ||
      (status ? `Request failed with status ${status}` : 'Request failed')
    return {
      code,
      message,
      status,
    }
  }

  if (error instanceof Error) {
    return {
      code: ApiErrorCode.UNKNOWN,
      message: error.message,
    }
  }
  return {
    code: ApiErrorCode.UNKNOWN,
    message: 'An unexpected error occurred',
  }
}

/** Shape suitable for RTK Query `error` in rejected queries (serializable). */
export type SerializedApiError = {
  status?: number | string
  data: NormalizedApiError
}

export function toSerializedApiError(error: unknown): SerializedApiError {
  const normalized = normalizeAxiosError(error)
  return {
    status: normalized.status ?? 'CUSTOM_ERROR',
    data: normalized,
  }
}
