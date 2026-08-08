import { createAsyncThunk } from '@reduxjs/toolkit'

import { normalizeAxiosError, type NormalizedApiError } from '@/api/errors'
import { authApi } from '@/features/auth/auth-api'
import { logout, setCredentials, setUser, updateTokens } from '@/features/auth/auth-slice'
import {
  getStoredRefreshToken,
  removeStoredRefreshToken,
  setStoredRefreshToken,
} from '@/features/auth/token-storage'

type LoginPayload = { username: string; password: string; remember?: boolean }

export const initAuthThunk = createAsyncThunk<
  { accessToken: string; refreshToken: string } | null,
  void,
  { rejectValue: NormalizedApiError }
>('auth/initAuth', async (_arg, { dispatch, rejectWithValue }) => {
  const refreshToken = await getStoredRefreshToken()
  if (!refreshToken) {
    return null
  }

  try {
    const data = await dispatch(authApi.endpoints.refresh.initiate({ refreshToken })).unwrap()
    const { accessToken, refreshToken: nextRefreshToken } = data
    dispatch(updateTokens({ accessToken, refreshToken: nextRefreshToken }))
    await setStoredRefreshToken(nextRefreshToken)

    try {
      const user = await dispatch(
        authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
      ).unwrap()
      dispatch(setUser(user))
    } catch {
      // Keep session even if /me fails — shell can retry later.
    }

    return { accessToken, refreshToken: nextRefreshToken }
  } catch (error) {
    const normalized = normalizeAxiosError(error)
    if (normalized.status === 401 || normalized.status === 403) {
      dispatch(logout())
      await removeStoredRefreshToken()
    }
    return rejectWithValue(normalized)
  }
})

export const loginThunk = createAsyncThunk<void, LoginPayload, { rejectValue: NormalizedApiError }>(
  'auth/login',
  async (input, { dispatch, rejectWithValue }) => {
    try {
      const data = await dispatch(
        authApi.endpoints.login.initiate({
          username: input.username,
          password: input.password,
        }),
      ).unwrap()

      dispatch(
        setCredentials({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: {
            id: data.id,
            username: data.username,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            image: data.image,
          },
        }),
      )

      if (input.remember === false) {
        await removeStoredRefreshToken()
      } else {
        await setStoredRefreshToken(data.refreshToken)
      }
    } catch (error) {
      return rejectWithValue(normalizeAxiosError(error))
    }
  },
)

export const logoutThunk = createAsyncThunk('auth/logout', async (_arg, { dispatch }) => {
  dispatch(logout())
  await removeStoredRefreshToken()
})
