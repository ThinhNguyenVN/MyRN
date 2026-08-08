import axios, { type AxiosError, type InternalAxiosRequestConfig, isAxiosError } from 'axios'

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
        const nextRefresh = newRefresh || refreshToken
        tryGetStore()?.dispatch(updateTokens({ accessToken, refreshToken: nextRefresh }))

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
