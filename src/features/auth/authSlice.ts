import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

/** Minimal user shape from DummyJSON login / auth/me */
export type AuthUser = {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  image?: string
}

export type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        accessToken: string
        refreshToken: string
        user?: AuthUser | null
      }>,
    ) {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      if (action.payload.user) {
        state.user = action.payload.user
      }
    },
    updateTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
    },
    logout(state) {
      state.accessToken = null
      state.refreshToken = null
      state.user = null
    },
  },
})

export const { setCredentials, updateTokens, setUser, logout } = authSlice.actions

export function selectAccessToken(state: { auth: AuthState }) {
  return state.auth.accessToken
}

export function selectRefreshToken(state: { auth: AuthState }) {
  return state.auth.refreshToken
}

export function selectAuthUser(state: { auth: AuthState }) {
  return state.auth.user
}

export function selectIsAuthenticated(state: { auth: AuthState }) {
  return state.auth.accessToken !== null
}
