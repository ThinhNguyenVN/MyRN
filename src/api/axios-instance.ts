import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios'

import { refreshAuthToken } from '@/api/auth-client'
import { normalizeAxiosError } from '@/api/errors'
import { API_AXIOS_CONFIG, AUTH_SKIP_REFRESH_PATHS } from '@/constants/api'
import { logout, selectRefreshToken, updateTokens } from '@/features/auth/auth-slice'
import {
  getStoredRefreshToken,
  removeStoredRefreshToken,
  setStoredRefreshToken,
} from '@/features/auth/token-storage'
import { getStore, tryGetStore } from '@/store/store-ref'
import type { RootStateWithAuth } from '@/store/types'

function shouldSkipRefresh(url: string | undefined): boolean {
  if (!url) return false
  return AUTH_SKIP_REFRESH_PATHS.some((p) => url.includes(p))
}

function getRootState(): RootStateWithAuth {
  return getStore().getState() as RootStateWithAuth
}

function currentAccessToken(): string | null {
  try {
    return getRootState().auth.accessToken
  } catch {
    return null
  }
}

/** Access token the failed request was sent with (`Bearer <token>`), or `null`. */
function sentAccessToken(config: InternalAxiosRequestConfig): string | null {
  const value = AxiosHeaders.from(config.headers).get('Authorization')
  if (typeof value !== 'string' || !value.startsWith('Bearer ')) return null
  return value.slice('Bearer '.length)
}

async function clearSessionLocally(): Promise<void> {
  tryGetStore()?.dispatch(logout())
  await removeStoredRefreshToken()
}

let refreshInFlight: Promise<string> | null = null

function performRefresh(refreshToken: string): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const { accessToken, refreshToken: newRefresh } = await refreshAuthToken(refreshToken)
        // Some refresh endpoints omit refresh_token — keep previous when unchanged
        const nextRefresh = newRefresh || refreshToken
        tryGetStore()?.dispatch(
          updateTokens({
            accessToken,
            refreshToken: nextRefresh,
          }),
        )

        // Only touch storage when a refresh was already persisted (remember-me on / native).
        const stored = await getStoredRefreshToken()
        if (stored) {
          await setStoredRefreshToken(nextRefresh)
        }

        return accessToken
      } catch (err) {
        const normalized = normalizeAxiosError(err)
        if (normalized.status === 401) {
          await clearSessionLocally()
        }
        throw normalized
      } finally {
        refreshInFlight = null
      }
    })()
  }

  return refreshInFlight
}

export const apiClient = axios.create(API_AXIOS_CONFIG)

apiClient.interceptors.request.use((config) => {
  try {
    const token = getRootState().auth.accessToken
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    /* store not ready — omit bearer */
  }

  // Multipart: never keep instance default `application/json` Content-Type.
  const data = config.data
  const isFormData =
    typeof FormData !== 'undefined' &&
    data !== null &&
    typeof data === 'object' &&
    (data instanceof FormData ||
      (typeof (data as FormData).append === 'function' &&
        ((data as { constructor?: { name?: string } }).constructor?.name === 'FormData' ||
          Object.prototype.toString.call(data) === '[object FormData]')))

  if (isFormData && config.headers) {
    const headers = AxiosHeaders.from(config.headers)
    headers.delete('Content-Type')
    headers.delete('content-type')
    headers.set('Content-Type', false)
    config.headers = headers
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      /** Retried after a refresh — a second 401 is final. */
      _retry?: boolean
      /** Retried with an access token another refresh already stored. */
      _tokenSynced?: boolean
    }

    if (!original || !isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(normalizeAxiosError(error))
    }

    if (shouldSkipRefresh(original.url) || original._retry) {
      return Promise.reject(normalizeAxiosError(error))
    }

    // Sent with an access token that a refresh (already finished) has since replaced: retry with
    // the current one instead of rotating the refresh token again. Requests whose 401 arrives
    // while that refresh is still running see the same token here and join it below.
    const current = currentAccessToken()
    if (!original._tokenSynced && current && current !== sentAccessToken(original)) {
      original._tokenSynced = true
      original.headers = AxiosHeaders.from(original.headers)
      original.headers.Authorization = `Bearer ${current}`
      return apiClient.request(original)
    }

    let refreshToken: string | null = null
    try {
      refreshToken = selectRefreshToken(getRootState())
    } catch {
      return Promise.reject(normalizeAxiosError(error))
    }

    if (!refreshToken) {
      await clearSessionLocally()
      return Promise.reject(normalizeAxiosError(error))
    }

    try {
      const newAccess = await performRefresh(refreshToken)
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${newAccess}`
      original._retry = true
      return apiClient.request(original)
    } catch (e) {
      return Promise.reject(e)
    }
  },
)
