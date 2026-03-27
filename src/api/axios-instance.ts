import axios, { type AxiosError, type InternalAxiosRequestConfig, isAxiosError } from 'axios'

import { refreshAuthToken } from '@/api/auth-client'
import { normalizeAxiosError } from '@/api/errors'
import { API_AXIOS_CONFIG, AUTH_SKIP_REFRESH_PATHS } from '@/configs/api'
import { logout, selectRefreshToken, updateTokens } from '@/features/auth/auth-slice'
import { getStore, tryGetStore } from '@/store/store-ref'
import type { RootStateWithAuth } from '@/store/types'

function shouldSkipRefresh(url: string | undefined): boolean {
  if (!url) return false
  return AUTH_SKIP_REFRESH_PATHS.some((p) => url.includes(p))
}

function getRootState(): RootStateWithAuth {
  return getStore().getState() as RootStateWithAuth
}

let refreshInFlight: Promise<string> | null = null

function performRefresh(refreshToken: string): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const { accessToken, refreshToken: newRefresh } = await refreshAuthToken(refreshToken)
        tryGetStore()?.dispatch(updateTokens({ accessToken, refreshToken: newRefresh }))

        return accessToken
      } catch (err) {
        const normalized = normalizeAxiosError(err)
        if (normalized.status === 401) {
          tryGetStore()?.dispatch(logout())
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
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (!original || !isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(normalizeAxiosError(error))
    }

    if (shouldSkipRefresh(original.url) || original._retry) {
      return Promise.reject(normalizeAxiosError(error))
    }

    let refreshToken: string | null = null
    try {
      refreshToken = selectRefreshToken(getRootState())
    } catch {
      return Promise.reject(normalizeAxiosError(error))
    }

    if (!refreshToken) {
      tryGetStore()?.dispatch(logout())
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
