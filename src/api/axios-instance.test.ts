import { configureStore } from '@reduxjs/toolkit'
import { http, HttpResponse } from 'msw'

import { API_BASE_URL, Endpoints } from '@/constants/api'
import { apiClient } from '@/api/axios-instance'
import { authSlice, setCredentials } from '@/features/auth/auth-slice'
import {
  getStoredRefreshToken,
  removeStoredRefreshToken,
  setStoredRefreshToken,
} from '@/features/auth/token-storage'
import { injectStore } from '@/store/store-ref'
import { server } from '@/test/server'

jest.mock('@/features/auth/token-storage', () => ({
  getStoredRefreshToken: jest.fn(),
  setStoredRefreshToken: jest.fn(),
  removeStoredRefreshToken: jest.fn(),
}))

const mockedGetStored = getStoredRefreshToken as jest.MockedFunction<typeof getStoredRefreshToken>
const mockedSetStored = setStoredRefreshToken as jest.MockedFunction<typeof setStoredRefreshToken>
const mockedRemoveStored = removeStoredRefreshToken as jest.MockedFunction<
  typeof removeStoredRefreshToken
>

const baseUrl = new URL(API_BASE_URL ?? '')
const origin = baseUrl.origin

function createTestStore() {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
  })
  injectStore(store)
  return store
}

describe('apiClient refresh token flow', () => {
  beforeEach(() => {
    mockedGetStored.mockReset()
    mockedSetStored.mockReset()
    mockedRemoveStored.mockReset()
    mockedGetStored.mockResolvedValue(null)
    mockedSetStored.mockResolvedValue()
    mockedRemoveStored.mockResolvedValue()
  })

  it('refreshes once for concurrent 401 requests and retries both', async () => {
    const store = createTestStore()
    store.dispatch(
      setCredentials({
        accessToken: 'expired-access',
        refreshToken: 'refresh-token',
        user: null,
      }),
    )

    let refreshCount = 0

    server.use(
      http.post(`${origin}${Endpoints.refresh}`, async ({ request }) => {
        const body = (await request.json()) as { refreshToken: string }
        if (body.refreshToken !== 'refresh-token') {
          return HttpResponse.json({ message: 'Unexpected refresh token' }, { status: 400 })
        }
        refreshCount += 1
        return HttpResponse.json({ accessToken: 'new-access', refreshToken: 'new-refresh' })
      }),
      http.get(`${origin}/secure`, ({ request }) => {
        const auth = request.headers.get('authorization')
        if (auth === 'Bearer new-access') {
          return HttpResponse.json({ ok: true }, { status: 200 })
        }
        return HttpResponse.json({ message: 'Token expired' }, { status: 401 })
      }),
    )

    const [a, b] = await Promise.all([apiClient.get('/secure'), apiClient.get('/secure')])

    expect(a.status).toBe(200)
    expect(b.status).toBe(200)
    expect(refreshCount).toBe(1)
    expect(store.getState().auth.accessToken).toBe('new-access')
    expect(store.getState().auth.refreshToken).toBe('new-refresh')
    // remember-me off → no prior stored token → do not write storage
    expect(mockedSetStored).not.toHaveBeenCalled()
  })

  it('persists rotated refresh token when storage already had a token', async () => {
    mockedGetStored.mockResolvedValue('refresh-token')
    const store = createTestStore()
    store.dispatch(
      setCredentials({
        accessToken: 'expired-access',
        refreshToken: 'refresh-token',
        user: null,
      }),
    )

    server.use(
      http.post(`${origin}${Endpoints.refresh}`, async () =>
        HttpResponse.json({ accessToken: 'new-access', refreshToken: 'rotated-refresh' }),
      ),
      http.get(`${origin}/secure`, ({ request }) => {
        const auth = request.headers.get('authorization')
        if (auth === 'Bearer new-access') {
          return HttpResponse.json({ ok: true }, { status: 200 })
        }
        return HttpResponse.json({ message: 'Token expired' }, { status: 401 })
      }),
    )

    await apiClient.get('/secure')

    expect(store.getState().auth.refreshToken).toBe('rotated-refresh')
    expect(mockedSetStored).toHaveBeenCalledWith('rotated-refresh')
  })

  it('logs out when refresh returns 401', async () => {
    const store = createTestStore()
    store.dispatch(
      setCredentials({
        accessToken: 'expired-access',
        refreshToken: 'invalid-refresh',
        user: null,
      }),
    )

    server.use(
      http.get(`${origin}/secure`, () =>
        HttpResponse.json({ message: 'Expired access token' }, { status: 401 }),
      ),
      http.post(`${origin}${Endpoints.refresh}`, async ({ request }) => {
        const body = (await request.json()) as { refreshToken: string }
        if (body.refreshToken !== 'invalid-refresh') {
          return HttpResponse.json({ message: 'Unexpected refresh token' }, { status: 400 })
        }
        return HttpResponse.json({ message: 'Invalid refresh token' }, { status: 401 })
      }),
    )

    await expect(apiClient.get('/secure')).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
    })

    expect(store.getState().auth.accessToken).toBeNull()
    expect(store.getState().auth.refreshToken).toBeNull()
    expect(store.getState().auth.user).toBeNull()
    expect(mockedRemoveStored).toHaveBeenCalled()
  })

  it('does not refresh infinitely when retried request still returns 401', async () => {
    const store = createTestStore()
    store.dispatch(
      setCredentials({
        accessToken: 'expired-access',
        refreshToken: 'refresh-token',
        user: null,
      }),
    )

    let refreshCount = 0

    server.use(
      http.get(`${origin}/secure`, () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
      http.post(`${origin}${Endpoints.refresh}`, async ({ request }) => {
        const body = (await request.json()) as { refreshToken: string }
        if (body.refreshToken !== 'refresh-token') {
          return HttpResponse.json({ message: 'Unexpected refresh token' }, { status: 400 })
        }
        refreshCount += 1
        return HttpResponse.json({ accessToken: 'new-access', refreshToken: 'new-refresh' })
      }),
    )

    await expect(apiClient.get('/secure')).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
    })
    expect(refreshCount).toBe(1)
  })
})
