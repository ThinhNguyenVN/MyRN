import { configureStore } from '@reduxjs/toolkit'
import type { Middleware } from '@reduxjs/toolkit'

import { authApi } from '@/features/auth/auth-api'
import { authSlice } from '@/features/auth/auth-slice'
import type { AuthUser } from '@/features/auth/auth-slice'
import { initAuthThunk, loginThunk } from '@/features/auth/auth-thunks'
import {
  getStoredRefreshToken,
  removeStoredRefreshToken,
  setStoredRefreshToken,
} from '@/features/auth/token-storage'
import { injectStore } from '@/store/store-ref'

jest.mock('@/features/auth/token-storage', () => ({
  getStoredRefreshToken: jest.fn(),
  setStoredRefreshToken: jest.fn(),
  removeStoredRefreshToken: jest.fn(),
}))

jest.mock('@/features/auth/auth-api', () => {
  const mockHandlers = {
    refresh: jest.fn(),
    getMe: jest.fn(),
    login: jest.fn(),
  }

  const initiate =
    (handler: jest.Mock) =>
    (arg?: unknown): { type: string; $$authTest: () => Promise<unknown> } => ({
      type: 'authApi/test/initiate',
      $$authTest: () => Promise.resolve(handler(arg)),
    })

  return {
    authApi: {
      endpoints: {
        refresh: { initiate: initiate(mockHandlers.refresh) },
        getMe: { initiate: initiate(mockHandlers.getMe) },
        login: { initiate: initiate(mockHandlers.login) },
      },
      __mockHandlers: mockHandlers,
    },
  }
})

const mockedGetStored = getStoredRefreshToken as jest.MockedFunction<typeof getStoredRefreshToken>
const mockedSetStored = setStoredRefreshToken as jest.MockedFunction<typeof setStoredRefreshToken>
const mockedRemoveStored = removeStoredRefreshToken as jest.MockedFunction<
  typeof removeStoredRefreshToken
>

const mockHandlers = (
  authApi as unknown as {
    __mockHandlers: {
      refresh: jest.Mock
      getMe: jest.Mock
      login: jest.Mock
    }
  }
).__mockHandlers

type TestInitiateAction = {
  type: string
  $$authTest: () => Promise<unknown>
}

const authTestMiddleware: Middleware = () => (next) => (action) => {
  if (
    typeof action === 'object' &&
    action !== null &&
    '$$authTest' in action &&
    typeof (action as TestInitiateAction).$$authTest === 'function'
  ) {
    const promise = (action as TestInitiateAction).$$authTest()
    return Object.assign(promise, { unwrap: () => promise })
  }
  return next(action)
}

function createTestStore() {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(authTestMiddleware),
  })
  injectStore(store)
  return store
}

const sampleUser: AuthUser = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Smith',
  image: 'https://example.com/avatar.png',
}

describe('initAuthThunk', () => {
  beforeEach(() => {
    mockedGetStored.mockReset()
    mockedSetStored.mockReset()
    mockedRemoveStored.mockReset()
    mockHandlers.refresh.mockReset()
    mockHandlers.getMe.mockReset()
    mockHandlers.login.mockReset()
    mockedSetStored.mockResolvedValue()
    mockedRemoveStored.mockResolvedValue()
  })

  it('returns null when no stored refresh token', async () => {
    mockedGetStored.mockResolvedValue(null)
    const store = createTestStore()

    const result = await store.dispatch(initAuthThunk())

    expect(result.payload).toBeNull()
    expect(store.getState().auth.accessToken).toBeNull()
    expect(mockHandlers.refresh).not.toHaveBeenCalled()
  })

  it('refreshes session and loads /me on cold start', async () => {
    mockedGetStored.mockResolvedValue('stored-refresh')
    mockHandlers.refresh.mockResolvedValue({
      accessToken: 'access-from-refresh',
      refreshToken: 'next-refresh',
    })
    mockHandlers.getMe.mockResolvedValue(sampleUser)
    const store = createTestStore()

    const result = await store.dispatch(initAuthThunk())

    expect(result.type).toBe('auth/initAuth/fulfilled')
    expect(store.getState().auth.accessToken).toBe('access-from-refresh')
    expect(store.getState().auth.refreshToken).toBe('next-refresh')
    expect(store.getState().auth.user?.username).toBe('emilys')
    expect(mockedSetStored).toHaveBeenCalledWith('next-refresh')
  })

  it('keeps tokens when /me fails after successful refresh', async () => {
    mockedGetStored.mockResolvedValue('stored-refresh')
    mockHandlers.refresh.mockResolvedValue({
      accessToken: 'access-from-refresh',
      refreshToken: 'next-refresh',
    })
    mockHandlers.getMe.mockRejectedValue(new Error('Unavailable'))
    const store = createTestStore()

    await store.dispatch(initAuthThunk())

    expect(store.getState().auth.accessToken).toBe('access-from-refresh')
    expect(store.getState().auth.user).toBeNull()
  })
})

describe('loginThunk remember-me', () => {
  beforeEach(() => {
    mockedGetStored.mockReset()
    mockedSetStored.mockReset()
    mockedRemoveStored.mockReset()
    mockHandlers.refresh.mockReset()
    mockHandlers.getMe.mockReset()
    mockHandlers.login.mockReset()
    mockedSetStored.mockResolvedValue()
    mockedRemoveStored.mockResolvedValue()
    mockHandlers.login.mockResolvedValue({
      id: 1,
      username: 'emilys',
      email: 'emily@example.com',
      firstName: 'Emily',
      lastName: 'Smith',
      gender: 'female',
      image: 'https://example.com/avatar.png',
      accessToken: 'access',
      refreshToken: 'refresh',
    })
  })

  it('persists refresh token when remember is true', async () => {
    const store = createTestStore()

    await store.dispatch(loginThunk({ username: 'emilys', password: 'emilyspass', remember: true }))

    expect(mockedSetStored).toHaveBeenCalledWith('refresh')
    expect(mockedRemoveStored).not.toHaveBeenCalled()
  })

  it('does not persist refresh token when remember is false', async () => {
    const store = createTestStore()

    await store.dispatch(
      loginThunk({ username: 'emilys', password: 'emilyspass', remember: false }),
    )

    expect(mockedRemoveStored).toHaveBeenCalled()
    expect(mockedSetStored).not.toHaveBeenCalled()
  })
})
